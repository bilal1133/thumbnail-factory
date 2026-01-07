const fs = require('fs');
const path = require('path');
const config = require('./config');

class Validator {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    validateThumbnailData(data, index) {
        const errors = [];
        const warnings = [];

        if (!data.id) {
            errors.push(`Thumbnail at index ${index}: Missing required field 'id'`);
        } else if (!/^[a-z0-9-]+$/.test(data.id)) {
            warnings.push(`Thumbnail '${data.id}': ID should only contain lowercase letters, numbers, and hyphens`);
        }

        if (!data.title || !data.title.line1 || !data.title.line2 || !data.title.line3) {
            errors.push(`Thumbnail '${data.id}': Missing or incomplete title (requires line1, line2, line3)`);
        }

        if (!data.badge || !data.badge.text) {
            errors.push(`Thumbnail '${data.id}': Missing badge text`);
        }

        if (!data.description) {
            errors.push(`Thumbnail '${data.id}': Missing description`);
        }

        if (!data.founderImage) {
            errors.push(`Thumbnail '${data.id}': Missing founderImage`);
        } else {
            const imagePath = path.join(config.paths.images, data.founderImage);
            if (!fs.existsSync(imagePath)) {
                warnings.push(`Thumbnail '${data.id}': Image file '${data.founderImage}' not found in assets/images/`);
            }
        }

        if (data.theme) {
            if (data.theme.primaryColor && !this.isValidHexColor(data.theme.primaryColor)) {
                errors.push(`Thumbnail '${data.id}': Invalid primaryColor hex format`);
            }
            if (data.theme.accentColor && !this.isValidHexColor(data.theme.accentColor)) {
                errors.push(`Thumbnail '${data.id}': Invalid accentColor hex format`);
            }
        }

        return { errors, warnings };
    }

    isValidHexColor(color) {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
    }

    validateDataFile() {
        const dataPath = path.join(config.paths.data, config.files.dataFile);
        
        if (!fs.existsSync(dataPath)) {
            this.errors.push(`Data file not found: ${dataPath}`);
            return false;
        }

        let data;
        try {
            const rawData = fs.readFileSync(dataPath, 'utf8');
            data = JSON.parse(rawData);
        } catch (error) {
            this.errors.push(`Failed to parse JSON: ${error.message}`);
            return false;
        }

        if (!data.defaults) {
            this.warnings.push('No defaults section found in data file');
        }

        if (!data.thumbnails || !Array.isArray(data.thumbnails)) {
            this.errors.push('No thumbnails array found in data file');
            return false;
        }

        if (data.thumbnails.length === 0) {
            this.warnings.push('Thumbnails array is empty');
        }

        data.thumbnails.forEach((thumbnail, index) => {
            const { errors, warnings } = this.validateThumbnailData(thumbnail, index);
            this.errors.push(...errors);
            this.warnings.push(...warnings);
        });

        const ids = data.thumbnails.map(t => t.id);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        if (duplicates.length > 0) {
            this.errors.push(`Duplicate thumbnail IDs found: ${duplicates.join(', ')}`);
        }

        return this.errors.length === 0;
    }

    validateTemplate() {
        const templatePath = path.join(config.paths.templates, config.files.baseTemplate);
        
        if (!fs.existsSync(templatePath)) {
            this.errors.push(`Template file not found: ${templatePath}`);
            return false;
        }

        const template = fs.readFileSync(templatePath, 'utf8');
        const requiredPlaceholders = [
            '{{TITLE}}', '{{PRIMARY_COLOR}}', '{{ACCENT_COLOR}}',
            '{{TITLE_LINE1}}', '{{TITLE_LINE2}}', '{{TITLE_LINE3}}',
            '{{BADGE_TEXT}}', '{{DESCRIPTION}}', '{{FOUNDER_IMAGE}}'
        ];

        requiredPlaceholders.forEach(placeholder => {
            if (!template.includes(placeholder)) {
                this.warnings.push(`Template missing placeholder: ${placeholder}`);
            }
        });

        return true;
    }

    validateAssets() {
        if (!fs.existsSync(config.paths.images)) {
            this.warnings.push(`Images directory not found: ${config.paths.images}`);
        }

        if (!fs.existsSync(config.paths.logos)) {
            this.warnings.push(`Logos directory not found: ${config.paths.logos}`);
        }

        return true;
    }

    validate() {
        console.log('🔍 Validating thumbnail configuration...\n');

        this.validateDataFile();
        this.validateTemplate();
        this.validateAssets();

        if (this.errors.length > 0) {
            console.log('❌ Validation failed with errors:\n');
            this.errors.forEach(error => console.log(`   • ${error}`));
            console.log('');
        }

        if (this.warnings.length > 0) {
            console.log('⚠️  Warnings:\n');
            this.warnings.forEach(warning => console.log(`   • ${warning}`));
            console.log('');
        }

        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('✅ Validation passed with no issues!\n');
        } else if (this.errors.length === 0) {
            console.log('✅ Validation passed (with warnings)\n');
        }

        return this.errors.length === 0;
    }
}

if (require.main === module) {
    const validator = new Validator();
    const isValid = validator.validate();
    process.exit(isValid ? 0 : 1);
}

module.exports = Validator;
