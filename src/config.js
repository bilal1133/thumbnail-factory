require('dotenv').config();
const path = require('path');

const config = {
    paths: {
        root: path.join(__dirname, '..'),
        data: path.join(__dirname, '..', 'data'),
        templates: path.join(__dirname, '..', 'templates'),
        output: path.join(__dirname, '..', 'output'),
        assets: path.join(__dirname, '..', 'assets'),
        images: path.join(__dirname, '..', 'assets', 'images'),
        logos: path.join(__dirname, '..', 'assets', 'logos')
    },
    
    files: {
        dataFile: 'thumbnails.json',
        baseTemplate: 'base-template.html'
    },
    
    output: {
        copyAssets: true,
        generateScreenshots: false,
        screenshotFormat: process.env.SCREENSHOT_FORMAT || 'png',
        screenshotQuality: parseInt(process.env.SCREENSHOT_QUALITY) || 100,
        viewport: {
            width: parseInt(process.env.VIEWPORT_WIDTH) || 1920,
            height: parseInt(process.env.VIEWPORT_HEIGHT) || 1080
        },
        useGigFolders: process.env.USE_GIG_FOLDERS !== 'false',
        screenshotSubfolder: process.env.SCREENSHOT_SUBFOLDER || 'screenshots'
    },
    
    validation: {
        required: ['id', 'title', 'badge', 'description'],
        imageFormats: ['.png', '.jpg', '.jpeg', '.svg', '.webp']
    }
};

module.exports = config;
