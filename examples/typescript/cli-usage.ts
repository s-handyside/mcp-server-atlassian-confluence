/**
 * CLI Usage Example (TypeScript)
 *
 * This file demonstrates how to use the package as a CLI tool.
 * Note: To run these examples, you need to install the package globally:
 *
 * npm install -g @aashari/boilerplate-npm-package
 *
 * Then you can use the following commands:
 */

// Example commands to run in terminal:

// 1. Basic usage - prints "Hello World"
// my-node-package

// 2. Check version
// my-node-package --version

// 3. Display help
// my-node-package --help

// 4. Use the greet command
// my-node-package greet

// 5. Use the greet command with a name parameter
// my-node-package greet --name "TypeScript User"

// 6. Get help for the greet command
// my-node-package greet --help

/**
 * You can also use the CLI functionality programmatically in your code:
 */

import { executeCli } from '@aashari/boilerplate-npm-package';

// This will simulate running the CLI with the arguments you provide
// For example, to run the equivalent of "my-node-package greet --name Test":
process.argv = [
	'node',
	'script.js',
	'greet',
	'--name',
	'TypeScript Programmatic User',
];
executeCli();
