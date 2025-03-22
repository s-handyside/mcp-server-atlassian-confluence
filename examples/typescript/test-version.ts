import * as boilerplate from '@aashari/boilerplate-npm-package';
// We need to use require for package.json since it's not a module with types
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageInfo = require('@aashari/boilerplate-npm-package/package.json');

// Print the currently used package version
console.log('Boilerplate NPM Package Version Check (TypeScript)');
console.log('================================================\n');

console.log(`Using boilerplate-npm-package version: ${packageInfo.version}`);

// Simple test to ensure the package is working
console.log('\nPerforming a simple test...');
console.log('Result:');
boilerplate.greet('TypeScript Test User'); // This will log "Hello TypeScript Test User" to the console
