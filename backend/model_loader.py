"""
Model Loader Module
Handles loading and initializing the trained PyTorch CNN model.
"""

import torch
import torch.nn as nn
import os
import logging

logger = logging.getLogger(__name__)


class ModelLoader:
    """
    Manages loading and initialization of the PyTorch model.
    Supports CPU inference and ensures proper model state.
    """
    
    def __init__(self, model_path: str):
        """
        Initialize the model loader.
        
        Args:
            model_path (str): Path to the trained model (.pth file)
        """
        self.model_path = model_path
        self.device = self._get_device()
        self.model = None
        
    def _get_device(self) -> torch.device:
        """
        Determine the optimal device for inference (GPU if available, else CPU).
        
        Returns:
            torch.device: The device to use for inference
        """
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {device}")
        return device
    
    def load_model(self) -> nn.Module:
        """
        Load the trained model from disk.
        Automatically detects if checkpoint contains full model or just weights.
        
        Returns:
            nn.Module: Loaded PyTorch model in evaluation mode
            
        Raises:
            FileNotFoundError: If model file doesn't exist
            RuntimeError: If model loading fails
        """
        if not os.path.exists(self.model_path):
            error_msg = f"Model file not found at: {self.model_path}"
            logger.error(error_msg)
            raise FileNotFoundError(error_msg)
        
        try:
            logger.info(f"Loading model from: {self.model_path}")
            
            # Load the checkpoint
            checkpoint = torch.load(self.model_path, map_location=self.device)
            logger.debug(f"Checkpoint type: {type(checkpoint)}")
            
            # Strategy 1: Check if checkpoint contains the full model
            if isinstance(checkpoint, nn.Module):
                logger.info("Loading full model from checkpoint")
                self.model = checkpoint
            
            # Strategy 2: Check if checkpoint is a dict with 'model' key (common in training scripts)
            elif isinstance(checkpoint, dict) and 'model' in checkpoint:
                logger.info("Loading model from checkpoint['model']")
                model_state = checkpoint['model']
                
                # If it's a full model (not just state_dict)
                if isinstance(model_state, nn.Module):
                    self.model = model_state
                else:
                    # It's a state dict, need to create architecture first
                    self.model = self._create_model_architecture()
                    self.model.load_state_dict(model_state)
            
            # Strategy 3: Check if it's a direct state_dict
            elif isinstance(checkpoint, dict) and 'features.0.weight' in checkpoint:
                logger.info("Loading state_dict from checkpoint")
                self.model = self._create_model_architecture()
                self.model.load_state_dict(checkpoint)
            
            # Strategy 4: If it's a dict but looks like a specialized checkpoint
            elif isinstance(checkpoint, dict):
                logger.info("Attempting to load from dict checkpoint")
                # Try 'state_dict' key
                if 'state_dict' in checkpoint:
                    state_dict = checkpoint['state_dict']
                else:
                    # Try to use the whole dict as state_dict
                    state_dict = checkpoint
                
                self.model = self._create_model_architecture()
                try:
                    self.model.load_state_dict(state_dict, strict=False)
                    logger.warning("Model loaded with strict=False (some weights may not match)")
                except Exception as e:
                    logger.error(f"Failed with strict=False: {str(e)}")
                    self.model.load_state_dict(state_dict, strict=True)
            
            # Strategy 5: Assume it's directly a state dict
            else:
                logger.info("Treating checkpoint as state_dict")
                self.model = self._create_model_architecture()
                self.model.load_state_dict(checkpoint)
            
            # Set to evaluation mode
            self.model.eval()
            
            # Move model to device
            self.model.to(self.device)
            
            logger.info("Model loaded successfully and set to evaluation mode")
            return self.model
            
        except Exception as e:
            error_msg = f"Failed to load model: {str(e)}\n\nTroubleshooting:\n1. Ensure your model.pth matches the expected architecture\n2. If trained with a custom model class, please modify _create_model_architecture() to match\n3. Check the model was saved correctly with torch.save()"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
    
    def _create_model_architecture(self) -> nn.Module:
        """
        Create the model architecture.
        Modify this method based on your actual CNN architecture.
        
        Returns:
            nn.Module: Model with the appropriate architecture
        """
        # Example: Simple CNN for brain age prediction
        # Replace this with your actual model architecture
        model = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            nn.Conv2d(32, 64, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            nn.Conv2d(64, 128, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            nn.Conv2d(128, 256, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten(),
            
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.5),
            
            nn.Linear(128, 1)
        )
        return model
    
    def get_model(self) -> nn.Module:
        """
        Get the loaded model. Load if not already loaded.
        
        Returns:
            nn.Module: The trained model
        """
        if self.model is None:
            self.load_model()
        return self.model
    
    def get_device(self) -> torch.device:
        """
        Get the device being used for inference.
        
        Returns:
            torch.device: The device (CPU or GPU)
        """
        return self.device
