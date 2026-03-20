"""
Debug script to test heatmap generation in the predict endpoint.
"""
import requests
import json
from pathlib import Path

# API endpoint
API_URL = "http://127.0.0.1:5000/predict"
TEST_IMAGE = Path("test_images/test_image_simple.png")

print("=" * 80)
print("TESTING HEATMAP GENERATION")
print("=" * 80)

if not TEST_IMAGE.exists():
    print(f"❌ Test image not found: {TEST_IMAGE}")
    exit(1)

print(f"\n✓ Test image found: {TEST_IMAGE}")
print(f"  File size: {TEST_IMAGE.stat().st_size / 1024:.1f} KB")

# Read test image
with open(TEST_IMAGE, 'rb') as f:
    image_data = f.read()

print(f"\n📤 Sending POST request to {API_URL}")
print(f"   Image size: {len(image_data)} bytes")

# Send prediction request
try:
    response = requests.post(
        API_URL,
        files={'image': ('test_image.png', image_data, 'image/png')}
    )
    print(f"\n✓ Response received (status: {response.status_code})")
    
    # Parse JSON response
    result = response.json()
    
    print("\n" + "=" * 80)
    print("RESPONSE DATA")
    print("=" * 80)
    print(json.dumps(result, indent=2))
    
    # Check for heatmap
    print("\n" + "=" * 80)
    print("HEATMAP CHECK")
    print("=" * 80)
    
    if 'explanation' in result and result['explanation']:
        explanation = result['explanation']
        
        if 'visualization_path' in explanation:
            viz_path = explanation['visualization_path']
            print(f"✓ Visualization path found: {viz_path}")
            
            # Try to fetch the heatmap
            if viz_path:
                heatmap_url = f"http://127.0.0.1:5000/{viz_path}"
                print(f"\n📥 Attempting to fetch heatmap from: {heatmap_url}")
                
                heatmap_response = requests.get(heatmap_url)
                print(f"   Status: {heatmap_response.status_code}")
                
                if heatmap_response.status_code == 200:
                    print(f"   ✓ Heatmap successfully retrieved ({len(heatmap_response.content)} bytes)")
                else:
                    print(f"   ❌ Failed to retrieve heatmap: {heatmap_response.text}")
            else:
                print("❌ visualization_path is None or empty")
        else:
            print("❌ visualization_path key not found in explanation")
        
        print(f"\n📊 Explanation keys: {list(explanation.keys())}")
    else:
        print("❌ No explanation found in response")
    
    # Check predictions
    print("\n" + "=" * 80)
    print("PREDICTIONS")
    print("=" * 80)
    
    if 'cnn' in result:
        cnn = result['cnn']
        print(f"CNN Status: {cnn.get('status', 'unknown')}")
        print(f"CNN Prediction: {cnn.get('predicted_age', 'N/A')} years")
    
    if 'vit' in result:
        vit = result['vit']
        print(f"ViT Status: {vit.get('status', 'unknown')}")
        print(f"ViT Prediction: {vit.get('predicted_age', 'N/A')} years")

except requests.exceptions.ConnectionError:
    print(f"\n❌ Could not connect to API at {API_URL}")
    print("   Make sure Flask backend is running: python app.py")
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 80)
