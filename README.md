# 🎨 Thumbnail Factory

> Production-ready automated thumbnail generator for Fiverr gigs and freelance services. Generate beautiful, consistent thumbnails at scale with data-driven templates and automated screenshot capture.

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.40-blue)](https://playwright.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Features

- 🚀 **Scalable Generation** - Create unlimited thumbnails from a single base template
- 📸 **Automated Screenshots** - Playwright-powered screenshot capture with custom filenames
- 📁 **Organized Output** - Separate folders for each gig (HTML + screenshots + assets)
- 🎯 **Data-Driven** - JSON-based configuration for easy content management
- 🔧 **Environment Config** - `.env` support for flexible deployment
- 📝 **Custom Filenames** - Define screenshot names in JSON data
- ✅ **Validation System** - Pre-generation validation ensures data integrity
- 🛡️ **Error Handling** - Comprehensive error handling and logging
- 📊 **Logger** - Multi-level logging (error, warn, info, debug)
- 🎨 **Template System** - Tailwind CSS-based templates with placeholder replacement

## 📦 Installation

### Prerequisites

- Node.js 16+ and npm 8+
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/bilal1133/thumbnail-factory.git
cd thumbnail-factory

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Generate thumbnails and screenshots
npm run build
```

## 🚀 Usage

### Basic Commands

```bash
# Generate all thumbnails and screenshots
npm run build

# Generate only HTML thumbnails
npm run generate

# Generate only screenshots (regenerates HTML first)
npm run screenshot:all

# Generate single thumbnail
npm run generate:single <thumbnail-id>

# Validate configuration
npm run validate

# Clean output directory
npm run clean
```

### Quick Example

1. **Edit your thumbnail data** in `data/thumbnails.json`:

```json
{
  "defaults": {
    "theme": {
      "primaryColor": "#3B82F6",
      "accentColor": "#60A5FA"
    },
    "branding": {
      "logo": "tkturners.png",
      "badge": "fiver.png"
    }
  },
  "thumbnails": [
    {
      "id": "my-awesome-gig",
      "filename": "custom-screenshot-name",
      "title": {
        "line1": "Professional",
        "line2": "Web",
        "line3": "Development"
      },
      "badge": {
        "text": "Premium Service",
        "color": "blue-bright"
      },
      "description": "Full-stack development with modern technologies",
      "founderImage": "founder_avatar_2.png"
    }
  ]
}
```

2. **Run the generator**:

```bash
npm run build
```

3. **Find your output** in `output/my-awesome-gig/`:
   - `my-awesome-gig.html` - The thumbnail HTML
   - `screenshots/custom-screenshot-name.png` - The screenshot
   - `assets/` - All required images

## 📂 Project Structure

```
thumbnail-factory/
├── src/
│   ├── generator.js          # Main thumbnail generator
│   ├── screenshot-playwright.js  # Screenshot capture
│   ├── validator.js          # Data validation
│   ├── logger.js            # Logging utility
│   └── config.js            # Configuration
├── data/
│   └── thumbnails.json      # Thumbnail content data
├── templates/
│   └── base-template.html   # Base thumbnail template
├── assets/
│   └── images/              # Source images
├── output/                  # Generated files (gitignored)
│   ├── gig-name-1/
│   │   ├── gig-name-1.html
│   │   ├── screenshots/
│   │   │   └── custom-name.png
│   │   └── assets/
│   └── gig-name-2/
│       └── ...
├── .env                     # Environment variables (gitignored)
├── .env.example            # Environment template
└── package.json            # Dependencies and scripts
```

## ⚙️ Configuration

### Environment Variables

Edit `.env` to customize behavior:

```bash
# Logging
LOG_LEVEL=info              # error, warn, info, debug
LOG_TO_FILE=false           # Enable file logging

# Output
USE_GIG_FOLDERS=true        # Separate folders per gig
SCREENSHOT_SUBFOLDER=screenshots

# Screenshot Settings
VIEWPORT_WIDTH=1920         # Screenshot width
VIEWPORT_HEIGHT=1080        # Screenshot height
SCREENSHOT_FORMAT=png       # png or jpeg
SCREENSHOT_QUALITY=90       # 1-100 (for jpeg)

# Environment
NODE_ENV=production
```

### Thumbnail Data Schema

Each thumbnail in `data/thumbnails.json` requires:

```json
{
  "id": "unique-gig-id",           // Required: Folder/file name
  "filename": "screenshot-name",    // Optional: Custom screenshot filename
  "title": {
    "line1": "First Line",
    "line2": "Second Line",
    "line3": "Third Line"
  },
  "badge": {
    "text": "Badge Text",
    "color": "blue-bright"          // Tailwind color class
  },
  "description": "Gig description",
  "founderImage": "avatar.png",     // From assets/images/
  "statusBadge": {
    "text": "Status",
    "show": true
  },
  "theme": {                        // Optional: Override defaults
    "primaryColor": "#3B82F6",
    "accentColor": "#60A5FA"
  }
}
```

## 🎨 Customization

### Modify Base Template

Edit `templates/base-template.html` to change the design. Use placeholders:

- `{{TITLE}}` - Page title
- `{{PRIMARY_COLOR}}` - Primary theme color
- `{{ACCENT_COLOR}}` - Accent theme color
- `{{TITLE_LINE1}}`, `{{TITLE_LINE2}}`, `{{TITLE_LINE3}}` - Title lines
- `{{BADGE_TEXT}}` - Badge text
- `{{DESCRIPTION}}` - Description text
- `{{FOUNDER_IMAGE}}` - Founder image path
- `{{LOGO_IMAGE}}` - Logo image path
- `{{BADGE_IMAGE}}` - Badge image path

### Add New Assets

1. Place images in `assets/images/`
2. Reference them in `thumbnails.json`
3. Run `npm run build`

## 🔍 Validation

The system validates:

- ✅ Required fields (id, title, badge, description)
- ✅ Image file existence
- ✅ Hex color format
- ✅ Duplicate IDs
- ✅ Template placeholders
- ✅ JSON syntax

Run validation manually:

```bash
npm run validate
```

## 📊 Logging

Logs include:

- **Error**: Critical failures
- **Warn**: Non-critical issues
- **Info**: General information (default)
- **Debug**: Detailed debugging info

Enable debug logging:

```bash
# In .env
LOG_LEVEL=debug
LOG_TO_FILE=true
```

Logs saved to `logs/app.log` when file logging is enabled.

## 🛠️ Development

### Adding New Thumbnails

1. Add entry to `data/thumbnails.json`
2. Add any new images to `assets/images/`
3. Run `npm run build`

### Modifying the Template

1. Edit `templates/base-template.html`
2. Test with `npm run build`
3. All thumbnails update automatically

### Debugging

```bash
# Enable debug mode
echo "LOG_LEVEL=debug" >> .env

# Run with detailed logs
npm run build

# Check logs
cat logs/app.log
```

## 🚨 Troubleshooting

### Screenshots Fail

**Issue**: Playwright browser launch fails

**Solution**:
```bash
# Reinstall Playwright browsers
npx playwright install
```

### Images Not Loading

**Issue**: Broken image links in HTML

**Solution**:
- Verify images exist in `assets/images/`
- Check filename spelling in JSON
- Ensure assets are copied (check `output/gig-name/assets/`)

### Validation Errors

**Issue**: Generation fails with validation errors

**Solution**:
```bash
# Run validator to see specific issues
npm run validate

# Fix issues in data/thumbnails.json
# Re-run generation
npm run build
```

## 📝 Scripts Reference

| Command | Description |
|---------|-------------|
| `npm start` | Alias for `npm run build` |
| `npm run build` | Clean, generate HTML, and capture screenshots |
| `npm run build:fast` | Generate screenshots only (skips clean) |
| `npm run generate` | Generate HTML thumbnails only |
| `npm run generate:single <id>` | Generate single thumbnail |
| `npm run screenshot:all` | Capture all screenshots |
| `npm run validate` | Validate configuration |
| `npm run clean` | Remove output and logs |
| `npm run clean:all` | Remove output, logs, and node_modules |

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [Playwright](https://playwright.dev/) for reliable screenshot capture
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Node.js](https://nodejs.org/)

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: [Your Contact Info]

---

**Made with ❤️ by TKTurners**

*Automate your thumbnail creation and focus on what matters - delivering great services!*
