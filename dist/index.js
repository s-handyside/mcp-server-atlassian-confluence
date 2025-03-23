#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.greet = greet;
exports.createCli = createCli;
exports.executeCli = executeCli;
exports.isMainModule = isMainModule;
const commander_1 = require("commander");
// Version is updated by the update-version.js script
const VERSION = '1.8.1';
/**
 * Prints "Hello World" to the console
 * Update: Added better documentation
 */
function greet(name) {
    console.log(`Hello ${name || 'World'}`);
}
/**
 * Creates and configures the CLI
 */
function createCli() {
    const program = new commander_1.Command();
    program
        .name('my-node-package')
        .description('A simple Node.js package that prints Hello World')
        .version(VERSION);
    program
        .command('greet')
        .description('Print Hello World')
        .option('-n, --name <name>', 'Name to greet')
        .action((options) => {
        greet(options.name);
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
function executeCli() {
    const program = createCli();
    program.parse();
}
/**
 * Check if this is the main module - exposed for testing
 */
function isMainModule() {
    return require.main === module;
}
/**
 * Main entry point for the CLI
 */
/* istanbul ignore if */
if (isMainModule()) {
    executeCli();
}
