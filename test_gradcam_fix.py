#!/usr/bin/env python3
"""
Test script for Grad-CAM fix - verifies heatmap generates meaningful patterns instead of noise.
"""

import os
import sys
import numpy as np
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / 'backend'))

import torch
from PIL import Image
import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec

# Import our fixed Grad-CAM implementation
from explainability import GradCAM, HeatmapVisualizer, ExplainabilityEngine

# Set up logging
import logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(levelname)s - %(name)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_simple_cnn():
    """Create a simple CNN for testing."""
    class SimpleCNN(torch.nn.Module):
        def __init__(self):
            super().__init__()
            self.conv1 = torch.nn.Conv2d(1, 32, kernel_size=3, padding=1)
            self.conv2 = torch.nn.Conv2d(32, 64, kernel_size=3, padding=1)
            self.conv3 = torch.nn.Conv2d(64, 128, kernel_size=3, padding=1)  # Last conv
            self.pool = torch.nn.MaxPool2d(2, 2)
            self.fc1 = torch.nn.Linear(128 * 28 * 28, 256)
            self.fc2 = torch.nn.Linear(256, 1)
        
        def forward(self, x):
            x = torch.nn.functional.relu(self.conv1(x))
            x = self.pool(x)
            x = torch.nn.functional.relu(self.conv2(x))
            x = self.pool(x)
            x = torch.nn.functional.relu(self.conv3(x))
            x = self.pool(x)
            x = x.view(x.size(0), -1)
            x = torch.nn.functional.relu(self.fc1(x))
            x = self.fc2(x)
            return x
    
    return SimpleCNN()


def load_mri_image(image_path, target_size=224):
    """Load MRI image and prepare as tensor."""
    try:
        # Load image
        img = Image.open(image_path).convert('L')  # Grayscale
        logger.info(f"Loaded image: {image_path}, original size: {img.size}")
        
        # Resize
        img = img.resize((target_size, target_size), Image.Resampling.BILINEAR)
        
        # Convert to numpy and normalize
        img_np = np.array(img, dtype=np.float32) / 255.0
        logger.info(f"Image shape: {img_np.shape}, value range: [{img_np.min():.4f}, {img_np.max():.4f}]")
        
        # Create tensor: (1, 1, H, W) for batch
        img_tensor = torch.from_numpy(img_np[np.newaxis, np.newaxis, :, :]).float()
        logger.info(f"Tensor shape: {img_tensor.shape}")
        
        return img_tensor, img_np
    
    except Exception as e:
        logger.error(f"Failed to load image: {e}")
        raise


def test_gradcam_fix():
    """Test the Grad-CAM fix with an actual MRI image."""
    
    print("\n" + "="*80)
    print("GRAD-CAM FIX TEST")
    print("="*80 + "\n")
    
    # Check if test image exists
    data_dir = Path(__file__).parent / 'data' / 'oasis'
    test_images = list(data_dir.glob('**/OAS1_*_sag_88.gif')) if data_dir.exists() else []
    
    if not test_images:
        print("[NO IMAGES] No OAS1 test images found. Creating synthetic MRI image for testing...")
        # Create synthetic MRI-like image
        synthetic_mri = np.random.rand(224, 224) * 0.3  # Mostly dark
        # Add some bright regions to simulate brain
        synthetic_mri[60:160, 60:160] = 0.6 + np.random.rand(100, 100) * 0.3
        # Add bright center (brain region)
        y, x = np.ogrid[:224, :224]
        mask = ((x - 112)**2 + (y - 112)**2) <= 50**2
        synthetic_mri[mask] = 0.7 + np.random.rand(mask.sum()) * 0.2
        
        img_np = synthetic_mri
        img_tensor = torch.from_numpy(img_np[np.newaxis, np.newaxis, :, :]).float()
        logger.info("Created synthetic MRI image")
    else:
        # Use first available real MRI image
        img_path = test_images[0]
        logger.info(f"Using real MRI image: {img_path}")
        print(f"Image path: {img_path}\n")
        img_tensor, img_np = load_mri_image(img_path)
    
    # Create model
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    logger.info(f"Using device: {device}")
    
    model = create_simple_cnn().to(device)
    model.eval()
    
    # Initialize Grad-CAM
    logger.info("Initializing Grad-CAM...")
    gradcam = GradCAM(model, device)
    
    # Move image to device and enable gradients
    img_tensor = img_tensor.to(device)
    img_tensor.requires_grad = True
    
    # Forward pass
    print("\n[1] FORWARD PASS")
    print("-" * 80)
    with torch.enable_grad():
        output = model(img_tensor)
        print(f"OK Output: {output.item():.6f}")
        print(f"OK Output requires_grad: {output.requires_grad}")
    
    # Generate Grad-CAM heatmap
    print("\n[2] GRAD-CAM GENERATION")
    print("-" * 80)
    heatmap = gradcam.generate_heatmap(img_tensor)  # Using default target_size=(224, 224)
    
    if heatmap is None:
        print("[ERROR] Failed to generate heatmap!")
        return
    
    print(f"[OK] Heatmap shape: {heatmap.shape}")
    print(f"[OK] Heatmap range: [{heatmap.min():.4f}, {heatmap.max():.4f}]")
    print(f"[OK] Heatmap mean: {heatmap.mean():.4f}")
    print(f"[OK] Heatmap std: {heatmap.std():.4f}")
    
    # Check if heatmap is meaningful (not uniform noise)
    heatmap_std = heatmap.std()
    if heatmap_std < 0.05:
        print(f"[WARNING] Heatmap has low variance (std={heatmap_std:.6f}) - may be noise!")
    else:
        print(f"[OK] Heatmap has good variance (std={heatmap_std:.6f})")
    
    # Visualize heatmap statistics
    print("\n[3] HEATMAP ANALYSIS")
    print("-" * 80)
    print(f"Min value:     {heatmap.min():.6f}")
    print(f"Max value:     {heatmap.max():.6f}")
    print(f"Mean value:    {heatmap.mean():.6f}")
    print(f"Median value:  {np.median(heatmap):.6f}")
    print(f"Std deviation: {heatmap.std():.6f}")
    print(f"Peak pixels:   {(heatmap > 0.8).sum()} / {heatmap.size}")
    
    # Apply colormap
    print("\n[4] COLORMAP AND OVERLAY")
    print("-" * 80)
    try:
        colored_heatmap = HeatmapVisualizer.apply_colormap(heatmap, 'jet')
        print(f"[OK] Colored heatmap shape: {colored_heatmap.shape}, dtype: {colored_heatmap.dtype}")
        
        # Create overlay
        overlay = HeatmapVisualizer.overlay_heatmap(img_np, heatmap, alpha=0.4, colormap_name='jet')
        print(f"[OK] Overlay shape: {overlay.shape}, dtype: {overlay.dtype}")
    except Exception as e:
        print(f"[ERROR] Error applying colormap: {e}")
        colored_heatmap = None
        overlay = None
    
    # Create visualization
    print("\n[5] CREATING VISUALIZATION")
    print("-" * 80)
    
    try:
        fig = plt.figure(figsize=(15, 5))
        gs = GridSpec(1, 4, figure=fig, hspace=0.3, wspace=0.3)
        
        # Original image
        ax1 = fig.add_subplot(gs[0, 0])
        ax1.imshow(img_np, cmap='gray')
        ax1.set_title('Original MRI Image')
        ax1.axis('off')
        
        # Raw heatmap
        ax2 = fig.add_subplot(gs[0, 1])
        im2 = ax2.imshow(heatmap, cmap='viridis')
        ax2.set_title('Raw Heatmap\n(before colormap)')
        ax2.axis('off')
        plt.colorbar(im2, ax=ax2, fraction=0.046, pad=0.04)
        
        # Colored heatmap
        if colored_heatmap is not None:
            ax3 = fig.add_subplot(gs[0, 2])
            ax3.imshow(colored_heatmap)
            ax3.set_title('Colored Heatmap\n(jet colormap)')
            ax3.axis('off')
        
        # Overlay
        if overlay is not None:
            ax4 = fig.add_subplot(gs[0, 3])
            ax4.imshow(overlay)
            ax4.set_title('Overlay\n(60% original + 40% heatmap)')
            ax4.axis('off')
        
        # Save figure
        output_path = Path(__file__).parent / 'gradcam_test_result.png'
        plt.savefig(output_path, dpi=100, bbox_inches='tight')
        print(f"[OK] Visualization saved to: {output_path}")
        
        plt.show()
        
    except Exception as e:
        print(f"[ERROR] Error creating visualization: {e}")
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    if heatmap_std > 0.05:
        print("[SUCCESS] Heatmap shows meaningful patterns (not noise)")
        print(f"   - Variance is good: std={heatmap_std:.6f}")
        print(f"   - Peak activations visible: {(heatmap > 0.8).sum()} pixels")
    else:
        print("[ISSUE] Heatmap may still be showing noise patterns")
        print(f"   - Variance is low: std={heatmap_std:.6f}")
        print("   - Check the debug logs above for details")
    
    print("\n" + "="*80 + "\n")


if __name__ == '__main__':
    test_gradcam_fix()
