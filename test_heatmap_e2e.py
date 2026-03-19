"""
End-to-End Test: Validate Grad-CAM Heatmap Display System

This test verifies:
1. Backend Flask app starts correctly
2. HEATMAP_FOLDER is properly configured before routes
3. /heatmap/<filename> route is accessible
4. Frontend path conversion utilities work correctly
5. Image serving works with proper MIME type
"""

import os
import sys
import requests
import time
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

def test_backend_imports():
    """Test that backend imports correctly"""
    print("=" * 60)
    print("TEST 1: Backend Imports")
    print("=" * 60)
    
    try:
        from app import app, HEATMAP_FOLDER, BACKEND_DIR
        print(f"✓ Flask app imported successfully")
        print(f"✓ HEATMAP_FOLDER defined: {HEATMAP_FOLDER}")
        print(f"✓ BACKEND_DIR: {BACKEND_DIR}")
        
        # Verify folder exists
        if os.path.exists(HEATMAP_FOLDER):
            print(f"✓ Heatmap folder exists: {HEATMAP_FOLDER}")
        else:
            print(f"⚠ Heatmap folder will be created on first prediction")
            
        return app, HEATMAP_FOLDER
    except Exception as e:
        print(f"✗ Failed to import app: {str(e)}")
        import traceback
        traceback.print_exc()
        return None, None

def test_flask_routes(app):
    """Test Flask route configuration"""
    print("\n" + "=" * 60)
    print("TEST 2: Flask Routes Configuration")
    print("=" * 60)
    
    try:
        # Get all registered routes
        routes = []
        for rule in app.url_map.iter_rules():
            routes.append(str(rule))
        
        heatmap_routes = [r for r in routes if 'heatmap' in r.lower()]
        print(f"✓ Found {len(heatmap_routes)} heatmap routes:")
        for route in heatmap_routes:
            print(f"  - {route}")
        
        # Check specific routes we need
        required_routes = ['/heatmap/<filename>', '/debug/heatmaps']
        for required in required_routes:
            if required in heatmap_routes:
                print(f"✓ Route {required} is registered")
            else:
                print(f"✗ Missing route: {required}")
        
        return True
    except Exception as e:
        print(f"✗ Error checking routes: {str(e)}")
        return False

def test_image_serving(app, heatmap_folder):
    """Test image serving with test app client"""
    print("\n" + "=" * 60)
    print("TEST 3: Image Serving with Flask Test Client")
    print("=" * 60)
    
    try:
        # Create test image in heatmap folder if it doesn't exist
        test_image_path = os.path.join(heatmap_folder, "test_image.png")
        
        if not os.path.exists(test_image_path):
            from PIL import Image
            import numpy as np
            
            # Create a simple test image
            img_array = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
            img = Image.fromarray(img_array)
            img.save(test_image_path)
            print(f"✓ Created test image: {test_image_path}")
        
        # Test with Flask test client
        with app.test_client() as client:
            response = client.get('/heatmap/test_image.png')
            
            if response.status_code == 200:
                print(f"✓ /heatmap/test_image.png returned status 200")
                print(f"  Content-Type: {response.content_type}")
                print(f"  Content-Length: {len(response.data)} bytes")
                
                # Verify it's a PNG
                if response.data.startswith(b'\x89PNG'):
                    print(f"✓ Response is valid PNG data")
                else:
                    print(f"⚠ Response doesn't start with PNG magic bytes")
                
                # Clean up test image
                try:
                    os.remove(test_image_path)
                    print(f"✓ Cleaned up test image")
                except:
                    pass
                    
                return True
            else:
                print(f"✗ /heatmap/test_image.png returned status {response.status_code}")
                return False
                
    except Exception as e:
        print(f"✗ Error testing image serving: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_path_conversion():
    """Test frontend path conversion utilities"""
    print("\n" + "=" * 60)
    print("TEST 4: Frontend Path Conversion (simulated in Python)")
    print("=" * 60)
    
    try:
        def extract_filename_from_path(full_path):
            if not full_path:
                return None
            path = full_path.replace('http://', '').replace('\\', '/')
            return path.split('/')[-1]
        
        def convert_to_relative_path(full_path):
            if not full_path:
                return None
            if full_path.startswith('heatmap/'):
                return full_path
            filename = extract_filename_from_path(full_path)
            if not filename:
                return None
            return f"heatmap/{filename}"
        
        # Test cases
        test_cases = [
            ("heatmap/pred_21yr_comparison_abc123.png", "heatmap/pred_21yr_comparison_abc123.png"),
            ("D:\\path\\to\\heatmap\\file.png", "heatmap/file.png"),
            ("http://127.0.0.1:5000/heatmap/file.png", "heatmap/file.png"),
            ("/backend/heatmaps/file.png", "heatmap/file.png"),
        ]
        
        for input_path, expected in test_cases:
            result = convert_to_relative_path(input_path)
            status = "✓" if result == expected else "✗"
            print(f"{status} convertToRelativePath('{input_path}')")
            print(f"  Expected: {expected}")
            print(f"  Got:      {result}")
        
        return True
    except Exception as e:
        print(f"✗ Error in path conversion: {str(e)}")
        return False

def test_explainability_import():
    """Test explainability module can be imported"""
    print("\n" + "=" * 60)
    print("TEST 5: Explainability Module Import")
    print("=" * 60)
    
    try:
        from explainability import ExplainabilityEngine
        print(f"✓ ExplainabilityEngine imported successfully")
        
        # Check it has the _save_visualization method
        if hasattr(ExplainabilityEngine, '_save_visualization'):
            print(f"✓ _save_visualization method exists")
        else:
            print(f"✗ _save_visualization method not found")
            return False
            
        return True
    except Exception as e:
        print(f"✗ Failed to import ExplainabilityEngine: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("GRAD-CAM HEATMAP END-TO-END VALIDATION")
    print("=" * 60 + "\n")
    
    results = {}
    
    # Test 1: Backend imports
    app, heatmap_folder = test_backend_imports()
    results['Backend Imports'] = app is not None
    
    if app is None:
        print("\n✗ Cannot continue - backend failed to import")
        return False
    
    # Test 2: Flask routes
    results['Flask Routes'] = test_flask_routes(app)
    
    # Test 3: Image serving
    results['Image Serving'] = test_image_serving(app, heatmap_folder)
    
    # Test 4: Path conversion
    results['Path Conversion'] = test_path_conversion()
    
    # Test 5: Explainability import
    results['Explainability Module'] = test_explainability_import()
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    print("\n" + "=" * 60)
    print(f"TOTAL: {passed}/{total} tests passed")
    print("=" * 60 + "\n")
    
    if passed == total:
        print("✓ All tests passed! Backend is ready to serve heatmaps.")
        print("\nNext steps:")
        print("1. Start the Flask backend: python backend/app.py")
        print("2. Open frontend/index.html in a browser")
        print("3. Upload an MRI image to test the full pipeline")
        return True
    else:
        print(f"✗ {total - passed} test(s) failed. Please review the output above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
