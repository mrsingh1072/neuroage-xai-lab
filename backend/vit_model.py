"""
Vision Transformer (ViT) Module
Handles loading pretrained ViT model and brain age prediction.
"""

import torch
import torch.nn as nn
import timm
import os
import logging

logger = logging.getLogger(__name__)

# Constants
VIT_MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "vit_model.pth")
VIT_PRETRAINED_ARCHITECTURE = 'vit_base_patch16_224'
NORMALIZED_MIN_AGE = 20
NORMALIZED_MAX_AGE = 90


class ViTRegressor(nn.Module):
    """
    Vision Transformer Model for Brain Age Prediction.
    Uses pretrained ViT base model with regression head.
    """
    
    def __init__(self, model_name: str = VIT_PRETRAINED_ARCHITECTURE):
        """
        Initialize ViT regressor.
        
        Args:
            model_name (str): Name of the pretrained ViT model from timm
        """
        super(ViTRegressor, self).__init__()
        
        try:
            # Load pretrained ViT from timm
            self.vit = timm.create_model(model_name, pretrained=True)
            
            # Get input features to the head
            in_features = self.vit.head.in_features
            
            # Replace classification head with regression head (output single value)
            self.vit.head = nn.Linear(in_features, 1)
            
            logger.info(f"ViTRegressor initialized with {model_name}")
            
        except Exception as e:
            logger.error(f"Failed to initialize ViTRegressor: {str(e)}")
            raise
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass through ViT.
        
        Args:
            x (torch.Tensor): Input image tensor (B, 3, 224, 224)
            
        Returns:
            torch.Tensor: Predicted normalized age (B, 1)
        """
        return self.vit(x)


def load_vit_model(model_path: str = VIT_MODEL_PATH) -> dict:
    """
    Load the ViT model for brain age prediction.
    
    Attempts to load trained weights from file.
    If weights not found, returns untrained model (for development/testing).
    
    Args:
        model_path (str): Path to the trained ViT model weights
        
    Returns:
        dict: {
            'model': Loaded PyTorch model in eval mode,
            'status': 'success' or 'untrained',
            'device': torch.device,
            'message': Status message
        }
    """
    try:
        # Determine device
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Loading ViT model on device: {device}")
        
        # Create model architecture
        model = ViTRegressor(VIT_PRETRAINED_ARCHITECTURE)
        model.to(device)
        model.eval()
        
        # Try to load trained weights
        if os.path.exists(model_path):
            try:
                logger.info(f"Loading ViT weights from: {model_path}")
                checkpoint = torch.load(model_path, map_location=device)
                
                # Handle different checkpoint formats
                if isinstance(checkpoint, dict):
                    if 'model_state_dict' in checkpoint:
                        model.load_state_dict(checkpoint['model_state_dict'])
                    elif 'state_dict' in checkpoint:
                        model.load_state_dict(checkpoint['state_dict'])
                    else:
                        model.load_state_dict(checkpoint)
                else:
                    model.load_state_dict(checkpoint)
                
                logger.info("✅ ViT model loaded with trained weights")
                return {
                    'model': model,
                    'status': 'success',
                    'device': device,
                    'message': 'ViT model loaded successfully with trained weights',
                    'weights_loaded': True
                }
                
            except Exception as e:
                logger.warning(f"Could not load ViT weights: {str(e)}")
                logger.info("Using pretrained ViT without fine-tuned weights")
                return {
                    'model': model,
                    'status': 'untrained',
                    'device': device,
                    'message': 'ViT model loaded but weights not available. Using pretrained only.',
                    'weights_loaded': False
                }
        else:
            logger.warning(f"ViT weights file not found at {model_path}")
            logger.info("Using pretrained ViT model (transfer learning)")
            return {
                'model': model,
                'status': 'untrained',
                'device': device,
                'message': 'ViT model loaded (pretrained, not fine-tuned)',
                'weights_loaded': False
            }
            
    except Exception as e:
        logger.error(f"Failed to load ViT model: {str(e)}")
        return {
            'model': None,
            'status': 'error',
            'device': None,
            'message': f'Error loading ViT model: {str(e)}',
            'weights_loaded': False
        }


def predict_vit(
    model: nn.Module,
    image_tensor: torch.Tensor,
    device: torch.device,
    min_age: int = NORMALIZED_MIN_AGE,
    max_age: int = NORMALIZED_MAX_AGE
) -> tuple:
    """
    Run ViT inference and convert output to real age.
    
    Args:
        model (nn.Module): Loaded ViT model
        image_tensor (torch.Tensor): Preprocessed image (B, 3, 224, 224)
        device (torch.device): Device to run inference on
        min_age (int): Minimum age for denormalization
        max_age (int): Maximum age for denormalization
        
    Returns:
        tuple: (predicted_age, confidence_level_string)
    """
    try:
        if model is None:
            raise ValueError("Model is None")
        
        # Ensure image is on correct device and has correct shape
        image_tensor = image_tensor.to(device).float()
        
        # Ensure 3-channel input for ViT
        if image_tensor.shape[1] == 1:
            image_tensor = image_tensor.repeat(1, 3, 1, 1)
        
        logger.debug(f"ViT input tensor shape: {image_tensor.shape}")
        
        # Run inference
        with torch.no_grad():
            raw_output = model(image_tensor)
        
        # Extract scalar value
        normalized_age = raw_output.squeeze().item()
        logger.debug(f"Raw ViT output (normalized): {normalized_age}")
        
        # Denormalize: convert from [0, 1] to [min_age, max_age]
        predicted_age = normalized_age * (max_age - min_age) + min_age
        logger.info(f"Predicted age (denormalized): {predicted_age:.2f} years")
        
        # Determine confidence level based on how close output was to [0, 1]
        confidence_level = _get_confidence_level(normalized_age)
        
        return predicted_age, confidence_level
        
    except Exception as e:
        logger.error(f"Error in ViT prediction: {str(e)}")
        raise


def _get_confidence_level(normalized_output: float) -> str:
    """
    Determine confidence level based on model output.
    
    Args:
        normalized_output (float): Model output in [0, 1] range
        
    Returns:
        str: Confidence level ('low', 'medium', 'high')
    """
    # Confidence is higher when output is clearly within valid range
    # and not near the boundaries
    distance_from_center = abs(normalized_output - 0.5)
    
    if distance_from_center < 0.15:
        return 'high'
    elif distance_from_center < 0.35:
        return 'medium'
    else:
        return 'low'