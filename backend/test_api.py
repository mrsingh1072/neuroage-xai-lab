"""
Test Script for Brain Age Prediction API
Tests all endpoints and provides examples of API usage.

This script automatically searches for test images in multiple locations:
- Current directory
- backend/
- backend/test_images/
- ../data/oasis/ (OASIS dataset)
- ../data/processed/ (Processed data)
"""

import requests
import json
from pathlib import Path
import sys
from typing import Optional, List

# Configuration
API_BASE_URL = "http://localhost:5000"
TIMEOUT = 30

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def print_header(text):
    """Print formatted header."""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text:^70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*70}{Colors.ENDC}\n")


def print_success(text):
    """Print success message."""
    print(f"{Colors.OKGREEN}[OK] {text}{Colors.ENDC}")


def print_error(text):
    """Print error message."""
    print(f"{Colors.FAIL}[ERROR] {text}{Colors.ENDC}")


def print_warning(text):
    """Print warning message."""
    print(f"{Colors.WARNING}[WARNING] {text}{Colors.ENDC}")


def print_info(text):
    """Print info message."""
    print(f"{Colors.OKCYAN}[INFO] {text}{Colors.ENDC}")


def find_test_images() -> List[str]:
    """
    Automatically search for test images in multiple locations.
    Prioritizes real MRI data (from OASIS dataset).
    Excludes heatmap/visualization images.
    
    Searches in:
    - ../data/oasis/ (OASIS dataset scans - PRIORITIZED)
    - ../data/processed/ (Processed data)
    - backend/test_images/
    - Current directory (.) - EXCLUDES visualization images
    
    Returns:
        List[str]: List of absolute paths to found image files
    """
    # Excludes patterns for visualization/heatmap images
    exclude_patterns = {
        'heatmap', 'overlay', 'gradcam', 'visualization', 'test_result',
        'sample_test_image'  # Auto-generated test image
    }
    
    def is_valid_input_image(filepath: str) -> bool:
        """Check if file is a valid MRI input (not a visualization)."""
        filename = Path(filepath).name.lower()
        # Exclude files with visualization markers in filename
        return not any(excl in filename for excl in exclude_patterns)
    
    # Search patterns (OASIS dataset first for priority)
    search_patterns = [
        # OASIS dataset - HIGH PRIORITY for real MRI data
        Path("../data/oasis"),
        Path("../../data/oasis"),
        Path("../../../data/oasis"),
        
        # Processed data
        Path("../data/processed"),
        Path("../../data/processed"),
        
        # Test images directory
        Path("test_images"),
        Path("../test_images"),
    ]
    
    # OASIS dataset typically has .gif files for 2D slices
    # NOTE: .img files (NIfTI format) are NOT supported by the API
    # Only search for formats the API actually allows (see ALLOWED_EXTENSIONS in app.py)
    oasis_formats = {'.gif'}  # Only .gif supported from OASIS
    standard_formats = {'.png', '.jpg', '.jpeg', '.bmp', '.tiff'}
    supported_formats = oasis_formats | standard_formats
    
    found_images = []
    
    # Search in each directory
    for search_dir in search_patterns:
        try:
            if search_dir.exists() and search_dir.is_dir():
                # OASIS dataset structure: OAS1_XXXX_MR1/PROCESSED/MPRAGE/SUBJ_111/*.gif
                # Deep search for OASIS images (4-5 levels deep)
                for ext in supported_formats:
                    pattern = f"*/*/*/*{ext}"  # 4 levels
                    for image_file in search_dir.glob(pattern):
                        if image_file.is_file():
                            abs_path = str(image_file.absolute())
                            if is_valid_input_image(abs_path) and abs_path not in found_images:
                                # Check file size (MRI images usually > 10KB)
                                if image_file.stat().st_size > 10000:
                                    found_images.append(abs_path)
                    
                    # 5 levels deep for deeply nested structures
                    pattern = f"*/*/*/*/*{ext}"
                    for image_file in search_dir.glob(pattern):
                        if image_file.is_file():
                            abs_path = str(image_file.absolute())
                            if is_valid_input_image(abs_path) and abs_path not in found_images:
                                if image_file.stat().st_size > 10000:
                                    found_images.append(abs_path)
                
                # Top-level images in test_images directories
                for ext in standard_formats:
                    pattern = f"*{ext}"
                    for image_file in search_dir.glob(pattern):
                        if image_file.is_file() and image_file.stat().st_size > 10000:
                            abs_path = str(image_file.absolute())
                            if is_valid_input_image(abs_path) and abs_path not in found_images:
                                found_images.append(abs_path)
        except (PermissionError, OSError):
            continue
    
    return found_images


def create_sample_test_image() -> Optional[str]:
    """
    Create a simple sample test image if no images are found.
    Uses PIL to create a minimal 224x224 grayscale image.
    
    Returns:
        str: Path to created image, or None if PIL not available
    """
    try:
        from PIL import Image
        import numpy as np
        
        # Create a simple 224x224 grayscale image with random data
        sample_data = np.random.randint(0, 256, (224, 224), dtype=np.uint8)
        img = Image.fromarray(sample_data, mode='L')
        
        sample_path = Path("sample_test_image.png")
        img.save(str(sample_path))
        
        return str(sample_path.absolute())
    except ImportError:
        return None
    except Exception as e:
        print_error(f"Failed to create sample image: {str(e)}")
        return None



def print_response(response: requests.Response):
    """Pretty print API response."""
    print(f"\nStatus Code: {response.status_code}")
    print("Response Body:")
    try:
        json_data = response.json()
        print(json.dumps(json_data, indent=2))
    except:
        print(response.text)


def test_health_check():
    """Test health check endpoint."""
    print_header("TEST 1: Health Check")
    
    try:
        print_info(f"Requesting: GET {API_BASE_URL}/health")
        response = requests.get(
            f"{API_BASE_URL}/health",
            timeout=TIMEOUT
        )
        
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "running":
                print_success("Health check passed! API is running.")
                return True
            else:
                print_error("API returned unexpected status.")
                return False
        else:
            print_error(f"Health check failed with status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("Could not connect to API. Is the server running?")
        return False
    except Exception as e:
        print_error(f"Health check failed: {str(e)}")
        return False


def test_model_info():
    """Test model info endpoint."""
    print_header("TEST 2: Model Information")
    
    try:
        print_info(f"Requesting: GET {API_BASE_URL}/model/info")
        response = requests.get(
            f"{API_BASE_URL}/model/info",
            timeout=TIMEOUT
        )
        
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            print_success("Model info retrieved successfully.")
            if data.get("model_loaded"):
                print_success("Model is loaded and ready for predictions.")
            else:
                print_error("Model is not loaded.")
            return True
        else:
            print_error(f"Model info failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Model info test failed: {str(e)}")
        return False


def test_single_prediction(image_path: str):
    """Test single prediction endpoint."""
    print_header("TEST 3: Single Image Prediction")
    
    if not Path(image_path).exists():
        print_error(f"Image file not found: {image_path}")
        return False
    
    try:
        print_info(f"Image path: {image_path}")
        print_info(f"Image size: {Path(image_path).stat().st_size / 1024:.2f} KB")
        
        with open(image_path, 'rb') as f:
            files = {'image': f}
            print_info(f"Sending: POST {API_BASE_URL}/predict")
            
            response = requests.post(
                f"{API_BASE_URL}/predict",
                files=files,
                timeout=TIMEOUT
            )
        
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            predicted_age = data.get("predicted_age")
            print_success(f"Prediction successful! Predicted age: {predicted_age} years")
            return True
        else:
            print_error(f"Prediction failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Prediction test failed: {str(e)}")
        return False


def test_batch_prediction(image_paths: list):
    """Test batch prediction endpoint."""
    print_header("TEST 4: Batch Prediction")
    
    # Filter existing files
    existing_files = [p for p in image_paths if Path(p).exists()]
    
    if not existing_files:
        print_error("No valid image files found for batch test")
        return False
    
    print_info(f"Found {len(existing_files)} valid images for batch test")
    
    try:
        files = []
        for image_path in existing_files:
            files.append(('images', open(image_path, 'rb')))
        
        print_info(f"Sending: POST {API_BASE_URL}/predict/batch with {len(files)} images")
        
        response = requests.post(
            f"{API_BASE_URL}/predict/batch",
            files=files,
            timeout=TIMEOUT
        )
        
        # Close files
        for _, f in files:
            f.close()
        
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            successful = data.get("successful_predictions", 0)
            print_success(f"Batch prediction completed! {successful} successful predictions.")
            return True
        else:
            print_error(f"Batch prediction failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Batch prediction test failed: {str(e)}")
        return False


def test_invalid_file():
    """Test error handling with invalid file."""
    print_header("TEST 5: Error Handling - Invalid File")
    
    try:
        print_info("Sending invalid file format...")
        
        # Create a test text file
        test_file = Path("test_invalid.txt")
        test_file.write_text("This is not an image")
        
        with open(test_file, 'rb') as f:
            files = {'image': f}
            print_info(f"Sending: POST {API_BASE_URL}/predict with .txt file")
            
            response = requests.post(
                f"{API_BASE_URL}/predict",
                files=files,
                timeout=TIMEOUT
            )
        
        # Clean up
        test_file.unlink()
        
        print_response(response)
        
        if response.status_code == 400:
            print_success("Error handling works correctly! Invalid file rejected.")
            return True
        else:
            print_error(f"Unexpected status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Error handling test failed: {str(e)}")
        return False


def main():
    """Run all tests."""
    print(f"{Colors.BOLD}{Colors.OKCYAN}")
    print("="*50)
    print("Brain Age Prediction API Tester")
    print("Testing Flask Backend Functionality")
    print("="*50)
    print(Colors.ENDC)
    
    print_info(f"API Base URL: {API_BASE_URL}")
    print_info(f"Timeout: {TIMEOUT} seconds\n")
    
    # Run tests
    results = {}
    
    # Test 1: Health check
    results['Health Check'] = test_health_check()
    
    if not results['Health Check']:
        print_error("API is not responding. Please start the server first.")
        print_info("Run: python app.py")
        return False
    
    # Test 2: Model info
    results['Model Info'] = test_model_info()
    
    # Test 3 & 4: Prediction tests - Search for images in multiple locations
    print_header("SEARCHING FOR TEST IMAGES")
    
    test_images = find_test_images()
    
    if test_images:
        # Found images in the filesystem
        print_success(f"Found {len(test_images)} valid MRI test image(s) in the project")
        for idx, img_path in enumerate(test_images[:5], 1):  # Show first 5
            file_size = Path(img_path).stat().st_size / 1024
            print_info(f"  {idx}. {Path(img_path).name} ({file_size:.1f} KB)")
        if len(test_images) > 5:
            print_info(f"  ... and {len(test_images) - 5} more")
        
        # Use the first real MRI image for single prediction test
        print_info(f"Using: {Path(test_images[0]).name} for prediction test")
        results['Single Prediction'] = test_single_prediction(test_images[0])
        
        # Use multiple images for batch prediction test (if available)
        if len(test_images) > 1:
            batch_images = test_images[:min(3, len(test_images))]
            print_info(f"Using {len(batch_images)} image(s) for batch test")
            results['Batch Prediction'] = test_batch_prediction(batch_images)
    else:
        # No MRI images found - try to create a sample one
        print_warning("No MRI test images found in OASIS dataset or test directories")
        print_info("Attempting to create a sample 224x224 grayscale test image...")
        
        sample_image = create_sample_test_image()
        
        if sample_image:
            print_success(f"Sample test image created: {Path(sample_image).name}")
            print_warning("Note: Using synthetic sample image (not real MRI data)")
            results['Single Prediction'] = test_single_prediction(sample_image)
            results['Batch Prediction'] = test_batch_prediction([sample_image])
        else:
            print_error("Could not create sample image (PIL/Pillow required)")
            print_info("To test with real MRI images, please:")
            print_info("  1. Download OASIS dataset: https://www.oasis-brains.org/")
            print_info("  2. Extract to: data/oasis/")
            print_info("  3. Or run: pip install Pillow (to auto-generate sample images)")
    
    print("")  # Blank line for readability
    
    # Test 5: Error handling
    results['Error Handling'] = test_invalid_file()
    
    # Summary
    print_header("TEST SUMMARY")
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_test in results.items():
        status = "PASS" if passed_test else "FAIL"
        color = Colors.OKGREEN if passed_test else Colors.FAIL
        print(f"{color}[{status}]{Colors.ENDC} {test_name}")
    
    print(f"\n{Colors.BOLD}Results: {passed}/{total} tests passed{Colors.ENDC}\n")
    
    if passed == total:
        print_success("All tests passed! API is working correctly.")
        return True
    else:
        print_error(f"{total - passed} test(s) failed. Please check the API.")
        return False


if __name__ == '__main__':
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print_error("\nTests interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print_error(f"Unexpected error: {str(e)}")
        sys.exit(1)
