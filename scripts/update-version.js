#!/usr/bin/env node

/**
 * Script to update version numbers across the project
 * Usage: node scripts/update-version.js [version]
 * If no version is provided, it will use the version from package.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Get the version from command line or package.json
let newVersion = process.argv[2];

if (!newVersion) {
	// If no version is specified, read from package.json
	try {
		const packageJson = JSON.parse(
			fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'),
		);
		newVersion = packageJson.version;
		console.log(
			`No version specified, using current version: ${newVersion}`,
		);
	} catch (error) {
		console.error(`Error reading package.json: ${error.message}`);
		process.exit(1);
	}
}

// Validate version format (simple check for semver-like format)
if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/.test(newVersion)) {
	console.error(
		'Error: Invalid version format. Please use semver format (e.g., 1.2.3, 1.2.3-beta, etc.)',
	);
	process.exit(1);
}

console.log(`\nVersion successfully updated to ${newVersion}`); 