#!/bin/bash

echo "========================================"
echo "Suika Bot - Quick Start Setup"
echo "========================================"
echo ""

# Check Node.js
echo "[1/4] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found!"
    exit 1
fi
echo "Node.js $(node -v) - OK"
echo ""

# Install dependencies
echo "[2/4] Installing dependencies..."
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "Dependencies installed - OK"
else
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo ""

# Check configuration
echo "[3/4] Checking configuration..."
if [ ! -f "config.json" ]; then
    echo "ERROR: config.json not found!"
    exit 1
fi

TOKEN=$(grep -oP '"token":\s*"\K[^"]+' config.json)
if [ -z "$TOKEN" ] || [ "$TOKEN" == "" ]; then
    echo "WARNING: Telegram bot token not set!"
    echo "Update config.json with your bot token"
fi
echo "Configuration - OK"
echo ""

# Start bot
echo "[4/4] Starting bot..."
echo "========================================"
npm start
