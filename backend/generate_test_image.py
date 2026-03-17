"""
Generate Sample Test Images for API Testing

This script creates sample 224x224 grayscale images for testing the prediction API.
Images can be generated with different patterns to simulate real brain MRI scans.
"""

import sys
from pathlib import Path
from typing import Optional

try:
    import numpy as np
    from PIL import Image
except ImportError:
    print("Required packages not found. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "numpy", "-q"])
    import numpy as np
    from PIL import Image


def generate_simple_image(output_path: str = "test_image_simple.png") -> str:
    """
    Generate a simple random grayscale image.
    
    Args:
        output_path: Path to save the image
        
    Returns:
        str: Path to created image
    """
    print(f"Generating simple random image: {output_path}")
    
    # Create random 224x224 grayscale image
    data = np.random.randint(50, 200, (224, 224), dtype=np.uint8)
    img = Image.fromarray(data, mode='L')
    
    img.save(output_path)
    file_size = Path(output_path).stat().st_size / 1024
    print(f"✓ Created: {output_path} ({file_size:.1f} KB)")
    
    return output_path


def generate_gradient_image(output_path: str = "test_image_gradient.png") -> str:
    """
    Generate an image with gradient patterns (resembles brain tissue variation).
    
    Args:
        output_path: Path to save the image
        
    Returns:
        str: Path to created image
    """
    print(f"Generating gradient image: {output_path}")
    
    # Create gradient image
    x = np.linspace(50, 200, 224)
    y = np.linspace(50, 200, 224)
    xx, yy = np.meshgrid(x, y)
    
    # Add some noise
    data = (xx + yy) / 2 + np.random.normal(0, 10, (224, 224))
    data = np.clip(data, 0, 255).astype(np.uint8)
    
    img = Image.fromarray(data, mode='L')
    img.save(output_path)
    file_size = Path(output_path).stat().st_size / 1024
    print(f"✓ Created: {output_path} ({file_size:.1f} KB)")
    
    return output_path


def generate_circular_pattern_image(output_path: str = "test_image_circular.png") -> str:
    """
    Generate an image with circular patterns (resembles brain cross-sections).
    
    Args:
        output_path: Path to save the image
        
    Returns:
        str: Path to created image
    """
    print(f"Generating circular pattern image: {output_path}")
    
    # Create concentric circles (like brain MRI cross-section)
    yy, xx = np.ogrid[:224, :224]
    center_x, center_y = 112, 112
    
    # Distance from center
    dist = np.sqrt((xx - center_x)**2 + (yy - center_y)**2)
    
    # Create circular pattern
    data = 100 + 50 * np.sin(dist / 5) + np.random.normal(0, 10, (224, 224))
    data = np.clip(data, 0, 255).astype(np.uint8)
    
    img = Image.fromarray(data, mode='L')
    img.save(output_path)
    file_size = Path(output_path).stat().st_size / 1024
    print(f"✓ Created: {output_path} ({file_size:.1f} KB)")
    
    return output_path


def main():
    """Generate multiple test images."""
    print("\n" + "="*60)
    print("TEST IMAGE GENERATOR")
    print("Creates sample images for API testing")
    print("="*60 + "\n")
    
    # Determine output directory
    output_dir = Path("test_images")
    output_dir.mkdir(exist_ok=True)
    
    print(f"Output directory: {output_dir.absolute()}\n")
    
    # Generate different types of images
    images = [
        generate_simple_image(str(output_dir / "test_image_simple.png")),
        generate_gradient_image(str(output_dir / "test_image_gradient.png")),
        generate_circular_pattern_image(str(output_dir / "test_image_circular.png")),
    ]
    
    print(f"\n✓ Generated {len(images)} test images")
    print(f"✓ Location: {output_dir.absolute()}")
    print("\nYou can now run: python test_api.py")
    print("The script will automatically detect and use these images.\n")


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
