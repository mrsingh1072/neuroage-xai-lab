"""
Quick Configuration Script
Run this script to verify your backend setup and prepare for deployment.
"""

import os
import sys
from pathlib import Path

# Colors for output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


def check_directory_structure():
    """Check if required directories exist."""
    print(f"\n{Colors.BOLD}Checking Directory Structure...{Colors.ENDC}")
    
    required_dirs = {
        'backend': 'Backend code directory',
        'model': 'Model weights directory',
        'data': 'Data directory'
    }
    
    all_exist = True
    for dir_name, description in required_dirs.items():
        dir_path = Path(dir_name)
        if dir_path.exists():
            print(f"{Colors.OKGREEN}✓{Colors.ENDC} {dir_name}/ ({description})")
        else:
            print(f"{Colors.WARNING}⚠{Colors.ENDC} {dir_name}/ ({description}) - {Colors.FAIL}NOT FOUND{Colors.ENDC}")
            all_exist = False
    
    return all_exist


def check_backend_files():
    """Check if all required backend files exist."""
    print(f"\n{Colors.BOLD}Checking Backend Files...{Colors.ENDC}")
    
    required_files = {
        'backend/app.py': 'Main Flask application',
        'backend/model_loader.py': 'Model loading module',
        'backend/utils.py': 'Utility functions',
        'backend/explainability.py': 'Explainability module',
        'backend/requirements.txt': 'Python dependencies',
        'backend/README.md': 'Documentation'
    }
    
    all_exist = True
    for file_path, description in required_files.items():
        if Path(file_path).exists():
            size = Path(file_path).stat().st_size
            print(f"{Colors.OKGREEN}✓{Colors.ENDC} {file_path} ({description}) - {size} bytes")
        else:
            print(f"{Colors.FAIL}✗{Colors.ENDC} {file_path} ({description}) - {Colors.FAIL}NOT FOUND{Colors.ENDC}")
            all_exist = False
    
    return all_exist


def check_model_file():
    """Check if model file exists."""
    print(f"\n{Colors.BOLD}Checking Model File...{Colors.ENDC}")
    
    model_path = Path("model/model.pth")
    if model_path.exists():
        size = model_path.stat().st_size / (1024 * 1024)  # Convert to MB
        print(f"{Colors.OKGREEN}✓{Colors.ENDC} Model file found: {size:.2f} MB")
        return True
    else:
        print(f"{Colors.WARNING}⚠{Colors.ENDC} Model file not found at model/model.pth")
        print(f"   {Colors.OKCYAN}Download your trained model and place it at: model/model.pth{Colors.ENDC}")
        return False


def check_python_version():
    """Check Python version."""
    print(f"\n{Colors.BOLD}Checking Python Version...{Colors.ENDC}")
    
    version = sys.version_info
    if version.major == 3 and version.minor >= 8:
        print(f"{Colors.OKGREEN}✓{Colors.ENDC} Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"{Colors.FAIL}✗{Colors.ENDC} Python 3.8+ required. Found: {version.major}.{version.minor}")
        return False


def check_packages():
    """Check if required packages are installed."""
    print(f"\n{Colors.BOLD}Checking Installed Packages...{Colors.ENDC}")
    
    required_packages = {
        'flask': 'Flask',
        'torch': 'PyTorch',
        'PIL': 'Pillow',
        'numpy': 'NumPy',
        'werkzeug': 'Werkzeug'
    }
    
    all_installed = True
    for import_name, display_name in required_packages.items():
        try:
            module = __import__(import_name)
            version = getattr(module, '__version__', 'unknown')
            print(f"{Colors.OKGREEN}✓{Colors.ENDC} {display_name} (v{version})")
        except ImportError:
            print(f"{Colors.FAIL}✗{Colors.ENDC} {display_name} - {Colors.FAIL}NOT INSTALLED{Colors.ENDC}")
            all_installed = False
    
    return all_installed


def create_required_directories():
    """Create required directories if they don't exist."""
    print(f"\n{Colors.BOLD}Creating Required Directories...{Colors.ENDC}")
    
    dirs_to_create = [
        'uploads',
        'backend/heatmaps'
    ]
    
    for dir_path in dirs_to_create:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print(f"{Colors.OKGREEN}✓{Colors.ENDC} {dir_path}/")


def print_summary(checks):
    """Print summary of all checks."""
    print(f"\n{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}CONFIGURATION CHECK SUMMARY{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}\n")
    
    passed = sum(1 for check in checks.values() if check)
    total = len(checks)
    
    for check_name, result in checks.items():
        status = f"{Colors.OKGREEN}PASS{Colors.ENDC}" if result else f"{Colors.FAIL}FAIL{Colors.ENDC}"
        print(f"[{status}] {check_name}")
    
    print(f"\n{Colors.BOLD}Results: {passed}/{total} checks passed{Colors.ENDC}\n")
    
    if passed == total:
        print(f"{Colors.OKGREEN}{Colors.BOLD}✓ All checks passed! Backend is ready to use.{Colors.ENDC}\n")
        print_next_steps()
        return True
    else:
        print(f"{Colors.WARNING}{Colors.BOLD}⚠ Some checks failed. Please address the issues above.{Colors.ENDC}\n")
        return False


def print_next_steps():
    """Print next steps for getting started."""
    print(f"{Colors.BOLD}NEXT STEPS:{Colors.ENDC}\n")
    
    print("1. {0}Install Dependencies{1}".format(Colors.OKCYAN, Colors.ENDC))
    print("   cd backend")
    print("   pip install -r requirements.txt\n")
    
    print("2. {0}Download/Train Model{1}".format(Colors.OKCYAN, Colors.ENDC))
    print("   Place your trained model at: model/model.pth\n")
    
    print("3. {0}Start the Server{1}".format(Colors.OKCYAN, Colors.ENDC))
    print("   python backend/app.py\n")
    
    print("4. {0}Test the API{1}".format(Colors.OKCYAN, Colors.ENDC))
    print("   python backend/test_api.py\n")
    
    print("5. {0}Access API Documentation{1}".format(Colors.OKCYAN, Colors.ENDC))
    print("   Open: backend/README.md\n")
    
    print(f"{Colors.BOLD}For detailed documentation, see: backend/README.md{Colors.ENDC}\n")


def main():
    """Run configuration check."""
    print(f"{Colors.BOLD}{Colors.OKCYAN}")
    print(r"""
    ╔════════════════════════════════════════╗
    ║ Backend Configuration Check            ║
    ║ Brain Age Prediction API Setup         ║
    ╚════════════════════════════════════════╝
    """)
    print(Colors.ENDC)
    
    checks = {}
    
    # Run checks
    checks['Python Version'] = check_python_version()
    checks['Directory Structure'] = check_directory_structure()
    checks['Backend Files'] = check_backend_files()
    checks['Model File'] = check_model_file()
    checks['Package Installation'] = check_packages()
    
    # Create required directories
    create_required_directories()
    
    # Print summary
    all_passed = print_summary(checks)
    
    return all_passed


if __name__ == '__main__':
    try:
        success = main()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n{Colors.FAIL}Error: {str(e)}{Colors.ENDC}\n")
        sys.exit(1)
