#!/bin/bash

# Simple screenshot script for macOS
# Opens HTML files in browser for manual screenshot

OUTPUT_DIR="output"

echo "📸 Opening thumbnails in browser for screenshots..."
echo ""
echo "Instructions:"
echo "1. Each HTML file will open in your default browser"
echo "2. Press Cmd+Shift+4 to take a screenshot"
echo "3. Select the thumbnail area"
echo "4. Screenshot will be saved to Desktop"
echo ""
echo "Press Enter to start..."
read

for html_file in "$OUTPUT_DIR"/*.html; do
    if [ -f "$html_file" ]; then
        filename=$(basename "$html_file" .html)
        echo "Opening: $filename.html"
        open "$html_file"
        echo "Take screenshot now (Cmd+Shift+4), then press Enter for next..."
        read
    fi
done

echo ""
echo "✅ Done! Move screenshots from Desktop to output/ folder if needed."
