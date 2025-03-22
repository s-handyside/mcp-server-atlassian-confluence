# @aashari/boilerplate-npm-package

A simple TypeScript npm package boilerplate with automated publishing to npm using GitHub Actions.

## Installation

```bash
npm install @aashari/boilerplate-npm-package
```

## Usage

### As a Library

```javascript
// ES Modules
import { greet } from '@aashari/boilerplate-npm-package';

// CommonJS
const { greet } = require('@aashari/boilerplate-npm-package');

// Call the function
greet(); // Outputs "Hello World"
```

### Command Line Interface (CLI)

This package also provides a CLI that can be used after installation:

```bash
# Basic usage (prints "Hello World")
my-node-package

# Specific greeting command
my-node-package greet

# Display version
my-node-package --version

# Display help
my-node-package --help
```

## Testing

This package includes comprehensive testing with Jest.

To run tests:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage
```

Current test coverage is 100% across all metrics.

## Development

1. Clone this repository
2. Install dependencies: `npm install`
3. Make your changes
4. Run linting: `npm run lint`
5. Format code: `npm run format`
6. Build the package: `npm run build`
7. Run tests: `npm test`

## Available Scripts

- `npm run build` - Compile TypeScript files
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Check code for linting errors
- `npm run format` - Format code with Prettier
- `npm run update:version` - Update version numbers in source files
- `npm run update:check` - Check for outdated dependencies
- `npm run update:deps` - Update all dependencies
- `npm run publish:npm` - Publish to npm registry
- `npm run publish:github` - Publish to GitHub Packages

## Version Management

The package includes a versatile version management script that syncs versions between package.json and source files:

```bash
# Use version from package.json
npm run update:version

# Specify a custom version
npm run update:version 1.2.3

# Preview changes without applying them
npm run update:version --dry-run

# Show detailed information
npm run update:version --verbose
```

## Release Process

The project uses [semantic-release](https://github.com/semantic-release/semantic-release) to automate the release process. When commits are pushed to the main branch:

1. Semantic release determines if a new version should be published (based on commit messages)
2. If a release is needed:
    - Version is automatically incremented (patch, minor, or major)
    - Changelog is updated
    - Release notes are generated
    - Publish to both npm and GitHub Packages registries.
    - Note: GitHub Packages publishing is a best-effort publishing and will not cause the workflow to fail if it encounters permission issues.

To trigger a release, push a commit with a message following the [Conventional Commits](https://www.conventionalcommits.org/) format:

- `fix: ...` - for a patch release (e.g., 1.0.1)
- `feat: ...` - for a minor release (e.g., 1.1.0)
- `feat!: ...` or `fix!: ...` or `feat: ...BREAKING CHANGE...` - for a major release (e.g., 2.0.0)

### Manual Release

If you need to publish manually:

```bash
npm run publish:npm  # Publish to npm
npm run publish:github  # Publish to GitHub Packages
```

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## License

MIT
