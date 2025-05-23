#!/bin/bash

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to run Node.js example
run_nodejs_example() {
  echo -e "${BLUE}Running Node.js OPC Client Example${NC}"
  echo "--------------------------------------"
  
  # Check if Node.js is installed
  if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js to run this example.${NC}"
    return 1
  fi
  
  # Ensure the Node.js package is built
  echo -e "${YELLOW}Building Node.js package...${NC}"
  cd packages/nodejs
  pnpm install
  pnpm run build
  cd "$SCRIPT_DIR"
  
  # Run the example
  echo -e "${GREEN}Starting Node.js example:${NC}"
  node examples/nodejs/basic-example.js
}

# Function to run Python example
run_python_example() {
  echo -e "${BLUE}Running Python OPC Client Example${NC}"
  echo "-------------------------------------"
  
  # Check if Python is installed
  if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed. Please install Python 3 to run this example.${NC}"
    return 1
  fi
  
  # Create and activate virtual environment if it doesn't exist
  if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv .venv
  fi
  
  # Activate virtual environment and install the Python package
  echo -e "${YELLOW}Installing Python package...${NC}"
  . .venv/bin/activate
  pip install --no-verify-ssl -e packages/python
  
  # Run the example
  echo -e "${GREEN}Starting Python example:${NC}"
  python examples/python/basic-example.py
  
  # Deactivate virtual environment
  deactivate
}

# Main menu
show_menu() {
  echo -e "${BLUE}OPC Client Examples${NC}"
  echo "===================="
  echo "1. Run Node.js Example"
  echo "2. Run Python Example"
  echo "3. Run Both Examples"
  echo "0. Exit"
  echo ""
  echo -n "Please select an option: "
  read -r choice
  
  case $choice in
    1) run_nodejs_example ;;
    2) run_python_example ;;
    3) run_nodejs_example && echo "" && run_python_example ;;
    0) exit 0 ;;
    *) echo -e "${RED}Invalid option. Please try again.${NC}" && show_menu ;;
  esac
}

# Check for command line arguments
if [ "$1" == "nodejs" ]; then
  run_nodejs_example
elif [ "$1" == "python" ]; then
  run_python_example
elif [ "$1" == "all" ]; then
  run_nodejs_example && echo "" && run_python_example
else
  show_menu
fi
