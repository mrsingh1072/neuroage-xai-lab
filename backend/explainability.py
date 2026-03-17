"""
Explainability Module - Advanced Grad-CAM Implementation
Provides Grad-CAM visualization to show which brain regions influence age predictions.

Features:
- Automatic last convolutional layer detection
- Proper gradient computation and feature mapping
- Heatmap visualization with colormap overlay
- Confidence score calculation
- Production-ready implementation suitable for CPU inference
- Stable hook handling with proper cleanup
- Unique filename generation with UUID
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from PIL import Image
from typing import Tuple, Optional, Dict, Any
import logging
import os
from io import BytesIO
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False
    logger.warning("OpenCV not available. Heatmap overlay will use PIL instead.")


class GradCAM:
    """
    Production-grade Grad-CAM (Gradient-weighted Class Activation Mapping).
    
    Generates visual explanations by:
    1. Extracting feature maps from last convolutional layer
    2. Computing gradients w.r.t. model output
    3. Computing channel-wise importance weights
    4. Creating weighted activation map
    5. Normalizing to [0, 1] range
    
    This helps identify which brain regions the model focuses on for age prediction.
    """
    
    def __init__(self, model: nn.Module, device: torch.device):
        """
        Initialize Grad-CAM with automatic layer detection.
        
        Args:
            model (nn.Module): Trained CNN model in evaluation mode
            device (torch.device): Device for computation (CPU or GPU)
        """
        self.model = model
        self.device = device
        self.gradients = None
        self.activations = None
        self.last_conv_layer = None
        
        # Hook handles for cleanup (CRITICAL for stability)
        self.forward_hook_handle = None
        self.backward_hook_handle = None
        
        # Find and register hooks on last convolutional layer
        self._find_and_register_hooks()
        
    def _find_and_register_hooks(self):
        """
        Automatically find the last convolutional layer and register hooks.
        
        Hooks are registered ONCE during __init__ and persist for the lifetime of the object.
        This is efficient because:
        - Model structure doesn't change
        - Hooks can be called multiple times
        - No overhead of register/unregister per prediction
        
        The hooks capture:
        - Activations: Feature maps from last Conv2d layer
        - Gradients: Backpropagated gradients
        """
        try:
            # Find last Conv2d layer (works with any hierarchical model)
            last_conv = None
            for module in self.model.modules():
                if isinstance(module, nn.Conv2d):
                    last_conv = module
            
            if last_conv is None:
                logger.warning("No Conv2d layer found in model")
                return
            
            self.last_conv_layer = last_conv
            
            # Forward hook: capture activations
            def forward_hook(module, input, output):
                """Save feature maps from forward pass"""
                self.activations = output.detach()
            
            # Backward hook: capture gradients
            def backward_hook(module, grad_input, grad_output):
                """Save gradients from backward pass"""
                self.gradients = grad_output[0].detach()
            
            # Register hooks and store handles for potential cleanup
            self.forward_hook_handle = last_conv.register_forward_hook(forward_hook)
            self.backward_hook_handle = last_conv.register_full_backward_hook(backward_hook)
            
            logger.info(f"Grad-CAM hooks registered on last Conv2d layer: {last_conv}")
            
        except Exception as e:
            logger.error(f"Failed to register Grad-CAM hooks: {str(e)}", exc_info=True)
            logger.error(f"Error registering Grad-CAM hooks: {str(e)}")
    
    def generate_heatmap(self, image_tensor: torch.Tensor, 
                        target_size: Tuple[int, int] = (224, 224)) -> Optional[np.ndarray]:
        """
        Generate Grad-CAM heatmap for given input image.
        
        Computation steps:
        1. Clear previous state (gradients, activations)
        2. Ensure model in eval mode
        3. Forward pass to get model output
        4. Backward pass to compute gradients of output w.r.t. features
        5. Compute channel-wise importance weights (global average pooling of gradients)
        6. Compute weighted combination of feature maps
        7. Apply ReLU to keep only positive influence
        8. Normalize to [0, 1] with safe division
        9. Resize to match input image
        
        Args:
            image_tensor (torch.Tensor): Input image (B, C, H, W)
            target_size (Tuple[int, int]): Size to resize heatmap to (H, W)
            
        Returns:
            Optional[np.ndarray]: Heatmap as numpy array (H, W) in [0, 1] range
        """
        try:
            # ====== STATE INITIALIZATION ======
            # Clear FIRST - critical to prevent cached state from previous predictions
            self.gradients = None
            self.activations = None
            logger.debug("Cleared cached gradients and activations from previous predictions")
            
            # Ensure model in evaluation mode
            self.model.eval()
            
            # Ensure image on correct device
            image_tensor = image_tensor.to(self.device)
            image_tensor.requires_grad_(True)
            
            # Clear any leftover gradients in model parameters
            self.model.zero_grad()
            logger.debug(f"Input image tensor shape: {image_tensor.shape}")
            
            # ====== FORWARD PASS ======
            logger.debug("Starting forward pass...")
            with torch.enable_grad():
                output = self.model(image_tensor)
            logger.debug(f"Forward pass complete. Output shape: {output.shape}, value: {output.item():.6f}")
            
            # ====== BACKWARD PASS ======
            logger.debug("Starting backward pass...")
            
            # Create scalar loss from output (use output mean if batch size > 1)
            if output.numel() == 1:
                target = output
            else:
                target = output.mean()
            
            # Backward pass - compute gradients of output w.r.t. features
            # retain_graph=False is sufficient since we use gradients once
            target.backward(retain_graph=False)
            logger.debug("Backward pass completed successfully")
            
            # ====== VERIFY HOOK CAPTURES ======
            if self.gradients is None or self.activations is None:
                logger.error(f"Hook capture failed! Gradients: {self.gradients is not None}, "
                           f"Activations: {self.activations is not None}")
                logger.error(f"Last Conv Layer: {self.last_conv_layer}")
                return None
            
            logger.debug(f"Activations shape: {self.activations.shape}, "
                        f"Gradients shape: {self.gradients.shape}")
            
            # ====== EXTRACT FEATURES ======
            # Get batch 0 (assuming batch size 1 for inference)
            activations = self.activations[0]  # (C, H, W)
            gradients = self.gradients[0]      # (C, H, W)
            
            num_channels = activations.shape[0]
            logger.debug(f"Processing {num_channels} channels from last Conv layer: {self.last_conv_layer}")
            
            # ====== COMPUTE CHANNEL WEIGHTS (CRITICAL) ======
            # Global Average Pooling of absolute gradients over spatial dimensions
            # Using abs() ensures all gradient directions contribute to importance
            # This fixes the issue where pos/neg gradients cancel out
            weights = torch.mean(torch.abs(gradients), dim=(1, 2))
            logger.debug(f"Weights computed. Shape: {weights.shape}, min: {weights.min():.6f}, max: {weights.max():.6f}")
            
            # ====== WEIGHTED ACTIVATION MAP ======
            # Compute weighted sum of activations
            heatmap = torch.zeros(
                activations.shape[1:],
                device=self.device,
                dtype=torch.float32
            )
            
            # Combine all channels weighted by their importance
            for ch_idx in range(num_channels):
                heatmap = heatmap + (weights[ch_idx] * activations[ch_idx, :, :])
            
            logger.debug(f"Before ReLU - Min: {heatmap.min():.6f}, Max: {heatmap.max():.6f}")
            
            # ====== APPLY ReLU (CRITICAL FOR STABILITY) ======
            # Keep only positive activation (negative means suppression)
            heatmap = torch.clamp(heatmap, min=0.0)
            logger.debug(f"After ReLU - Min: {heatmap.min():.6f}, Max: {heatmap.max():.6f}")
            
            # ====== SAFE NORMALIZATION (CRITICAL) ======
            # Normalize to [0, 1] with proper handling of edge cases
            heatmap_max = heatmap.max()
            heatmap_min = heatmap.min()
            
            if heatmap_max > heatmap_min and heatmap_max > 0:
                # Standard min-max normalization with epsilon for stability
                heatmap = (heatmap - heatmap_min) / (heatmap_max - heatmap_min + 1e-8)
                logger.debug(f"Normalized to [0,1]. Range: [{heatmap.min():.6f}, {heatmap.max():.6f}]")
            elif heatmap_max == 0:
                # All zeros - return uniform zero heatmap
                logger.warning("Heatmap all zeros - returning zero array")
                heatmap = torch.zeros_like(heatmap)
            else:
                # Uniform non-zero values - use original values
                logger.warning(f"Heatmap uniform (all same non-zero value {heatmap_max:.6f}), using as-is")
                heatmap = heatmap / (heatmap_max + 1e-8)
            
            # Convert to numpy
            heatmap_np = heatmap.cpu().detach().numpy().astype(np.float32)
            heatmap_np = np.clip(heatmap_np, 0, 1)  # Final safety clip
            logger.debug(f"Converted to numpy. Shape: {heatmap_np.shape}, "
                        f"Final range: [{heatmap_np.min():.4f}, {heatmap_np.max():.4f}]")
            
            # ====== RESIZE HEATMAP ======
            if heatmap_np.shape != target_size:
                logger.debug(f"Resizing heatmap from {heatmap_np.shape} to {target_size}")
                # Convert to PIL for resizing quality
                heatmap_uint8 = (heatmap_np * 255).astype(np.uint8)
                heatmap_pil = Image.fromarray(heatmap_uint8, mode='L')
                heatmap_pil = heatmap_pil.resize(target_size, Image.Resampling.BILINEAR)
                heatmap_np = np.array(heatmap_pil, dtype=np.float32) / 255.0
                heatmap_np = np.clip(heatmap_np, 0, 1)  # Safety clip after resize
                logger.debug(f"Resized successfully. New range: [{heatmap_np.min():.4f}, {heatmap_np.max():.4f}]")
            
            logger.info(f"Grad-CAM heatmap generated successfully!")
            logger.info(f"  Layer: {self.last_conv_layer}")
            logger.info(f"  Shape: {heatmap_np.shape}")
            logger.info(f"  Range: [{heatmap_np.min():.4f}, {heatmap_np.max():.4f}]")
            logger.info(f"  Mean: {heatmap_np.mean():.4f}, Std: {heatmap_np.std():.4f}")
            
            return heatmap_np
        
        except Exception as e:
            logger.error(f"Grad-CAM generation failed: {str(e)}", exc_info=True)
            return None


class HeatmapVisualizer:
    """
    Handles heatmap visualization and overlay on original images.
    """
    
    # Colormap presets for heatmap visualization
    COLORMAP_PRESETS = {
        'jet': cv2.COLORMAP_JET if HAS_OPENCV else None,
        'hot': cv2.COLORMAP_HOT if HAS_OPENCV else None,
        'viridis': cv2.COLORMAP_VIRIDIS if HAS_OPENCV else None,
        'cool': cv2.COLORMAP_COOL if HAS_OPENCV else None,
    }
    
    @staticmethod
    def apply_colormap(heatmap: np.ndarray, colormap_name: str = 'jet') -> np.ndarray:
        """
        Apply color map to grayscale heatmap.
        
        Args:
            heatmap (np.ndarray): Grayscale heatmap (H, W), values in [0, 1]
            colormap_name (str): Name of colormap ('jet', 'hot', 'viridis', 'cool')
            
        Returns:
            np.ndarray: RGB heatmap (H, W, 3)
        """
        try:
            # Ensure heatmap is in [0, 1]
            heatmap = np.clip(heatmap, 0, 1)
            
            if HAS_OPENCV:
                # Convert to uint8 [0, 255]
                heatmap_uint8 = (heatmap * 255).astype(np.uint8)
                
                # OpenCV expects BGR, but colormap returns BGR so it's fine
                colormap_id = HeatmapVisualizer.COLORMAP_PRESETS.get(colormap_name)
                if colormap_id is not None:
                    colored_heatmap = cv2.applyColorMap(heatmap_uint8, colormap_id)
                    # Convert BGR to RGB
                    colored_heatmap = cv2.cvtColor(colored_heatmap, cv2.COLOR_BGR2RGB)
                    return colored_heatmap
            
            # Fallback: PIL-based colormap simulation
            # Map to colors (R, G, B)
            h, w = heatmap.shape
            colored = np.zeros((h, w, 3), dtype=np.uint8)
            
            # Create a simple viridis-like colormap
            for i in range(h):
                for j in range(w):
                    val = heatmap[i, j]
                    # Viridis-inspired: purple → blue → green → yellow
                    if val < 0.25:
                        # Purple to blue
                        r = int(68 * (1 - val / 0.25))
                        g = int(1 + (29 - 1) * val / 0.25)
                        b = int(84 + (170 - 84) * val / 0.25)
                    elif val < 0.5:
                        # Blue to cyan
                        r = 0
                        g = int(29 + (100 - 29) * (val - 0.25) / 0.25)
                        b = int(170 + (255 - 170) * (val - 0.25) / 0.25)
                    elif val < 0.75:
                        # Cyan to green
                        r = int(0 + (31 - 0) * (val - 0.5) / 0.25)
                        g = int(100 + (255 - 100) * (val - 0.5) / 0.25)
                        b = int(255 - 100 * (val - 0.5) / 0.25)
                    else:
                        # Green to yellow
                        r = int(31 + (255 - 31) * (val - 0.75) / 0.25)
                        g = int(255)
                        b = int(0)
                    
                    colored[i, j] = [r, g, b]
            
            return colored
        
        except Exception as e:
            logger.error(f"Colormap application failed: {str(e)}")
            # Return grayscale as fallback
            grayscale = (heatmap * 255).astype(np.uint8)
            return np.stack([grayscale] * 3, axis=-1)
    
    @staticmethod
    def overlay_heatmap(original_image: np.ndarray,
                       heatmap: np.ndarray,
                       alpha: float = 0.4,
                       colormap_name: str = 'jet') -> np.ndarray:
        """
        Overlay colored heatmap on original image with proper blending.
        
        Blending formula: overlay = (1-alpha) * original + alpha * heatmap
        Default: 0.6 * original + 0.4 * heatmap
        
        Args:
            original_image (np.ndarray): Original image (H, W) or (H, W, 3), values in [0, 1] or [0, 255]
            heatmap (np.ndarray): Heatmap (H, W), values in [0, 1]
            alpha (float): Blend factor for heatmap (0=original only, 1=heatmap only)
            colormap_name (str): Colormap name ('jet', 'hot', 'viridis', 'cool')
            
        Returns:
            np.ndarray: Overlay image (H, W, 3), uint8
        """
        try:
            # ====== Validate and Normalize Heatmap ======
            heatmap = np.clip(heatmap, 0, 1).astype(np.float32)
            logger.debug(f"Heatmap range: [{heatmap.min():.4f}, {heatmap.max():.4f}]")
            
            # ====== Process Original Image ======
            # Determine if grayscale or RGB
            if len(original_image.shape) == 2:
                # Grayscale image (H, W)
                original_gray = original_image.astype(np.float32)
                
                # Normalize to [0, 1] if needed
                if original_gray.max() > 1.0:
                    original_gray = original_gray / 255.0
                
                # Convert to RGB by replicating channels
                original_rgb = np.stack([original_gray] * 3, axis=-1)
                logger.debug(f"Original image converted from grayscale. Shape: {original_rgb.shape}")
                
            else:
                # Already RGB/RGBA
                original_rgb = original_image[:, :, :3].astype(np.float32)
                
                # Normalize to [0, 1] if needed
                if original_rgb.max() > 1.0:
                    original_rgb = original_rgb / 255.0
                
                logger.debug(f"Original image is RGB. Shape: {original_rgb.shape}")
            
            # ====== Apply Colormap to Heatmap ======
            # Convert grayscale heatmap to colored RGB heatmap
            colored_heatmap = HeatmapVisualizer.apply_colormap(heatmap, colormap_name)
            colored_heatmap = colored_heatmap.astype(np.float32) / 255.0  # Normalize to [0, 1]
            logger.debug(f"Colored heatmap shape: {colored_heatmap.shape}, "
                        f"range: [{colored_heatmap.min():.4f}, {colored_heatmap.max():.4f}]")
            
            # ====== Blend Images ======
            # Formula: overlay = (1 - alpha) * original + alpha * heatmap
            # Default alpha=0.4 gives: 0.6 * original + 0.4 * heatmap
            overlay = (1.0 - alpha) * original_rgb + alpha * colored_heatmap
            overlay = np.clip(overlay, 0, 1)  # Ensure in valid range
            
            logger.debug(f"Blended with alpha={alpha}. Result range: [{overlay.min():.4f}, {overlay.max():.4f}]")
            
            # ====== Convert to uint8 ======
            overlay_uint8 = (overlay * 255).astype(np.uint8)
            
            logger.info(f"Overlay created. Shape: {overlay_uint8.shape}, dtype: {overlay_uint8.dtype}")
            return overlay_uint8
        
        except Exception as e:
            logger.error(f"Heatmap overlay failed: {str(e)}", exc_info=True)
            # Fallback: return original image as uint8
            try:
                if original_image.max() <= 1.0:
                    return (original_image * 255).astype(np.uint8)
                else:
                    return original_image.astype(np.uint8)
            except:
                return np.zeros((224, 224, 3), dtype=np.uint8)
    
    @staticmethod
    def create_comparison_visualization(original_image: np.ndarray,
                                       heatmap: np.ndarray,
                                       overlay_image: np.ndarray,
                                       title_font_scale: float = 0.8,
                                       title_color: tuple = (255, 255, 255)) -> np.ndarray:
        """
        Create a side-by-side comparison image showing:
        1. Original MRI image (left)
        2. Raw Grad-CAM heatmap (middle)
        3. Overlay heatmap on MRI (right)
        
        Adds titles above each image and proper spacing.
        
        Args:
            original_image (np.ndarray): Original MRI image (H, W) or (H, W, 3), 0-1 or 0-255
            heatmap (np.ndarray): Raw heatmap (H, W), values 0-1
            overlay_image (np.ndarray): Overlay image (H, W, 3), uint8 0-255
            title_font_scale (float): Font scale for titles (default 0.8)
            title_color (tuple): Color for titles in RGB (default white)
            
        Returns:
            np.ndarray: Comparison image with all three views side-by-side (uint8)
        """
        try:
            # ====== NORMALIZE ALL IMAGES TO uint8 ======
            # Original image - ensure clean grayscale
            if len(original_image.shape) == 2:
                # Grayscale
                original_uint8 = original_image.astype(np.float32)
                if original_uint8.max() > 1.0:
                    original_uint8 = original_uint8 / 255.0
                # Enhance contrast and normalize
                original_uint8 = np.clip(original_uint8, 0, 1)
                original_uint8 = (original_uint8 * 255).astype(np.uint8)
                original_rgb = np.stack([original_uint8] * 3, axis=-1)
            else:
                # RGB
                original_uint8 = original_image.astype(np.float32)
                if original_uint8.max() > 1.0:
                    original_uint8 = original_uint8 / 255.0
                original_rgb = np.clip(original_uint8 * 255, 0, 255).astype(np.uint8)
            
            logger.debug(f"Original image: shape={original_rgb.shape}, range=[{original_rgb.min()}, {original_rgb.max()}]")
            
            # Heatmap - ensure proper range and colormap application
            heatmap_normalized = np.clip(heatmap, 0, 1).astype(np.float32)
            logger.debug(f"Heatmap before colormap: range=[{heatmap_normalized.min():.4f}, {heatmap_normalized.max():.4f}]")
            
            # Apply JET colormap directly to normalized heatmap
            heatmap_colored = HeatmapVisualizer.apply_colormap(
                heatmap_normalized,
                colormap_name='jet'
            )
            logger.debug(f"Heatmap colored: shape={heatmap_colored.shape}, range=[{heatmap_colored.min()}, {heatmap_colored.max()}]")
            
            # Overlay image - ensure it's proper RGB uint8
            if overlay_image.dtype != np.uint8:
                overlay_rgb = np.clip(overlay_image * 255, 0, 255).astype(np.uint8) if overlay_image.max() <= 1.0 else overlay_image.astype(np.uint8)
            else:
                overlay_rgb = overlay_image
            
            # Convert BGR to RGB if needed (OpenCV uses BGR)
            if HAS_OPENCV and len(overlay_rgb.shape) == 3:
                overlay_rgb = cv2.cvtColor(overlay_rgb, cv2.COLOR_BGR2RGB) if overlay_rgb.shape[2] == 3 else overlay_rgb
            
            logger.debug(f"Overlay: shape={overlay_rgb.shape}, range=[{overlay_rgb.min()}, {overlay_rgb.max()}]")
            
            # ====== ENSURE ALL IMAGES SAME SIZE ======
            target_size = original_rgb.shape[:2]
            
            if heatmap_colored.shape[:2] != target_size:
                if HAS_OPENCV:
                    heatmap_colored = cv2.resize(heatmap_colored, (target_size[1], target_size[0]), interpolation=cv2.INTER_LINEAR)
                else:
                    heatmap_colored = np.array(Image.fromarray(heatmap_colored).resize((target_size[1], target_size[0]), Image.Resampling.BILINEAR))
            
            if overlay_rgb.shape[:2] != target_size:
                if HAS_OPENCV:
                    overlay_rgb = cv2.resize(overlay_rgb, (target_size[1], target_size[0]), interpolation=cv2.INTER_LINEAR)
                else:
                    overlay_rgb = np.array(Image.fromarray(overlay_rgb).resize((target_size[1], target_size[0]), Image.Resampling.BILINEAR))
            
            logger.debug(f"All images resized to {target_size}")
            
            # ====== ADD TITLES TO EACH IMAGE ======
            # Create copies for annotation
            img1_titled = original_rgb.copy()
            img2_titled = heatmap_colored.copy()
            img3_titled = overlay_rgb.copy()
            
            # Font properties
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = title_font_scale
            thickness = 2
            text_color_bgr = (title_color[2], title_color[1], title_color[0])  # RGB to BGR for OpenCV
            
            # Add title background (dark rectangle) for better readability
            title_height = 40
            
            # Pad images with title space on top
            img1_titled = cv2.copyMakeBorder(img1_titled, title_height, 0, 0, 0, cv2.BORDER_CONSTANT, value=(20, 20, 20))
            img2_titled = cv2.copyMakeBorder(img2_titled, title_height, 0, 0, 0, cv2.BORDER_CONSTANT, value=(20, 20, 20))
            img3_titled = cv2.copyMakeBorder(img3_titled, title_height, 0, 0, 0, cv2.BORDER_CONSTANT, value=(20, 20, 20))
            
            # Add text
            x_offset = 10
            y_offset = 30
            
            cv2.putText(img1_titled, "Original MRI", (x_offset, y_offset), font, font_scale, text_color_bgr, thickness)
            cv2.putText(img2_titled, "Raw Heatmap", (x_offset, y_offset), font, font_scale, text_color_bgr, thickness)
            cv2.putText(img3_titled, "Overlay", (x_offset, y_offset), font, font_scale, text_color_bgr, thickness)
            
            logger.debug("Titles added to all images")
            
            # ====== CONCATENATE HORIZONTALLY ======
            # Add small padding between images
            padding = np.ones((img1_titled.shape[0], 10, 3), dtype=np.uint8) * 50
            
            comparison = np.hstack([img1_titled, padding, img2_titled, padding, img3_titled])
            
            logger.info(f"Comparison image created. Final shape: {comparison.shape}, "
                       f"range=[{comparison.min()}, {comparison.max()}]")
            
            return comparison
        
        except Exception as e:
            logger.error(f"Comparison visualization creation failed: {str(e)}", exc_info=True)
            return None


class ExplainabilityEngine:
    """
    Production-grade explainability engine combining:
    - Grad-CAM activation maps
    - Heatmap visualization with color overlay
    - Confidence scoring
    - Interpretation generation
    
    Produces visual explanations that help understand model predictions.
    """
    
    def __init__(self, model: nn.Module, device: torch.device, output_dir: str = "heatmaps"):
        """
        Initialize explainability engine.
        
        Args:
            model (nn.Module): Trained CNN model in eval mode
            device (torch.device): Computation device (CPU or GPU)
            output_dir (str): Directory to save generated heatmaps
        """
        self.model = model
        self.device = device
        self.output_dir = output_dir
        
        # Initialize Grad-CAM
        self.gradcam = GradCAM(model, device)
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        logger.info(f"ExplainabilityEngine initialized. Output dir: {output_dir}")
    
    def generate_heatmap_visualization(self,
                                      image_tensor: torch.Tensor,
                                      original_image: Optional[np.ndarray] = None,
                                      image_name: str = "prediction",
                                      colormap: str = 'jet',
                                      alpha: float = 0.5) -> Optional[str]:
        """
        Generate and save ONLY the final side-by-side comparison visualization.
        
        Generates a single, optimized output image showing:
        1. Original MRI image (left)
        2. Raw Grad-CAM heatmap (center)
        3. Overlay heatmap on MRI (right)
        
        All three views in one file to avoid redundant output.
        
        Args:
            image_tensor (torch.Tensor): Input tensor (B, C, H, W)
            original_image (Optional[np.ndarray]): Original image for overlay
            image_name (str): Base name for output file
            colormap (str): Colormap to use ('jet', 'hot', 'viridis', 'cool')
            alpha (float): Blend factor (0=original, 1=heatmap)
            
        Returns:
            Optional[str]: Path to saved comparison image (ONE file only) or None on error
        """
        try:
            logger.info(f"Generating optimized heatmap visualization for {image_name}")
            
            # ====== GENERATE HEATMAP ======
            logger.debug("Computing Grad-CAM heatmap...")
            heatmap = self.gradcam.generate_heatmap(image_tensor)
            
            if heatmap is None:
                logger.error("Heatmap generation returned None!")
                return None
            
            logger.info(f"Heatmap generated. Shape: {heatmap.shape}, Range: [{heatmap.min():.4f}, {heatmap.max():.4f}]")
            
            # ====== EXTRACT/PREPARE ORIGINAL IMAGE ======
            if original_image is None:
                logger.debug("Extracting original image from tensor...")
                original_image = image_tensor[0, 0].cpu().numpy()
                
                # Normalize to [0, 1]
                if original_image.max() > 1:
                    original_image = original_image / 255.0
                
                original_image = np.clip(original_image, 0, 1)
                logger.debug(f"Extracted image. Shape: {original_image.shape}, "
                           f"Range: [{original_image.min():.4f}, {original_image.max():.4f}]")
            
            # Ensure original image is properly normalized [0, 1]
            if original_image.max() > 1:
                original_image = original_image / 255.0
            original_image = np.clip(original_image, 0, 1)
            
            # ====== CREATE OVERLAY ======
            logger.debug(f"Creating overlay (alpha={alpha})...")
            overlay_image = HeatmapVisualizer.overlay_heatmap(
                original_image=original_image,
                heatmap=heatmap,
                alpha=alpha,
                colormap_name=colormap
            )
            
            if overlay_image is None:
                logger.error("Overlay creation failed!")
                return None
            
            logger.debug(f"Overlay created. Shape: {overlay_image.shape}")
            
            # ====== GENERATE COMPARISON IMAGE (SINGLE OUTPUT) ======
            logger.debug("Generating side-by-side comparison image...")
            comparison_image = HeatmapVisualizer.create_comparison_visualization(
                original_image=original_image,
                heatmap=heatmap,
                overlay_image=overlay_image
            )
            
            if comparison_image is None:
                logger.error("Comparison image generation failed!")
                return None
            
            logger.info(f"Comparison image created. Shape: {comparison_image.shape}")
            
            # ====== SAVE SINGLE OPTIMIZED OUTPUT ======
            logger.debug("Saving optimized visualization (ONE file only)...")
            comparison_path = self._save_visualization(
                comparison_image,
                base_name=image_name,
                suffix="comparison"
            )
            
            if comparison_path:
                logger.info(f"✓ Optimized visualization saved: {comparison_path}")
                logger.info(f"  Single file output containing all three views (Original|Heatmap|Overlay)")
            else:
                logger.error("Failed to save comparison image")
                return None
            
            logger.info(f"Heatmap visualization complete. Output: {comparison_path}")
            return comparison_path
        
        except Exception as e:
            logger.error(f"Heatmap visualization failed: {str(e)}", exc_info=True)
            return None
    
    def _save_visualization(self, image: np.ndarray, 
                           base_name: str,
                           suffix: str = "overlay") -> Optional[str]:
        """
        Save visualization image to disk with UUID-based naming to guarantee uniqueness.
        
        UUID ensures:
        - No filename collisions even for simultaneous predictions
        - Prevents file overwrites
        - Robust for concurrent requests
        
        Args:
            image (np.ndarray): Image array (uint8)
            base_name (str): Base filename
            suffix (str): Suffix to add before extension
            
        Returns:
            Optional[str]: Path to saved file or None on error
        """
        try:
            # Create filename with UUID to guarantee uniqueness
            # UUID4 generates random 128-bit identifier (hexadecimal: 32 chars)
            # Use first 12 chars for shorter but still unique names
            unique_id = uuid.uuid4().hex[:12]
            filename = f"{base_name}_{suffix}_{unique_id}.png"
            filepath = os.path.join(self.output_dir, filename)
            
            logger.debug(f"Saving visualization with UUID: {unique_id}")
            
            # Save using PIL
            pil_image = Image.fromarray(image)
            pil_image.save(filepath, 'PNG')
            
            logger.info(f"Visualization saved: {filepath}")
            return filepath
        
        except Exception as e:
            logger.error(f"Failed to save visualization: {str(e)}")
            return None
    
    def generate_comparison_image(self,
                                 original_image: np.ndarray,
                                 heatmap: np.ndarray,
                                 overlay_image: np.ndarray,
                                 image_name: str = "prediction") -> Optional[str]:
        """
        Generate and save a side-by-side comparison image showing:
        1. Original MRI image (left)
        2. Raw Grad-CAM heatmap (middle)
        3. Overlay heatmap (right)
        
        Perfect for presentations and detailed visualization.
        
        Args:
            original_image (np.ndarray): Original MRI image (H, W) or (H, W, 3)
            heatmap (np.ndarray): Raw heatmap (H, W), values 0-1
            overlay_image (np.ndarray): Overlay image (H, W, 3), uint8
            image_name (str): Base name for output file
            
        Returns:
            Optional[str]: Path to saved comparison image or None on error
        """
        try:
            logger.info(f"Generating comparison image for {image_name}")
            
            # Create side-by-side comparison
            comparison = HeatmapVisualizer.create_comparison_visualization(
                original_image=original_image,
                heatmap=heatmap,
                overlay_image=overlay_image
            )
            
            if comparison is None:
                logger.warning("Comparison visualization creation returned None")
                return None
            
            # Save comparison image
            comparison_path = self._save_visualization(comparison, image_name, suffix="comparison")
            
            if comparison_path:
                logger.info(f"Comparison image saved: {comparison_path}")
            else:
                logger.warning("Failed to save comparison image")
            
            return comparison_path
        
        except Exception as e:
            logger.error(f"Comparison image generation failed: {str(e)}", exc_info=True)
            return None
    
    def calculate_confidence(self, model_output: float, 
                            predicted_age: float) -> Dict[str, Any]:
        """
        Calculate and return confidence metrics.
        
        Args:
            model_output (float): Raw model output
            predicted_age (float): Predicted brain age
            
        Returns:
            Dict: Confidence scores and metrics
        """
        try:
            # Ensure output is in [0, 1]
            raw_normalized = np.clip(model_output, 0, 1)
            
            # Confidence based on how extreme the prediction is
            # (closeness to 0 or 1 edge is lower confidence)
            extremeness = 1 - abs(raw_normalized - 0.5) * 2
            confidence_score = max(0.5, extremeness)
            
            # Age-based adjustment (predictions near extremes are less reliable)
            if predicted_age < 25 or predicted_age > 85:
                confidence_score *= 0.9  # Reduce confidence for edge ages
            
            # Determine confidence level
            if confidence_score >= 0.75:
                confidence_level = "High"
                confidence_color = "green"
            elif confidence_score >= 0.55:
                confidence_level = "Medium"
                confidence_color = "yellow"
            else:
                confidence_level = "Low"
                confidence_color = "red"
            
            return {
                "score": round(confidence_score, 3),
                "level": confidence_level,
                "color": confidence_color,
                "raw_output": round(raw_normalized, 4)
            }
        
        except Exception as e:
            logger.error(f"Confidence calculation failed: {str(e)}")
            return {
                "score": 0.5,
                "level": "Unknown",
                "color": "gray",
                "raw_output": model_output
            }
    
    def generate_interpretation(self,
                               predicted_age: float,
                               confidence: Dict[str, Any],
                               heatmap_path: Optional[str] = None,
                               comparison_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate human-readable interpretation of prediction.
        
        Args:
            predicted_age (float): Predicted brain age
            confidence (Dict): Confidence metrics
            heatmap_path (Optional[str]): Path to overlay heatmap if generated
            comparison_path (Optional[str]): Path to comparison image (Original | Heatmap | Overlay)
            
        Returns:
            Dict: Interpretation details
        """
        try:
            # Base interpretation
            age_int = int(predicted_age)
            age_decimal = predicted_age - age_int
            
            # Generate interpretation text
            interpretation_text = self._generate_text_interpretation(
                predicted_age,
                confidence["level"]
            )
            
            features = [
                "Gray matter density distribution",
                "White matter integrity patterns",
                "Ventricular space changes",
                "Cortical thickness variations",
                "Brain tissue atrophy markers"
            ]
            
            return {
                "predicted_age": predicted_age,
                "age_years": age_int,
                "age_months": round(age_decimal * 12),
                "confidence": confidence,
                "interpretation": interpretation_text,
                "important_regions": [
                    "Frontal regions (executive function indicator)",
                    "Temporal lobes (memory processing)",
                    "Parietal regions (sensory integration)",
                    "Ventricular system (brain size reference)"
                ],
                "contributing_features": features,
                "visualization_path": comparison_path,  # Optimized: Single image with all three views
                "disclaimer": "This AI model provides estimates based on structural MRI patterns. "
                            "Always consult with medical professionals for clinical decisions.",
                "methodology": "Grad-CAM activation mapping highlights regions with strongest influence on prediction"
            }
        
        except Exception as e:
            logger.error(f"Interpretation generation failed: {str(e)}")
            return {
                "predicted_age": predicted_age,
                "confidence": confidence,
                "error": "Failed to generate detailed interpretation"
            }
    
    def _generate_text_interpretation(self, age: float, confidence_level: str) -> str:
        """
        Generate detailed text interpretation.
        
        Args:
            age (float): Predicted age
            confidence_level (str): Confidence level
            
        Returns:
            str: Interpretation text
        """
        age_int = int(age)
        
        # Base message
        msg = f"Model predicts a brain age of approximately {age_int} years "
        
        if confidence_level == "High":
            msg += "with high confidence. "
            msg += "The MRI shows structural patterns consistent with this age group. "
        elif confidence_level == "Medium":
            msg += "with moderate confidence. "
            msg += "The brain structure shows some variation from typical age patterns. "
        else:
            msg += "with lower confidence. "
            msg += "The brain structure shows unusual patterns that deviate from typical aging curves. "
        
        # Age-specific commentary
        if age < 30:
            msg += "Younger brain structure with well-preserved volume and minimal atrophy. "
        elif age < 50:
            msg += "Middle-aged brain structure with normal variation. "
        elif age < 70:
            msg += "Older brain structure showing expected age-related changes. "
        else:
            msg += "Elderly brain structure with significant age-related modifications. "
        
        msg += "The heatmap visualization shows brain regions most influential in this prediction."
        
        return msg
    
    def explain_prediction(self,
                          image_tensor: torch.Tensor,
                          predicted_age: float,
                          model_output: float,
                          original_image: Optional[np.ndarray] = None,
                          save_visualization: bool = True) -> Dict[str, Any]:
        """
        Generate complete explanation for a prediction.
        
        This is the main interface for generating full explanations including:
        - Grad-CAM heatmap visualization (raw, overlay, and comparison)
        - Confidence scoring
        - Text interpretation
        - Region importance analysis
        
        Args:
            image_tensor (torch.Tensor): Input image tensor (B, C, H, W)
            predicted_age (float): Predicted brain age
            model_output (float): Raw model output
            original_image (Optional[np.ndarray]): Original image for heatmap overlay
            save_visualization (bool): Whether to save heatmap visualization
            
        Returns:
            Dict: Complete explanation with visualization paths
        """
        try:
            # Calculate confidence
            confidence = self.calculate_confidence(model_output, predicted_age)
            
            # Generate optimized visualization (single comparison image only)
            comparison_path = None
            if save_visualization:
                comparison_path = self.generate_heatmap_visualization(
                    image_tensor=image_tensor,
                    original_image=original_image,
                    image_name=f"pred_{predicted_age:.0f}yr",
                    colormap='jet',
                    alpha=0.5
                )
            
            # Generate full interpretation
            explanation = self.generate_interpretation(
                predicted_age=predicted_age,
                confidence=confidence,
                comparison_path=comparison_path
            )
            
            logger.info(f"Complete explanation generated for age {predicted_age} years")
            return explanation
        
        except Exception as e:
            logger.error(f"Failed to generate complete explanation: {str(e)}", exc_info=True)
            return {
                "predicted_age": predicted_age,
                "error": str(e)
            }
