#!/usr/bin/env python3
"""
Grad-CAM Explainability Example Script
Demonstrates how to use the Grad-CAM feature to explain brain age predictions.
"""

import requests
import json
from pathlib import Path
import sys
from io import BytesIO
from PIL import Image

# Configuration
API_URL = "http://localhost:5000"
HEATMAPS_DIR = Path("backend/heatmaps")


def example_1_basic_prediction():
    """
    Example 1: Basic prediction with automatic Grad-CAM generation.
    """
    print("\n" + "="*70)
    print("EXAMPLE 1: Basic Prediction with Auto Grad-CAM")
    print("="*70)
    
    # Check if test image exists
    test_images = list(Path("backend/test_images").glob("*.png"))
    if not test_images:
        print("❌ No test images found. Run: python generate_test_image.py")
        return
    
    test_image = test_images[0]
    print(f"✓ Using test image: {test_image}")
    
    # Make prediction
    print("\nMaking prediction...")
    with open(test_image, 'rb') as f:
        response = requests.post(
            f"{API_URL}/predict",
            files={'image': f}
        )
    
    if response.status_code != 200:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        return
    
    result = response.json()
    
    # Display results
    print("\n📊 PREDICTION RESULTS")
    print("-" * 70)
    print(f"Age: {result['predicted_age']} years")
    print(f"Age (int): {result['predicted_age_int']} years")
    
    if 'explanation' in result:
        exp = result['explanation']
        
        print(f"\n🎯 CONFIDENCE")
        if 'confidence' in exp:
            conf = exp['confidence']
            print(f"  Score: {conf.get('score', 'N/A')}")
            print(f"  Level: {conf.get('level', 'N/A')}")
            print(f"  Color: {conf.get('color', 'N/A')}")
        
        print(f"\n🧠 BRAIN REGIONS ANALYZED")
        if 'important_regions' in exp:
            for region in exp['important_regions']:
                print(f"  • {region}")
        
        print(f"\n🔬 CONTRIBUTING FEATURES")
        if 'contributing_features' in exp:
            for feature in exp['contributing_features']:
                print(f"  • {feature}")
        
        print(f"\n📝 INTERPRETATION")
        if 'interpretation' in exp:
            print(f"  {exp['interpretation']}")
        
        print(f"\n🖼️  HEATMAP VISUALIZATION")
        if 'visualization_path' in exp and exp['visualization_path']:
            print(f"  Saved to: {exp['visualization_path']}")
            print(f"  This shows which brain regions most influenced the prediction.")
            print(f"  Red/Yellow = High influence, Blue = Low influence")
        else:
            print(f"  Heatmap generation skipped.")
    
    print(f"\n✅ Status: {result.get('status', 'unknown')}")
    print("-" * 70)


def example_2_confidence_analysis():
    """
    Example 2: Analyze confidence scores across different images.
    """
    print("\n" + "="*70)
    print("EXAMPLE 2: Confidence Analysis Across Multiple Images")
    print("="*70)
    
    test_images = list(Path("backend/test_images").glob("*.png"))
    if not test_images:
        print("❌ No test images found. Run: python generate_test_image.py")
        return
    
    print(f"✓ Found {len(test_images)} test images\n")
    
    results = []
    for img_path in test_images[:3]:  # Limit to 3
        print(f"Processing: {img_path.name}...", end=" ")
        
        with open(img_path, 'rb') as f:
            response = requests.post(
                f"{API_URL}/predict",
                files={'image': f}
            )
        
        if response.status_code == 200:
            result = response.json()
            results.append({
                'filename': img_path.name,
                'age': result['predicted_age'],
                'confidence': result.get('explanation', {}).get('confidence', {})
            })
            print("✓")
        else:
            print("✗")
    
    # Display summary
    print("\n📊 CONFIDENCE COMPARISON")
    print("-" * 70)
    print(f"{'Image':<30} {'Age':<10} {'Confidence':<15}")
    print("-" * 70)
    
    for result in results:
        conf = result.get('confidence', {})
        conf_level = conf.get('level', 'Unknown')
        print(f"{result['filename']:<30} {result['age']:<10.1f} {conf_level:<15}")
    
    print("-" * 70)


def example_3_interpretation_details():
    """
    Example 3: Detailed interpretation analysis.
    """
    print("\n" + "="*70)
    print("EXAMPLE 3: Detailed Interpretation Analysis")
    print("="*70)
    
    test_images = list(Path("backend/test_images").glob("*.png"))
    if not test_images:
        print("❌ No test images found. Run: python generate_test_image.py")
        return
    
    test_image = test_images[0]
    
    print(f"Making prediction on {test_image.name}...\n")
    with open(test_image, 'rb') as f:
        response = requests.post(
            f"{API_URL}/predict",
            files={'image': f}
        )
    
    if response.status_code != 200:
        print(f"❌ Error: {response.status_code}")
        return
    
    result = response.json()
    exp = result.get('explanation', {})
    
    print("📋 FULL INTERPRETATION")
    print("-" * 70)
    
    # Age breakdown
    print("\n🎂 AGE BREAKDOWN")
    print(f"  Years: {exp.get('age_years', 'N/A')}")
    print(f"  Months: {exp.get('age_months', 'N/A')}")
    print(f"  Decimal: {result.get('predicted_age', 'N/A')}")
    
    # Confidence details
    print("\n🎯 CONFIDENCE DETAILS")
    conf = exp.get('confidence', {})
    print(f"  Score: {conf.get('score', 'N/A')} (0-1 scale)")
    print(f"  Level: {conf.get('level', 'N/A')}")
    print(f"  Interpretation: ", end="")
    
    level = conf.get('level', '')
    if level == 'High':
        print("Strong model confidence in this prediction")
    elif level == 'Medium':
        print("Moderate model confidence with some uncertainty")
    elif level == 'Low':
        print("Low confidence - prediction should be verified")
    else:
        print("Unable to determine")
    
    # Brain regions
    print("\n🧠 BRAIN REGIONS ANALYZED")
    for region in exp.get('important_regions', []):
        print(f"  • {region}")
    
    # Features
    print("\n🔬 STRUCTURAL FEATURES")
    for feature in exp.get('contributing_features', []):
        print(f"  • {feature}")
    
    # Full interpretation
    print("\n📝 MODEL INTERPRETATION")
    interpretation = exp.get('interpretation', 'No interpretation available')
    # Word wrap
    words = interpretation.split()
    line = ""
    for word in words:
        if len(line) + len(word) > 70:
            print(f"  {line}")
            line = word
        else:
            line += " " + word if line else word
    if line:
        print(f"  {line}")
    
    # Methodology
    print("\n🔬 METHODOLOGY")
    methodology = exp.get('methodology', 'N/A')
    print(f"  {methodology}")
    
    # Disclaimer
    print("\n⚠️  DISCLAIMER")
    disclaimer = exp.get('disclaimer', 'N/A')
    # Word wrap
    words = disclaimer.split()
    line = ""
    for word in words:
        if len(line) + len(word) > 70:
            print(f"  {line}")
            line = word
        else:
            line += " " + word if line else word
    if line:
        print(f"  {line}")
    
    print("-" * 70)


def example_4_heatmap_visualization():
    """
    Example 4: Access and display heatmap visualization.
    """
    print("\n" + "="*70)
    print("EXAMPLE 4: Heatmap Visualization")
    print("="*70)
    
    test_images = list(Path("backend/test_images").glob("*.png"))
    if not test_images:
        print("❌ No test images found. Run: python generate_test_image.py")
        return
    
    test_image = test_images[0]
    
    print(f"Generating Grad-CAM heatmap for {test_image.name}...\n")
    with open(test_image, 'rb') as f:
        response = requests.post(
            f"{API_URL}/predict",
            files={'image': f}
        )
    
    if response.status_code != 200:
        print(f"❌ Error: {response.status_code}")
        return
    
    result = response.json()
    exp = result.get('explanation', {})
    heatmap_path = exp.get('visualization_path')
    
    print("📊 HEATMAP INFORMATION")
    print("-" * 70)
    
    if heatmap_path:
        print(f"✓ Heatmap generated successfully")
        print(f"  Path: {heatmap_path}")
        
        heatmap_file = Path(heatmap_path)
        if heatmap_file.exists():
            size_mb = heatmap_file.stat().st_size / (1024 * 1024)
            print(f"  Size: {size_mb:.2f} MB")
            print(f"  Format: PNG")
            print(f"\n🎨 COLORMAP INTERPRETATION:")
            print(f"  Red/Yellow:  High influence on prediction")
            print(f"  Green/Cyan:  Medium influence")
            print(f"  Blue:        Low influence")
            print(f"  Purple:      Very low influence")
            print(f"\n  The heatmap overlay shows which brain regions most")
            print(f"  contributed to the age prediction.")
        else:
            print(f"⚠️  File not found at: {heatmap_path}")
    else:
        print(f"❌ Heatmap was not generated")
    
    print("-" * 70)


def example_5_batch_processing():
    """
    Example 5: Batch processing multiple images.
    """
    print("\n" + "="*70)
    print("EXAMPLE 5: Batch Processing")
    print("="*70)
    
    test_images = list(Path("backend/test_images").glob("*.png"))
    if len(test_images) < 2:
        print("⚠️  Need at least 2 test images for batch processing")
        print("   Run: python generate_test_image.py")
        return
    
    print(f"Processing {len(test_images)} images...\n")
    
    files = [
        ('images', open(img_path, 'rb'))
        for img_path in test_images[:3]
    ]
    
    response = requests.post(
        f"{API_URL}/predict/batch",
        files=files
    )
    
    # Close files
    for _, f in files:
        f.close()
    
    if response.status_code != 200:
        print(f"❌ Error: {response.status_code}")
        return
    
    result = response.json()
    
    print("📊 BATCH RESULTS")
    print("-" * 70)
    print(f"Total files: {result.get('total_files', 0)}")
    print(f"Successful: {result.get('successful_predictions', 0)}")
    print(f"Failed: {result.get('failed_predictions', 0)}")
    
    print(f"\n{'File':<30} {'Predicted Age':<15} {'Confidence':<15}")
    print("-" * 70)
    
    for pred in result.get('predictions', []):
        filename = pred.get('filename', 'Unknown')[:30]
        age = pred.get('predicted_age', 0)
        conf = pred.get('confidence', 'Unknown')
        print(f"{filename:<30} {age:<15.1f} {conf:<15}")
    
    print("-" * 70)
    print(f"Note: {result.get('note', 'No note')}")


def main():
    """Run all examples."""
    print("\n" + "="*70)
    print("🧠 GRAD-CAM EXPLAINABILITY EXAMPLES")
    print("="*70)
    
    # Check API connection
    print("\nChecking API connection...")
    try:
        response = requests.get(f"{API_URL}/health", timeout=2)
        if response.status_code == 200:
            print("✓ API is running")
        else:
            print("❌ API returned error")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API at", API_URL)
        print("   Make sure backend is running: python app.py")
        return
    
    # Run examples
    examples = [
        ("1", "Basic Prediction with Auto Grad-CAM", example_1_basic_prediction),
        ("2", "Confidence Analysis", example_2_confidence_analysis),
        ("3", "Detailed Interpretation", example_3_interpretation_details),
        ("4", "Heatmap Visualization", example_4_heatmap_visualization),
        ("5", "Batch Processing", example_5_batch_processing),
    ]
    
    print("\nAvailable examples:")
    for num, title, _ in examples:
        print(f"  {num}. {title}")
    
    if len(sys.argv) > 1:
        choice = sys.argv[1]
    else:
        choice = input("\nSelect example (1-5) or 'all': ").strip()
    
    if choice.lower() == 'all':
        for _, _, func in examples:
            try:
                func()
            except Exception as e:
                print(f"Error: {e}")
    else:
        for num, _, func in examples:
            if choice == num:
                try:
                    func()
                except Exception as e:
                    print(f"Error: {e}")
                return
        
        print("Invalid choice")


if __name__ == "__main__":
    main()
