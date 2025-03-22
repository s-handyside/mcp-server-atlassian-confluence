# Boilerplate NPM Package JavaScript Examples

This directory contains examples demonstrating how to use the `@aashari/boilerplate-npm-package` with JavaScript.

## Getting Started

To run these examples:

1. Navigate to this directory
2. Install dependencies:
    ```bash
    npm install
    ```
3. Run the examples:
    ```bash
    node index.js
    ```

## Version Check

To verify that you're using the latest version of the package:

```bash
node test-version.js
```

## Examples Included

### Basic Usage

The `index.js` file demonstrates:

1. Using the package's `greet` function with default parameters
2. Using the package's `greet` function with custom parameters

### CLI Usage

The `cli-usage.js` file demonstrates how to use the package as a CLI tool.

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

The file also shows how to use the CLI programmatically in your JavaScript code.

## Expected Output

The examples will output formatted messages showing the basic functionality of the package.
