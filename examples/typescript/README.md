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

1. **Basic Usage** - Using the package's main functionality
2. **Using with Parameters** - Demonstrating parameter passing with proper types

All examples include proper TypeScript type annotations.

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Boilerplate NPM Package README](../../README.md)
