#!/bin/bash

# Manual screenshot helper - opens files one by one
# Use Cmd+Shift+4 to capture each thumbnail

OUTPUT_DIR="output"

echo "📸 Manual Screenshot Helper"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Instructions:"
echo "1. Each HTML file will open in your browser"
echo "2. Use Cmd+Shift+4 to take screenshot"
echo "3. Drag to select the thumbnail area"
echo "4. Press Enter to open next file"
echo ""
echo "Screenshots will be saved to your Desktop."
echo "You can move them to the output/ folder later."
echo ""
echo "Press Enter to start..."
read

count=0
for html_file in "$OUTPUT_DIR"/*.html; do
    if [ -f "$html_file" ]; then
        filename=$(basename "$html_file" .html)
        ((count++))
        
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "[$count] Opening: $filename.html"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        open "$html_file"
        
        echo ""
        echo "✋ Take screenshot now:"
        echo "   1. Press Cmd+Shift+4"
        echo "   2. Drag to select thumbnail"
        echo "   3. Release to capture"
        echo ""
        echo "💡 Tip: Save as '$filename.png' for easy identification"
        echo ""
        echo "Press Enter when done to continue to next..."
        read
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All files opened! ($count thumbnails)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Your screenshots are on the Desktop"
echo ""
echo "To move them to output folder:"
echo "   mv ~/Desktop/saas-converts.png output/"
echo "   mv ~/Desktop/rapid-mvp.png output/"
echo "   mv ~/Desktop/enterprise-scale.png output/"
echo ""
