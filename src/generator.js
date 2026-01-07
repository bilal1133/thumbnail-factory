const fs = require('fs');
const path = require('path');
const config = require('./config');
const Validator = require('./validator');
const logger = require('./logger');

class ThumbnailGenerator {
    constructor() {
        this.config = config;
    }

    loadData() {
        try {
            const dataPath = path.join(config.paths.data, config.files.dataFile);
            
            if (!fs.existsSync(dataPath)) {
                throw new Error(`Data file not found: ${dataPath}`);
            }
            
            const rawData = fs.readFileSync(dataPath, 'utf8');
            const data = JSON.parse(rawData);
            
            if (!data.thumbnails || !Array.isArray(data.thumbnails)) {
                throw new Error('Invalid data format: thumbnails array not found');
            }
            
            logger.debug('Data loaded successfully', { count: data.thumbnails.length });
            return data;
        } catch (error) {
            logger.error('Failed to load data file', { error: error.message });
            throw error;
        }
    }

    loadTemplate() {
        try {
            const templatePath = path.join(config.paths.templates, config.files.baseTemplate);
            
            if (!fs.existsSync(templatePath)) {
                throw new Error(`Template file not found: ${templatePath}`);
            }
            
            const template = fs.readFileSync(templatePath, 'utf8');
            logger.debug('Template loaded successfully');
            return template;
        } catch (error) {
            logger.error('Failed to load template file', { error: error.message });
            throw error;
        }
    }

    generateStatusBadge(statusBadge) {
        if (!statusBadge || !statusBadge.show) {
            return '';
        }
        
        return `<div class="absolute bottom-8 -right-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transform rotate-[-2deg]">
<span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    ${statusBadge.text}
                 </div>`;
    }

    replacePlaceholders(template, data, defaults) {
        const theme = { ...defaults.theme, ...data.theme };
        
        const replacements = {
            '{{TITLE}}': `${data.title.line1} ${data.title.line2} ${data.title.line3} - TKTurners`,
            '{{PRIMARY_COLOR}}': theme.primaryColor,
            '{{ACCENT_COLOR}}': theme.accentColor,
            '{{BACKGROUND_GRADIENT}}': defaults.theme.backgroundGradient,
            '{{LOGO_IMAGE}}': `assets/images/${defaults.branding.logo}`,
            '{{FOUNDER_IMAGE}}': `assets/images/${data.founderImage}`,
            '{{STATUS_BADGE}}': this.generateStatusBadge(data.statusBadge),
            '{{BADGE_COLOR}}': data.badge.color,
            '{{BADGE_TEXT}}': data.badge.text,
            '{{TITLE_LINE1}}': data.title.line1,
            '{{TITLE_LINE2}}': data.title.line2,
            '{{TITLE_LINE3}}': data.title.line3,
            '{{DESCRIPTION}}': data.description,
            '{{BADGE_IMAGE}}': `assets/images/${defaults.branding.badge}`
        };
        
        let result = template;
        for (const [placeholder, value] of Object.entries(replacements)) {
            result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
        }
        
        return result;
    }

    ensureOutputDir(gigId = null) {
        if (!fs.existsSync(config.paths.output)) {
            fs.mkdirSync(config.paths.output, { recursive: true });
        }
        
        if (config.output.useGigFolders && gigId) {
            const gigDir = path.join(config.paths.output, gigId);
            const screenshotDir = path.join(gigDir, config.output.screenshotSubfolder);
            
            if (!fs.existsSync(gigDir)) {
                fs.mkdirSync(gigDir, { recursive: true });
            }
            if (!fs.existsSync(screenshotDir)) {
                fs.mkdirSync(screenshotDir, { recursive: true });
            }
            
            return gigDir;
        }
        
        return config.paths.output;
    }

    copyAssets(gigId = null) {
        try {
            const baseDir = config.output.useGigFolders && gigId 
                ? path.join(config.paths.output, gigId)
                : config.paths.output;
                
            const outputAssetsDir = path.join(baseDir, 'assets', 'images');
            
            if (!fs.existsSync(outputAssetsDir)) {
                fs.mkdirSync(outputAssetsDir, { recursive: true });
            }

            if (!fs.existsSync(config.paths.images)) {
                logger.warn('Assets directory not found', { path: config.paths.images });
                return 0;
            }

            const files = fs.readdirSync(config.paths.images);
            let copiedCount = 0;
            
            files.forEach(file => {
                try {
                    const srcPath = path.join(config.paths.images, file);
                    const destPath = path.join(outputAssetsDir, file);
                    
                    if (fs.statSync(srcPath).isFile()) {
                        fs.copyFileSync(srcPath, destPath);
                        copiedCount++;
                    }
                } catch (error) {
                    logger.warn(`Failed to copy asset: ${file}`, { error: error.message });
                }
            });
            
            logger.debug('Assets copied', { count: copiedCount });
            return copiedCount;
        } catch (error) {
            logger.error('Failed to copy assets', { error: error.message });
            return 0;
        }
    }

    generateAll() {
        try {
            logger.info('🚀 Starting thumbnail generation...\n');
            
            const validator = new Validator();
            const isValid = validator.validate();
            
            if (!isValid) {
                return false;
            }
            
            const data = this.loadData();
            const template = this.loadTemplate();
            
            this.ensureOutputDir();
            
            if (config.output.copyAssets && !config.output.useGigFolders) {
                const assetCount = this.copyAssets();
                logger.info(`📦 Copied ${assetCount} asset files\n`);
            }
            
            let successCount = 0;
            let failCount = 0;
            const errors = [];
            
            data.thumbnails.forEach((thumbnailData) => {
                try {
                    if (!thumbnailData.id) {
                        throw new Error('Thumbnail missing required field: id');
                    }
                    
                    const html = this.replacePlaceholders(template, thumbnailData, data.defaults);
                    
                    const outputDir = this.ensureOutputDir(thumbnailData.id);
                    const outputPath = path.join(outputDir, `${thumbnailData.id}.html`);
                    
                    if (config.output.useGigFolders) {
                        this.copyAssets(thumbnailData.id);
                    }
                    
                    fs.writeFileSync(outputPath, html, 'utf8');
                    logger.success(`Generated: ${thumbnailData.id}/${thumbnailData.id}.html`);
                    successCount++;
                } catch (error) {
                    logger.error(`Failed to generate ${thumbnailData.id}:`, { error: error.message });
                    errors.push({ id: thumbnailData.id, error: error.message });
                    failCount++;
                }
            });
            
            logger.info('\n📊 Generation Summary:');
            logger.info(`   ✅ Success: ${successCount}`);
            if (failCount > 0) {
                logger.error(`   ❌ Failed: ${failCount}`);
            }
            logger.info(`   📁 Output directory: ${config.paths.output}\n`);
            
            if (errors.length > 0) {
                logger.debug('Generation errors:', errors);
            }
            
            return successCount > 0;
        } catch (error) {
            logger.error('Fatal error during generation', { error: error.message, stack: error.stack });
            return false;
        }
    }

    generateSingle(thumbnailId) {
        console.log(`🚀 Generating single thumbnail: ${thumbnailId}\n`);
        
        const validator = new Validator();
        if (!validator.validate()) {
            console.log('❌ Validation failed. Please fix errors before generating.\n');
            return false;
        }
        
        const data = this.loadData();
        const template = this.loadTemplate();
        const thumbnailData = data.thumbnails.find(t => t.id === thumbnailId);
        
        if (!thumbnailData) {
            console.error(`❌ Thumbnail with id "${thumbnailId}" not found in data file.`);
            console.log('\nAvailable thumbnails:');
            data.thumbnails.forEach(t => console.log(`   - ${t.id}`));
            return false;
        }
        
        const outputDir = this.ensureOutputDir(thumbnailData.id);
        
        if (config.output.copyAssets) {
            const assetCount = this.copyAssets(thumbnailData.id);
            console.log(`📦 Copied ${assetCount} asset files\n`);
        }
        
        try {
            const html = this.replacePlaceholders(template, thumbnailData, data.defaults);
            const outputPath = path.join(outputDir, `${thumbnailData.id}.html`);
            
            fs.writeFileSync(outputPath, html, 'utf8');
            console.log(`✅ Generated: ${thumbnailData.id}/${thumbnailData.id}.html`);
            console.log(`📁 Location: ${outputPath}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to generate ${thumbnailId}:`, error.message);
            return false;
        }
    }

    listThumbnails() {
        const data = this.loadData();
        console.log('📋 Available thumbnails:\n');
        data.thumbnails.forEach(t => {
            console.log(`   ID: ${t.id}`);
            console.log(`   Title: ${t.title.line1} ${t.title.line2} ${t.title.line3}`);
            console.log(`   Badge: ${t.badge.text}`);
            console.log(`   Theme: ${t.theme?.primaryColor || 'default'}\n`);
        });
    }
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const generator = new ThumbnailGenerator();
    
    if (args.length === 0) {
        generator.generateAll();
    } else if (args[0] === '--single' && args[1]) {
        generator.generateSingle(args[1]);
    } else if (args[0] === '--list') {
        generator.listThumbnails();
    } else {
        console.log('Usage:');
        console.log('  npm run generate              - Generate all thumbnails');
        console.log('  npm run generate:single ID    - Generate single thumbnail by ID');
        console.log('  npm run generate:list         - List all available thumbnails');
        console.log('  npm run validate              - Validate configuration');
    }
}

module.exports = ThumbnailGenerator;
