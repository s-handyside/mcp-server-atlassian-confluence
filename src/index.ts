#!/usr/bin/env node
import { Command } from 'commander';

// Version is updated by the update-version.js script
const VERSION = '1.5.1';

/**
 * Prints "Hello World" to the console
 * Update: Added better documentation
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
		.version(VERSION);

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
