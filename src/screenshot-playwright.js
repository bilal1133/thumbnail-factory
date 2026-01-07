const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const ThumbnailGenerator = require('./generator');
const logger = require('./logger');

class PlaywrightScreenshotGenerator {
    constructor() {
        this.browser = null;
        this.thumbnailGenerator = new ThumbnailGenerator();
        this.thumbnailData = null;
    }
    
    loadThumbnailData() {
        if (!this.thumbnailData) {
            const dataPath = path.join(config.paths.data, config.files.dataFile);
            const rawData = fs.readFileSync(dataPath, 'utf8');
            this.thumbnailData = JSON.parse(rawData);
        }
        return this.thumbnailData;
    }
    
    getFilename(gigId) {
        const data = this.loadThumbnailData();
        const thumbnail = data.thumbnails.find(t => t.id === gigId);
        return thumbnail && thumbnail.filename ? thumbnail.filename : gigId;
    }

    async initialize() {
        try {
            logger.debug('Initializing Playwright browser...');
            this.browser = await chromium.launch({
                headless: true,
                timeout: 30000
            });
            logger.debug('Browser initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize browser', { error: error.message });
            throw new Error(`Browser initialization failed: ${error.message}`);
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async captureScreenshot(gigId, htmlFile, outputFile) {
        let page = null;
        try {
            page = await this.browser.newPage();
            
            await page.setViewportSize({
                width: config.output.viewport.width,
                height: config.output.viewport.height
            });

            const htmlPath = config.output.useGigFolders
                ? path.join(config.paths.output, gigId, htmlFile)
                : path.join(config.paths.output, htmlFile);
            
            if (!fs.existsSync(htmlPath)) {
                throw new Error(`HTML file not found: ${htmlPath}`);
            }
            
            logger.debug(`Loading page: ${htmlPath}`);
            await page.goto(`file://${htmlPath}`, { 
                waitUntil: 'networkidle',
                timeout: 30000
            });

            const screenshotPath = config.output.useGigFolders
                ? path.join(config.paths.output, gigId, config.output.screenshotSubfolder, outputFile)
                : path.join(config.paths.output, outputFile);
            
            const element = await page.$('.relative.w-full.max-w-4xl');
            if (element) {
                await element.screenshot({
                    path: screenshotPath,
                    type: 'png'
                });
                logger.debug(`Screenshot captured (element): ${screenshotPath}`);
            } else {
                logger.warn('Target element not found, capturing full page');
                await page.screenshot({
                    path: screenshotPath,
                    type: 'png',
                    fullPage: false
                });
                logger.debug(`Screenshot captured (full page): ${screenshotPath}`);
            }

            return screenshotPath;
        } catch (error) {
            logger.error(`Screenshot capture failed for ${gigId}`, { error: error.message });
            throw error;
        } finally {
            if (page) {
                await page.close();
            }
        }
    }

    async generateAll() {
        try {
            logger.info('🔄 Regenerating HTML templates first...\n');
            
            const generated = this.thumbnailGenerator.generateAll();
            if (!generated) {
                logger.error('Failed to generate HTML templates.\n');
                return false;
            }
            
            logger.info('\n📸 Starting screenshot generation with Playwright...\n');

            let gigFolders = [];
            
            if (config.output.useGigFolders) {
                gigFolders = fs.readdirSync(config.paths.output)
                    .filter(item => {
                        const itemPath = path.join(config.paths.output, item);
                        return fs.statSync(itemPath).isDirectory();
                    });
            }

            if (gigFolders.length === 0 && config.output.useGigFolders) {
                logger.error('No gig folders found in output directory.');
                return false;
            }

            await this.initialize();

            let successCount = 0;
            let failCount = 0;
            const errors = [];

            for (const gigId of gigFolders) {
                const htmlFile = `${gigId}.html`;
                const htmlPath = path.join(config.paths.output, gigId, htmlFile);
                
                if (!fs.existsSync(htmlPath)) {
                    logger.warn(`HTML file not found for ${gigId}, skipping`);
                    continue;
                }
                
                const customFilename = this.getFilename(gigId);
                const screenshotFile = `${customFilename}.png`;

                try {
                    await this.captureScreenshot(gigId, htmlFile, screenshotFile);
                    logger.success(`Screenshot: ${gigId}/screenshots/${screenshotFile}`);
                    successCount++;
                } catch (error) {
                    logger.error(`Failed to capture ${gigId}:`, { error: error.message });
                    errors.push({ id: gigId, error: error.message });
                    failCount++;
                }
            }

            await this.close();

            logger.info('\n📊 Screenshot Summary:');
            logger.info(`   ✅ Success: ${successCount}`);
            if (failCount > 0) {
                logger.error(`   ❌ Failed: ${failCount}`);
            }
            logger.info(`   📁 Output directory: ${config.paths.output}\n`);
            
            if (errors.length > 0) {
                logger.debug('Screenshot errors:', errors);
            }
            
            return successCount > 0;
        } catch (error) {
            logger.error('Fatal error during screenshot generation', { error: error.message, stack: error.stack });
            if (this.browser) {
                await this.close();
            }
            return false;
        }
    }

    async generateSingle(thumbnailId) {
        try {
            logger.info(`🔄 Regenerating HTML template for: ${thumbnailId}\n`);
            
            const generated = this.thumbnailGenerator.generateSingle(thumbnailId);
            if (!generated) {
                logger.error(`Failed to generate HTML template for ${thumbnailId}.\n`);
                return false;
            }
            
            logger.info(`\n📸 Generating screenshot for: ${thumbnailId}\n`);

            const htmlFile = `${thumbnailId}.html`;
            const htmlPath = config.output.useGigFolders
                ? path.join(config.paths.output, thumbnailId, htmlFile)
                : path.join(config.paths.output, htmlFile);

            if (!fs.existsSync(htmlPath)) {
                logger.error(`HTML file not found: ${htmlPath}`);
                return false;
            }

            await this.initialize();

            const customFilename = this.getFilename(thumbnailId);
            const screenshotFile = `${customFilename}.png`;

            try {
                const screenshotPath = await this.captureScreenshot(thumbnailId, htmlFile, screenshotFile);
                logger.success(`Screenshot saved: ${screenshotPath}\n`);
                return true;
            } catch (error) {
                logger.error(`Failed to capture screenshot:`, { error: error.message });
                return false;
            } finally {
                await this.close();
            }
        } catch (error) {
            logger.error('Fatal error during single screenshot generation', { error: error.message });
            if (this.browser) {
                await this.close();
            }
            return false;
        }
    }
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const generator = new PlaywrightScreenshotGenerator();

    (async () => {
        if (args[0] === '--all') {
            await generator.generateAll();
        } else if (args[0] && args[0] !== '--all') {
            await generator.generateSingle(args[0]);
        } else {
            console.log('Usage:');
            console.log('  node src/screenshot-playwright.js --all        - Generate all screenshots');
            console.log('  node src/screenshot-playwright.js ID           - Generate single screenshot');
        }
    })();
}

module.exports = PlaywrightScreenshotGenerator;
