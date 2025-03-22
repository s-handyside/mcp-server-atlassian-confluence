const boilerplate = require('@aashari/boilerplate-npm-package');

// Print the currently used package version
console.log('Boilerplate NPM Package Version Check');
console.log('====================================\n');

// Try to access the package version if available
const packageInfo = require('@aashari/boilerplate-npm-package/package.json');
console.log(`Using boilerplate-npm-package version: ${packageInfo.version}`);

// Simple test to ensure the package is working
console.log('\nPerforming a simple test...');
console.log('Result:');
boilerplate.greet('Test User'); // This will log "Hello Test User" to the console
