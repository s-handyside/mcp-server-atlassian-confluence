import { Command } from 'commander';
import { logger } from '../utils/logger.util.js';

import atlassianSpacesCli from './atlassian.spaces.cli.js';
import atlassianPagesCli from './atlassian.pages.cli.js';
import atlassianSearchCli from './atlassian.search.cli.js';

// Get the version from package.json
const VERSION = '1.9.2'; // This should match the version in src/index.ts
const NAME = '@aashari/mcp-atlassian-confluence';
const DESCRIPTION =
	'A Model Context Protocol (MCP) server for Atlassian Confluence integration';

export async function runCli(args: string[]) {
	const program = new Command();

	program.name(NAME).description(DESCRIPTION).version(VERSION);

	// Register CLI commands
	atlassianSpacesCli.register(program);
	atlassianPagesCli.register(program);
	atlassianSearchCli.register(program);

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
