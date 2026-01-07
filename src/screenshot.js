const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const config = require('./config');

class ScreenshotGenerator {
    constructor() {
        this.browser = null;
    }

    async initialize() {
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async captureScreenshot(htmlFile, outputFile) {
        const page = await this.browser.newPage();
        
        await page.setViewport({
            width: config.output.viewport.width,
            height: config.output.viewport.height,
            deviceScaleFactor: 2
        });

        const htmlPath = path.join(config.paths.output, htmlFile);
        await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

        const screenshotPath = path.join(config.paths.output, outputFile);
        
        const element = await page.$('.relative.w-full.max-w-4xl');
        if (element) {
            await element.screenshot({
                path: screenshotPath,
                type: config.output.screenshotFormat,
                quality: config.output.screenshotQuality
            });
        } else {
            await page.screenshot({
                path: screenshotPath,
                type: config.output.screenshotFormat,
                quality: config.output.screenshotQuality,
                fullPage: false
            });
        }

        await page.close();
        return screenshotPath;
    }

    async generateAll() {
        console.log('📸 Starting screenshot generation...\n');

        const htmlFiles = fs.readdirSync(config.paths.output)
            .filter(file => file.endsWith('.html'));

        if (htmlFiles.length === 0) {
            console.log('❌ No HTML files found in output directory.');
            console.log('   Run "npm run generate" first.\n');
            return;
        }

        await this.initialize();

        let successCount = 0;
        let failCount = 0;

        for (const htmlFile of htmlFiles) {
            const baseName = path.basename(htmlFile, '.html');
            const screenshotFile = `${baseName}.${config.output.screenshotFormat}`;

            try {
                await this.captureScreenshot(htmlFile, screenshotFile);
                console.log(`✅ Screenshot: ${screenshotFile}`);
                successCount++;
            } catch (error) {
                console.error(`❌ Failed to capture ${htmlFile}:`, error.message);
                failCount++;
            }
        }

        await this.close();

        console.log('\n📊 Screenshot Summary:');
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ❌ Failed: ${failCount}`);
        console.log(`   📁 Output directory: ${config.paths.output}\n`);
    }

    async generateSingle(thumbnailId) {
        console.log(`📸 Generating screenshot for: ${thumbnailId}\n`);

        const htmlFile = `${thumbnailId}.html`;
        const htmlPath = path.join(config.paths.output, htmlFile);

        if (!fs.existsSync(htmlPath)) {
            console.log(`❌ HTML file not found: ${htmlFile}`);
            console.log('   Run "npm run generate" first.\n');
            return;
        }

        await this.initialize();

        const screenshotFile = `${thumbnailId}.${config.output.screenshotFormat}`;

        try {
            const screenshotPath = await this.captureScreenshot(htmlFile, screenshotFile);
            console.log(`✅ Screenshot saved: ${screenshotPath}\n`);
        } catch (error) {
            console.error(`❌ Failed to capture screenshot:`, error.message);
        }

        await this.close();
    }
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const generator = new ScreenshotGenerator();

    (async () => {
        if (args[0] === '--all') {
            await generator.generateAll();
        } else if (args[0] && args[0] !== '--all') {
            await generator.generateSingle(args[0]);
        } else {
            console.log('Usage:');
            console.log('  npm run screenshot:all        - Generate all screenshots');
            console.log('  npm run screenshot ID         - Generate single screenshot');
        }
    })();
}

module.exports = ScreenshotGenerator;
