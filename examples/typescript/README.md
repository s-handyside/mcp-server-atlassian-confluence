# Boilerplate NPM Package TypeScript Examples

This directory contains examples demonstrating how to use the `@aashari/boilerplate-npm-package` with TypeScript.

## Getting Started

To run these examples:

1. Navigate to this directory
2. Install dependencies:
    ```bash
    npm install
    ```
3. Build and run the examples:
    ```bash
    npm start
    ```

## TypeScript Configuration

The examples use a basic TypeScript configuration defined in `tsconfig.json`. The configuration includes:

- Target: ES2020
- Module: CommonJS
- Strict type checking
- Output directory: `dist`

## Type Definitions

The package includes TypeScript type definitions, allowing you to use it seamlessly in TypeScript projects. These examples show how to import and use the types:

```typescript
import * as boilerplate from '@aashari/boilerplate-npm-package';

// With type annotations
boilerplate.greet('TypeScript User'); // Calls the greet function with proper typing
```

## Version Check

To verify that you're using the latest version of the package:

```bash
npm run test:version
```

## Examples Included

### Basic Usage

The `index.ts` file demonstrates:

1. Using the package's `greet` function with default parameters
2. Using the package's `greet` function with custom parameters

### CLI Usage

The `cli-usage.ts` file demonstrates how to use the package as a CLI tool.

To use the CLI functionality, you need to install the package globally:

```bash
npm install -g @aashari/boilerplate-npm-package
```

Then you can use commands like:

```bash
# Basic usage
my-node-package

# With a name parameter
my-node-package greet --name "Your Name"

# Get help
my-node-package --help
```

The file also shows how to use the CLI programmatically in your TypeScript code with proper type safety.

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Boilerplate NPM Package README](../../README.md)
