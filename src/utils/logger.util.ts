/**
 * Format a timestamp for logging
 * @returns Formatted timestamp [HH:MM:SS]
 */
function getTimestamp(): string {
	const now = new Date();
	return `[${now.toISOString().split('T')[1].split('.')[0]}]`;
}

class Logger {
	_log(
		level: 'info' | 'warn' | 'error' | 'debug',
		message: string,
		...args: unknown[]
	) {
		// Skip debug messages if DEBUG is not set to true
		if (level === 'debug' && process.env.DEBUG !== 'true') {
			return;
		}

		const timestamp = getTimestamp();
		const prefix = `${timestamp} [${level.toUpperCase()}]`;
		let logMessage = `${prefix} ${message}`;
		if (args.length > 0) {
			logMessage += ` ${args.map((arg) => JSON.stringify(arg)).join(' ')}`;
		}
		if (process.env.NODE_ENV === 'test') {
			console[level](logMessage);
		} else {
			console.error(logMessage);
		}
	}

	info(message: string, ...args: unknown[]) {
		this._log('info', message, ...args);
	}

	warn(message: string, ...args: unknown[]) {
		this._log('warn', message, ...args);
	}

	error(message: string, ...args: unknown[]) {
		this._log('error', message, ...args);
	}

	debug(message: string, ...args: unknown[]) {
		this._log('debug', message, ...args);
	}
}

export const logger = new Logger();
