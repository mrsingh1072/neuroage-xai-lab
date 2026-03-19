"""
Brain Age Prediction Backend API
Flask application for serving brain age predictions using CNN models on MRI images.

Title: Explainable Brain Age Prediction and Comparative Analysis Using CNN and Vision Transformer Models
Author: NeuroAge XAI Lab
"""
from vit_model import load_vit_model, predict_vit
from flask_cors import CORS
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import logging
import os
from datetime import datetime
from pathlib import Path

# Import custom modules
from model_loader import ModelLoader
from utils import ImagePreprocessor, PredictionEngine
from explainability import ExplainabilityEngine

# ============================================================================
# Configuration
# ============================================================================

# Create Flask app
app = Flask(__name__)
CORS(app)
# Configuration variables
BASE_DIR = Path(__file__).parent.parent  # Project root
BACKEND_DIR = Path(__file__).parent  # Backend directory
MODEL_PATH = os.path.join(BACKEND_DIR, "model", "model.pth")
UPLOAD_FOLDER = os.path.join(BACKEND_DIR, "uploads")
HEATMAP_FOLDER = os.path.join(BACKEND_DIR, "heatmaps")
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

# Flask configuration
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE
app.config['JSON_SORT_KEYS'] = False

# Create required directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(HEATMAP_FOLDER, exist_ok=True)

# ============================================================================
# Logging Configuration
# ============================================================================

# Setup logging
log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
logging.basicConfig(
    level=logging.INFO,
    format=log_format,
    handlers=[
        logging.FileHandler(os.path.join(BASE_DIR, 'backend.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ============================================================================
# Global Components
# ============================================================================

# Initialize model loader
try:
    model_loader = ModelLoader(MODEL_PATH)
    model = model_loader.load_model()
    device = model_loader.get_device()
    logger.info("Model loaded successfully at application startup")
except Exception as e:
    logger.error(f"Failed to load model at startup: {str(e)}")
    model = None
    device = None

# Initialize ViT model with proper error handling
vit_model_instance = None
vit_device = None
vit_status = "not_available"
vit_message = "ViT model not loaded"

try:
    logger.info("Attempting to load ViT model...")
    vit_result = load_vit_model()
    
    if vit_result['status'] == 'success' or vit_result['status'] == 'untrained':
        vit_model_instance = vit_result['model']
        vit_device = vit_result['device']
        vit_status = vit_result['status']
        vit_message = vit_result['message']
        logger.info(f"✅ ViT model initialized: {vit_message}")
    else:
        logger.warning(f"ViT model initialization failed: {vit_result['message']}")
        vit_status = 'error'
        vit_message = vit_result['message']
except Exception as e:
    logger.error(f"Failed to initialize ViT model: {str(e)}")
    vit_status = 'error'
    vit_message = str(e)

# Initialize explainability engine
try:
    if model is not None:
        explainability_engine = ExplainabilityEngine(model, device, HEATMAP_FOLDER)
        logger.info("Explainability engine initialized")
    else:
        explainability_engine = None
except Exception as e:
    logger.error(f"Failed to initialize explainability engine: {str(e)}")
    explainability_engine = None

# ============================================================================
# Helper Functions
# ============================================================================

def allowed_file(filename: str) -> bool:
    """
    Check if file extension is allowed.
    
    Args:
        filename (str): Name of the file
        
    Returns:
        bool: True if file extension is allowed, False otherwise
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_image_from_request(request_obj) -> tuple:
    """
    Extract and validate image from request.
    
    Performs comprehensive validation:
    - File presence and selection
    - File extension (must be image)
    - Rejects visualization/heatmap files (prevents accidental use as input)
    - File is not empty
    
    Args:
        request_obj: Flask request object
        
    Returns:
        tuple: (image_bytes, filename) or (None, error_message)
    """
    # Check if file is present
    if 'image' not in request_obj.files:
        return None, "No image file provided in request"
    
    file = request_obj.files['image']
    
    # Check if file is selected
    if file.filename == '':
        return None, "No file selected"
    
    # CRITICAL: Reject visualization/heatmap files to prevent accidental AI feedback loop
    # Files generated by our system should never be re-input as MRI images
    forbidden_keywords = ['heatmap', 'overlay', 'visualization', 'gradcam', 'grad_cam']
    filename_lower = file.filename.lower()
    for keyword in forbidden_keywords:
        if keyword in filename_lower:
            error_msg = f"Invalid input: File appears to be a generated visualization '{file.filename}'. Please use original MRI images only."
            logger.warning(f"Rejecting file with forbidden keyword '{keyword}': {file.filename}")
            return None, error_msg
    
    # Check file extension
    if not allowed_file(file.filename):
        return None, f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
    
    try:
        image_bytes = file.read()
        if len(image_bytes) == 0:
            return None, "Uploaded file is empty"
        
        logger.debug(f"Image file validation passed: {file.filename} ({len(image_bytes)} bytes)")
        return image_bytes, None
        
    except Exception as e:
        return None, f"Error reading file: {str(e)}"


# ============================================================================
# API Endpoints
# ============================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify API is running.
    
    Returns:
        JSON: Status information
    """
    logger.info("Health check request received")
    
    status_info = {
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": model is not None,
        "device": str(device) if device else "unknown"
    }
    
    return jsonify(status_info), 200


@app.route('/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint - returns both CNN and ViT predictions.
    
    Accepts:
        - Image file (MRI scan)
    
    Returns:
        JSON: Predicted brain ages from both CNN and ViT models
    
    Example:
        curl -X POST -F "image=@mri_scan.png" http://localhost:5000/predict
    """
    
    logger.info("=== NEW PREDICTION REQUEST ===")
    logger.info(f"Request from: {request.remote_addr}")
    logger.info(f"Request time: {datetime.now().isoformat()}")
    
    # ========================================================================
    # Step 1: Validate CNN Model
    # ========================================================================
    
    if model is None or device is None:
        error_msg = "CNN model not loaded. Cannot process prediction."
        logger.error(error_msg)
        return jsonify({
            "error": error_msg,
            "status": "error"
        }), 503  # Service Unavailable
    
    # ========================================================================
    # Step 2: Get and Validate Image from Request
    # ========================================================================
    
    image_bytes, error = get_image_from_request(request)
    if error:
        logger.warning(f"Image validation failed: {error}")
        return jsonify({
            "error": error,
            "status": "error"
        }), 400  # Bad Request
    
    # Log filename for request tracking
    filename = request.files['image'].filename if 'image' in request.files else 'unknown'
    logger.info(f"Processing image file: {filename} ({len(image_bytes)} bytes)")
    
    # ========================================================================
    # Step 3: Preprocess Image
    # ========================================================================
    
    try:
        logger.info("Starting image preprocessing...")
        image_tensor = ImagePreprocessor.preprocess_from_bytes(image_bytes)
        logger.info(f"Preprocessing successful. Tensor shape: {image_tensor.shape}")
        
    except Exception as e:
        error_msg = f"Image preprocessing failed: {str(e)}"
        logger.error(error_msg)
        return jsonify({
            "error": error_msg,
            "status": "error",
            "details": str(e)
        }), 400
    
    # ========================================================================
    # Step 4: Run CNN Prediction
    # ========================================================================
    
    cnn_result = {
        "predicted_age": None,
        "confidence": "unknown",
        "status": "failed"
    }
    
    try:
        logger.info("Running CNN model inference...")
        cnn_predicted_age = PredictionEngine.predict_age(
            model=model,
            image_tensor=image_tensor,
            device=device,
            min_age=20,
            max_age=90
        )
        logger.info(f"CNN prediction successful: {cnn_predicted_age} years")
        cnn_result["predicted_age"] = round(cnn_predicted_age, 1)
        cnn_result["status"] = "success"
        cnn_result["confidence"] = "high"  # Default confidence
        
    except Exception as e:
        error_msg = f"CNN prediction failed: {str(e)}"
        logger.error(error_msg)
        cnn_result["status"] = "failed"
        cnn_result["error"] = str(e)
    
    # ========================================================================
    # Step 5: Run ViT Prediction (optional, non-blocking)
    # ========================================================================
    
    vit_result = {
        "predicted_age": None,
        "confidence": "unknown",
        "status": "not_available"
    }
    
    if vit_model_instance is not None:
        try:
            logger.info("Running ViT model inference...")
            
            # Convert grayscale to RGB for ViT
            image_tensor_vit = image_tensor.clone()
            if image_tensor_vit.shape[1] == 1:
                image_tensor_vit = image_tensor_vit.repeat(1, 3, 1, 1)
            
            vit_age, vit_confidence = predict_vit(
                model=vit_model_instance,
                image_tensor=image_tensor_vit,
                device=vit_device,
                min_age=20,
                max_age=90
            )
            
            logger.info(f"ViT prediction successful: {vit_age} years (confidence: {vit_confidence})")
            vit_result["predicted_age"] = round(vit_age, 1)
            vit_result["status"] = "success"
            vit_result["confidence"] = vit_confidence
            
        except Exception as e:
            logger.error(f"ViT prediction failed: {str(e)}")
            vit_result["status"] = "failed"
            vit_result["error"] = str(e)
    else:
        logger.warning(f"ViT model not available. Status: {vit_status}")
        vit_result["status"] = "not_available"
        vit_result["message"] = vit_message
    
    # ========================================================================
    # Step 6: Generate Explanation with Grad-CAM Heatmap (CNN only)
    # ========================================================================
    
    explanation = None
    try:
        if explainability_engine and cnn_result["status"] == "success":
            logger.info("Generating explanation with Grad-CAM...")
            logger.debug(f"Input image tensor shape: {image_tensor.shape}")
            
            # Get raw model output for confidence scoring
            raw_output = PredictionEngine.predict(model, image_tensor, device)
            logger.debug(f"Raw model output: {raw_output}")
            
            # Extract original image from tensor for heatmap overlay
            original_image = image_tensor[0, 0].cpu().numpy()
            if original_image.max() > 1:
                original_image = original_image / 255.0
            logger.debug(f"Original image shape: {original_image.shape}")
            
            # Generate explanation
            explanation = explainability_engine.explain_prediction(
                image_tensor=image_tensor,
                predicted_age=cnn_result["predicted_age"],
                model_output=raw_output,
                original_image=original_image,
                save_visualization=True
            )
            
            if explanation:
                logger.info(f"Explanation generated successfully")
            else:
                logger.warning("explain_prediction returned None")
        else:
            logger.warning("Explainability engine unavailable or CNN prediction failed")
    except Exception as e:
        logger.error(f"Explanation generation failed: {str(e)}", exc_info=True)
        explanation = None
    
    # ========================================================================
    # Step 7: Build Unified Response
    # ========================================================================
    
    # Calculate difference if both models succeeded
    difference = None
    if cnn_result["status"] == "success" and vit_result["status"] == "success":
        difference = abs(cnn_result["predicted_age"] - vit_result["predicted_age"])
    
    response_data = {
        "status": "success" if cnn_result["status"] == "success" else "partial",
        "timestamp": datetime.now().isoformat(),
        "cnn": cnn_result,
        "vit": vit_result,
        "comparison": {
            "difference": round(difference, 1) if difference is not None else None,
            "better_confidence": None
        }
    }
    
    # Determine which model has better confidence
    if cnn_result["status"] == "success" and vit_result["status"] == "success":
        confidence_order = {'high': 3, 'medium': 2, 'low': 1, 'unknown': 0}
        cnn_conf = confidence_order.get(cnn_result.get("confidence", "unknown"), 0)
        vit_conf = confidence_order.get(vit_result.get("confidence", "unknown"), 0)
        
        if cnn_conf > vit_conf:
            response_data["comparison"]["better_confidence"] = "cnn"
        elif vit_conf > cnn_conf:
            response_data["comparison"]["better_confidence"] = "vit"
        else:
            response_data["comparison"]["better_confidence"] = "equal"
    
    # Add explanation if available
    if explanation:
        response_data["explanation"] = explanation
    
    logger.info(f"Unified response prepared: CNN={cnn_result['status']}, ViT={vit_result['status']}")
    logger.info("=== END PREDICTION REQUEST ===\n")
    
    return jsonify(response_data), 200


@app.route('/predict-vit', methods=['POST'])
def predict_vit_route():
    """
    Deprecated: Use /predict instead for both CNN and ViT predictions.
    This endpoint is kept for backward compatibility.
    """
    logger.warning("Deprecated endpoint /predict-vit called. Use /predict instead.")
    
    if vit_model_instance is None:
        return jsonify({
            "status": vit_status,
            "message": vit_message,
            "error": "ViT model not available"
        }), 503

    image_bytes, error = get_image_from_request(request)
    if error:
        return jsonify({
            "status": "error",
            "error": error
        }), 400

    try:
        image_tensor = ImagePreprocessor.preprocess_from_bytes(image_bytes)
        
        # Convert grayscale to RGB for ViT
        image_tensor = image_tensor.repeat(1, 3, 1, 1).float()
        
        # Run ViT prediction
        vit_age, vit_confidence = predict_vit(
            model=vit_model_instance,
            image_tensor=image_tensor,
            device=vit_device,
            min_age=20,
            max_age=90
        )

        return jsonify({
            "status": "success",
            "predicted_age": round(vit_age, 1),
            "confidence": vit_confidence
        }), 200

    except Exception as e:
        logger.error(f"ViT prediction error: {str(e)}", exc_info=True)
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """
    Batch prediction endpoint for multiple images.
    
    Accepts:
        - Multiple image files
    
    Returns:
        JSON: Array of predictions with optional explanations
    
    Note: Grad-CAM heatmaps not generated for batch to improve performance.
    """
    
    logger.info("Batch prediction request received")
    
    if model is None or device is None:
        return jsonify({
            "error": "Model not loaded",
            "status": "error"
        }), 503
    
    if 'images' not in request.files:
        return jsonify({
            "error": "No images provided",
            "status": "error"
        }), 400
    
    files = request.files.getlist('images')
    
    if len(files) == 0:
        return jsonify({
            "error": "No files selected",
            "status": "error"
        }), 400
    
    predictions = []
    errors = []
    
    for idx, file in enumerate(files):
        try:
            if not allowed_file(file.filename):
                errors.append({
                    "file_index": idx,
                    "filename": file.filename,
                    "error": "Invalid file type"
                })
                continue
            
            image_bytes = file.read()
            image_tensor = ImagePreprocessor.preprocess_from_bytes(image_bytes)
            
            # Get prediction
            predicted_age = PredictionEngine.predict_age(
                model=model,
                image_tensor=image_tensor,
                device=device,
                min_age=20,
                max_age=90
            )
            
            # Get raw output for confidence
            raw_output = PredictionEngine.predict(model, image_tensor, device)
            
            # Calculate confidence (lightweight)
            if explainability_engine:
                confidence = explainability_engine.calculate_confidence(
                    raw_output, predicted_age
                )
            else:
                confidence = {"score": 0.5, "level": "Unknown"}
            
            predictions.append({
                "file_index": idx,
                "filename": file.filename,
                "predicted_age": round(predicted_age, 1),
                "confidence": confidence["level"],
                "confidence_score": confidence.get("score", 0.5),
                "status": "success"
            })
            
        except Exception as e:
            errors.append({
                "file_index": idx,
                "filename": file.filename,
                "error": str(e)
            })
    
    response_data = {
        "total_files": len(files),
        "successful_predictions": len(predictions),
        "failed_predictions": len(errors),
        "predictions": predictions,
        "errors": errors if errors else None,
        "timestamp": datetime.now().isoformat(),
        "note": "Grad-CAM heatmaps not generated for batch mode. Use /predict for single image explanations."
    }
    
    logger.info(f"Batch prediction completed. Success: {len(predictions)}, Failed: {len(errors)}")
    
    return jsonify(response_data), 200


@app.route('/model/info', methods=['GET'])
def model_info():
    """
    Get information about the loaded model.
    
    Returns:
        JSON: Model metadata and configuration
    """
    logger.info("Model info request received")
    
    info = {
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
        "device": str(device) if device else "unknown",
        "model_file_exists": os.path.exists(MODEL_PATH),
        "input_shape": [1, 1, 224, 224],
        "output_shape": [1, 1],
        "expected_input": "Grayscale MRI image (224x224)",
        "output_range": "0.0 to 1.0 (normalized age)",
        "age_range": "20 to 90 years",
        "timestamp": datetime.now().isoformat()
    }
    
    return jsonify(info), 200


# ============================================================================
# Error Handlers
# ============================================================================

@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle file too large errors."""
    logger.warning(f"File too large error: {error}")
    return jsonify({
        "error": f"File too large. Maximum size: {MAX_FILE_SIZE / (1024*1024):.0f} MB",
        "status": "error"
    }), 413


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        "error": "Endpoint not found",
        "status": "error"
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {error}")
    return jsonify({
        "error": "Internal server error",
        "status": "error"
    }), 500


# ============================================================================
# Application Entry Point
# ============================================================================

if __name__ == '__main__':
    logger.info("=" * 80)
    logger.info("Starting Brain Age Prediction API")
    logger.info(f"Model path: {MODEL_PATH}")
    logger.info(f"Upload folder: {UPLOAD_FOLDER}")
    logger.info(f"Device: {device}")
    logger.info("=" * 80)
    
    # Run Flask app
    # For production, use a WSGI server like Gunicorn or uWSGI
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,
        threaded=True
    )
