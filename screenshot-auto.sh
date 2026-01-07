#!/bin/bash

# Automated screenshot script using Chrome headless
# Works on macOS without Puppeteer issues

OUTPUT_DIR="output"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Check if Chrome is installed
if [ ! -f "$CHROME" ]; then
    echo "❌ Google Chrome not found at: $CHROME"
    echo "Please install Google Chrome or update the CHROME path in this script."
    exit 1
fi

echo "📸 Starting automated screenshot generation..."
echo ""

success=0
failed=0

for html_file in "$OUTPUT_DIR"/*.html; do
    if [ -f "$html_file" ]; then
        filename=$(basename "$html_file" .html)
        output_png="$OUTPUT_DIR/$filename.png"
        
        echo "Capturing: $filename.html"
        
        # Use Chrome headless to capture screenshot
        "$CHROME" --headless --disable-gpu --screenshot="$output_png" \
            --window-size=1920,1080 \
            --default-background-color=0 \
            "file://$(pwd)/$html_file" 2>/dev/null
        
        if [ $? -eq 0 ] && [ -f "$output_png" ]; then
            echo "✅ Generated: $filename.png"
            ((success++))
        else
            echo "❌ Failed: $filename.png"
            ((failed++))
        fi
    fi
done

echo ""
echo "📊 Screenshot Summary:"
echo "   ✅ Success: $success"
echo "   ❌ Failed: $failed"
echo "   📁 Output directory: $OUTPUT_DIR"
echo ""
