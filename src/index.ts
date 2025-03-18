#!/usr/bin/env node
import { Command } from 'commander';
// Import for package.json
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Get package version from package.json
 */
function getPackageVersion(): string {
	try {
		// First try to read from current directory
		const packageJson = JSON.parse(
			readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
		);
		return packageJson.version;
	} catch (
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_e
	) {
		try {
			// Then try to read from the module's directory
			const packageJson = JSON.parse(
				readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
			);
			return packageJson.version;
		} catch (
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			_e
		) {
			// Fallback to env var or hardcoded version
			return process.env.npm_package_version || '1.1.0';
		}
	}
}

/**
 * Prints "Hello World" to the console
 */
export function greet(): void {
	console.log('Hello World');
}

/**
 * Creates and configures the CLI
 */
export function createCli(): Command {
	const program = new Command();

	program
		.name('my-node-package')
		.description('A simple Node.js package that prints Hello World')
		.version(getPackageVersion());

	program
		.command('greet')
		.description('Print Hello World')
		.action(() => {
			greet();
		});

	// Default command when no command is specified
	program.action(() => {
		greet();
	});

	return program;
}

/**
 * Execute CLI - exposed for testing
 */
export function executeCli(): void {
	const program = createCli();
	program.parse();
}

/**
 * Check if this is the main module - exposed for testing
 */
export function isMainModule(): boolean {
	return require.main === module;
}

/**
 * Main entry point for the CLI
 */
/* istanbul ignore if */
if (isMainModule()) {
	executeCli();
}
