#!/usr/bin/env node
import { Command } from 'commander';

/**
 * Prints "Hello World" to the console
 */
export function greet(): void {
	console.log('Hello World');
}

/**
 * Main entry point for the CLI
 */
if (require.main === module) {
	const program = new Command();
	
	program
		.name('my-node-package')
		.description('A simple Node.js package that prints Hello World')
		.version(process.env.npm_package_version || '1.1.0');
	
	program
		.command('greet')
		.description('Print Hello World')
		.action(() => {
			greet();
		});
		
	// Default command when no command is specified
	program
		.action(() => {
			greet();
		});
	
	program.parse();
}
