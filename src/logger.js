const fs = require('fs');
const path = require('path');

class Logger {
    constructor(options = {}) {
        this.logLevel = options.logLevel || process.env.LOG_LEVEL || 'info';
        this.logToFile = options.logToFile || false;
        this.logFilePath = options.logFilePath || path.join(__dirname, '..', 'logs', 'app.log');
        
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
        
        if (this.logToFile) {
            this.ensureLogDir();
        }
    }
    
    ensureLogDir() {
        const logDir = path.dirname(this.logFilePath);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }
    
    shouldLog(level) {
        return this.levels[level] <= this.levels[this.logLevel];
    }
    
    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` ${JSON.stringify(data)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
    }
    
    writeToFile(message) {
        if (this.logToFile) {
            try {
                fs.appendFileSync(this.logFilePath, message + '\n');
            } catch (error) {
                console.error('Failed to write to log file:', error.message);
            }
        }
    }
    
    error(message, data = null) {
        if (this.shouldLog('error')) {
            const formatted = this.formatMessage('error', message, data);
            console.error(`❌ ${message}`, data || '');
            this.writeToFile(formatted);
        }
    }
    
    warn(message, data = null) {
        if (this.shouldLog('warn')) {
            const formatted = this.formatMessage('warn', message, data);
            console.warn(`⚠️  ${message}`, data || '');
            this.writeToFile(formatted);
        }
    }
    
    info(message, data = null) {
        if (this.shouldLog('info')) {
            const formatted = this.formatMessage('info', message, data);
            console.log(message, data || '');
            this.writeToFile(formatted);
        }
    }
    
    debug(message, data = null) {
        if (this.shouldLog('debug')) {
            const formatted = this.formatMessage('debug', message, data);
            console.log(`🔍 ${message}`, data || '');
            this.writeToFile(formatted);
        }
    }
    
    success(message, data = null) {
        if (this.shouldLog('info')) {
            const formatted = this.formatMessage('info', message, data);
            console.log(`✅ ${message}`, data || '');
            this.writeToFile(formatted);
        }
    }
}

module.exports = new Logger({
    logLevel: process.env.LOG_LEVEL || 'info',
    logToFile: process.env.LOG_TO_FILE === 'true'
});
