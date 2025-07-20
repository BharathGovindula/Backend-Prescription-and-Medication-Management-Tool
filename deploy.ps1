# Deployment script for Prescription and Medication Management Tool

# Colors for output
$Green = "\033[0;32m"
$Yellow = "\033[0;33m"
$Red = "\033[0;31m"
$NC = "\033[0m" # No Color

Write-Host "${Yellow}Prescription and Medication Management Tool - Deployment Script${NC}"
Write-Host "${Yellow}==================================================${NC}"

# Function to check if a command exists
function Test-CommandExists {
    param ($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

# Check for required tools
Write-Host "${Yellow}Checking for required tools...${NC}"

$hasGit = Test-CommandExists "git"
$hasNode = Test-CommandExists "node"
$hasNpm = Test-CommandExists "npm"
$hasNetlifyCLI = Test-CommandExists "netlify"

if (-not $hasGit) {
    Write-Host "${Red}Error: Git is not installed. Please install Git and try again.${NC}"
    exit 1
}

if (-not $hasNode) {
    Write-Host "${Red}Error: Node.js is not installed. Please install Node.js and try again.${NC}"
    exit 1
}

if (-not $hasNpm) {
    Write-Host "${Red}Error: npm is not installed. Please install npm and try again.${NC}"
    exit 1
}

Write-Host "${Green}All required tools are installed.${NC}"

# Frontend deployment preparation
Write-Host "\n${Yellow}Preparing frontend for deployment...${NC}"

Set-Location -Path "./medication-frontend"

# Install dependencies
Write-Host "${Yellow}Installing frontend dependencies...${NC}"
npm install

# Build the frontend
Write-Host "${Yellow}Building frontend...${NC}"
npm run build

# Check if Netlify CLI is installed
if ($hasNetlifyCLI) {
    # Deploy to Netlify if CLI is available
    Write-Host "${Yellow}Deploying to Netlify...${NC}"
    Write-Host "${Yellow}Note: You may need to authenticate with Netlify if not already logged in.${NC}"
    netlify deploy --prod
} else {
    Write-Host "${Yellow}Netlify CLI not found. To deploy to Netlify:${NC}"
    Write-Host "1. Install Netlify CLI: npm install -g netlify-cli"
    Write-Host "2. Login: netlify login"
    Write-Host "3. Deploy: netlify deploy --prod"
    Write-Host "\nAlternatively, you can deploy manually through the Netlify web interface."
}

# Return to root directory
Set-Location -Path ".."

# Backend deployment preparation
Write-Host "\n${Yellow}Preparing backend for deployment...${NC}"

Set-Location -Path "./medication-backend"

# Install dependencies
Write-Host "${Yellow}Installing backend dependencies...${NC}"
npm install

Write-Host "\n${Green}Deployment preparation complete!${NC}"
Write-Host "${Yellow}To deploy the backend to Render:${NC}"
Write-Host "1. Push your code to GitHub"
Write-Host "2. Connect your repository to Render"
Write-Host "3. Configure the environment variables as specified in DEPLOYMENT_GUIDE.md"

# Return to root directory
Set-Location -Path ".."

Write-Host "\n${Green}Refer to DEPLOYMENT_GUIDE.md for detailed deployment instructions.${NC}"