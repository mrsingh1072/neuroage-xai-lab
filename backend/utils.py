"""
Utilities Module
Handles image preprocessing and model prediction logic.
"""

import torch
import numpy as np
from PIL import Image
from typing import Tuple
import logging

logger = logging.getLogger(__name__)

# Constants for image preprocessing
IMAGE_SIZE = 224
NORMALIZED_MIN_AGE = 20
NORMALIZED_MAX_AGE = 90


class ImagePreprocessor:
    """
    Handles MRI image preprocessing for model inference.
    """
    
    @staticmethod
    def load_image(image_path: str) -> Image.Image:
        """
        Load an image from file path.
        
        Args:
            image_path (str): Path to the image file
            
        Returns:
            Image.Image: Loaded PIL Image
            
        Raises:
            FileNotFoundError: If image file doesn't exist
            RuntimeError: If image loading fails
        """
        try:
            if not image_path:
                raise ValueError("Image path cannot be empty")
            
            image = Image.open(image_path)
            logger.info(f"Image loaded successfully from: {image_path}")
            return image
            
        except FileNotFoundError as e:
            error_msg = f"Image file not found: {image_path}"
            logger.error(error_msg)
            raise FileNotFoundError(error_msg) from e
        except Exception as e:
            error_msg = f"Failed to load image: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg) from e
    
    @staticmethod
    def load_image_from_bytes(image_bytes: bytes) -> Image.Image:
        """
        Load an image from bytes (useful for file uploads).
        
        Args:
            image_bytes (bytes): Image data as bytes
            
        Returns:
            Image.Image: Loaded PIL Image
            
        Raises:
            RuntimeError: If image loading fails
        """
        try:
            from io import BytesIO
            image = Image.open(BytesIO(image_bytes))
            logger.info("Image loaded successfully from bytes")
            return image
        except Exception as e:
            error_msg = f"Failed to load image from bytes: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg) from e
    
    @staticmethod
    def to_grayscale(image: Image.Image) -> Image.Image:
        """
        Convert image to grayscale.
        
        Args:
            image (Image.Image): Input PIL Image
            
        Returns:
            Image.Image: Grayscale image
        """
        if image.mode != 'L':
            image = image.convert('L')
            logger.debug("Image converted to grayscale")
        return image
    
    @staticmethod
    def resize_image(image: Image.Image, size: int = IMAGE_SIZE) -> Image.Image:
        """
        Resize image to specified dimensions.
        
        Args:
            image (Image.Image): Input PIL Image
            size (int): Target size (will be resized to size x size)
            
        Returns:
            Image.Image: Resized image
        """
        if image.size != (size, size):
            image = image.resize((size, size), Image.Resampling.LANCZOS)
            logger.debug(f"Image resized to {size}x{size}")
        return image
    
    @staticmethod
    def normalize_image(image: Image.Image) -> np.ndarray:
        """
        Normalize image to [0, 1] range and convert to numpy array.
        
        Args:
            image (Image.Image): Input PIL Image
            
        Returns:
            np.ndarray: Normalized image as numpy array
        """
        # Convert image to numpy array
        image_array = np.array(image, dtype=np.float32)
        
        # Normalize to [0, 1]
        image_array = image_array / 255.0
        
        logger.debug("Image normalized to [0, 1] range")
        return image_array
    
    @staticmethod
    def preprocess(image_path: str, size: int = IMAGE_SIZE) -> torch.Tensor:
        """
        Complete preprocessing pipeline for MRI images.
        
        Steps:
        1. Load image
        2. Convert to grayscale
        3. Resize to 224x224
        4. Normalize to [0, 1]
        5. Convert to tensor
        6. Add batch dimension
        
        Args:
            image_path (str): Path to the input image
            size (int): Target image size
            
        Returns:
            torch.Tensor: Preprocessed image tensor ready for model
        """
        try:
            logger.info(f"Starting preprocessing for image: {image_path}")
            
            # Load image
            image = ImagePreprocessor.load_image(image_path)
            
            # Convert to grayscale
            image = ImagePreprocessor.to_grayscale(image)
            
            # Resize
            image = ImagePreprocessor.resize_image(image, size)
            
            # Normalize
            image_array = ImagePreprocessor.normalize_image(image)
            
            # Convert to tensor (add channel dimension)
            image_tensor = torch.FloatTensor(image_array).unsqueeze(0)  # (1, H, W)
            
            # Add batch dimension
            image_tensor = image_tensor.unsqueeze(0)  # (1, 1, H, W)
            
            logger.info(f"Preprocessing completed. Tensor shape: {image_tensor.shape}")
            return image_tensor
            
        except Exception as e:
            error_msg = f"Preprocessing failed: {str(e)}"
            logger.error(error_msg)
            raise
    
    @staticmethod
    def preprocess_from_bytes(image_bytes: bytes, size: int = IMAGE_SIZE) -> torch.Tensor:
        """
        Preprocess image from bytes.
        
        Args:
            image_bytes (bytes): Image data as bytes
            size (int): Target image size
            
        Returns:
            torch.Tensor: Preprocessed image tensor
        """
        try:
            logger.info("Starting preprocessing for image from bytes")
            
            # Load image from bytes
            image = ImagePreprocessor.load_image_from_bytes(image_bytes)
            
            # Convert to grayscale
            image = ImagePreprocessor.to_grayscale(image)
            
            # Resize
            image = ImagePreprocessor.resize_image(image, size)
            
            # Normalize
            image_array = ImagePreprocessor.normalize_image(image)
            
            # Convert to tensor
            image_tensor = torch.FloatTensor(image_array).unsqueeze(0)
            image_tensor = image_tensor.unsqueeze(0)
            
            logger.info(f"Preprocessing completed. Tensor shape: {image_tensor.shape}")
            return image_tensor
            
        except Exception as e:
            error_msg = f"Preprocessing failed: {str(e)}"
            logger.error(error_msg)
            raise


class PredictionEngine:
    """
    Handles model prediction and age normalization.
    """
    
    @staticmethod
    def predict(model: torch.nn.Module, 
                image_tensor: torch.Tensor, 
                device: torch.device) -> float:
        """
        Run prediction on preprocessed image.
        
        Args:
            model (torch.nn.Module): Trained model in eval mode
            image_tensor (torch.Tensor): Preprocessed image tensor
            device (torch.device): Device to run prediction on
            
        Returns:
            float: Raw prediction output from model
        """
        try:
            # Move image to device
            image_tensor = image_tensor.to(device)
            
            # Forward pass with no gradient computation
            with torch.no_grad():
                output = model(image_tensor)
            
            # Extract the predicted value
            predicted_value = output.item()
            
            logger.info(f"Model prediction completed. Raw output: {predicted_value}")
            return predicted_value
            
        except Exception as e:
            error_msg = f"Prediction failed: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg) from e
    
    @staticmethod
    def denormalize_age(normalized_value: float, 
                       min_age: int = NORMALIZED_MIN_AGE,
                       max_age: int = NORMALIZED_MAX_AGE) -> float:
        """
        Convert normalized model output back to actual age.
        
        Assumes model was trained with ages normalized to [0, 1] range
        or uses sigmoid activation that outputs values in [0, 1].
        
        Args:
            normalized_value (float): Model output (typically in [0, 1])
            min_age (int): Minimum age in training data
            max_age (int): Maximum age in training data
            
        Returns:
            float: Predicted age in years
        """
        # Clip to [0, 1] range if needed
        normalized_value = max(0.0, min(1.0, normalized_value))
        
        # Scale to age range
        predicted_age = min_age + normalized_value * (max_age - min_age)
        
        logger.debug(f"Denormalized age: {predicted_age:.2f} years")
        return predicted_age
    
    @staticmethod
    def predict_age(model: torch.nn.Module,
                   image_tensor: torch.Tensor,
                   device: torch.device,
                   min_age: int = NORMALIZED_MIN_AGE,
                   max_age: int = NORMALIZED_MAX_AGE) -> float:
        """
        Complete prediction pipeline: predict and denormalize.
        
        Args:
            model (torch.nn.Module): Trained model
            image_tensor (torch.Tensor): Preprocessed image
            device (torch.device): Computation device
            min_age (int): Minimum age in training data
            max_age (int): Maximum age in training data
            
        Returns:
            float: Predicted brain age
        """
        # Get raw prediction
        raw_prediction = PredictionEngine.predict(model, image_tensor, device)
        
        # Denormalize to actual age
        predicted_age = PredictionEngine.denormalize_age(raw_prediction, min_age, max_age)
        
        return round(predicted_age, 2)
