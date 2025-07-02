import winston from 'winston';
import path from 'path';
import fs from 'fs-extra';

const logsDir = path.join(__dirname, '../../logs');

fs.ensureDirSync(logsDir);

const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] ?? 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'omnisecai-backend',
    version: process.env['npm_package_version'] ?? '1.0.0'
  },
  transports: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

if (process.env['NODE_ENV'] !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        const metaString = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `${timestamp} [${service}] ${level}: ${message}${metaString}`;
      })
    )
  }));
}

interface LoggerStream {
  write: (message: string) => void;
}

const loggerStream: LoggerStream = {
  write: (message: string): void => {
    logger.info(message.trim());
  }
};

export { logger, loggerStream };
export default logger;