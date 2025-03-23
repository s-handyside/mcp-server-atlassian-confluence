import { Command } from 'commander';
import { logger } from '../utils/logger.util.js';

import ipAddressCli from './ipaddress.cli.js';

// Get the version from package.json
const VERSION = '1.0.0'; // This should match the version in src/index.ts
const NAME = '@aashari/boilerplate-mcp-server';
const DESCRIPTION =
	'A boilerplate Model Context Protocol (MCP) server implementation using TypeScript';

export async function runCli(args: string[]) {
	const program = new Command();

	program.name(NAME).description(DESCRIPTION).version(VERSION);

	// Register CLI commands
	ipAddressCli.register(program);

	// Handle unknown commands
	program.on('command:*', (operands) => {
		logger.error(`[src/cli/index.ts] Unknown command: ${operands[0]}`);
		console.log('');
		program.help();
		process.exit(1);
	});

	// Parse arguments; default to help if no command provided
	await program.parseAsync(args.length ? args : ['--help'], { from: 'user' });
}
