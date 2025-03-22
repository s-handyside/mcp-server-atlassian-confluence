# @aashari/boilerplate-npm-package

A simple TypeScript npm package boilerplate with automated publishing to npm using GitHub Actions.

## Installation

```bash
npm install @aashari/boilerplate-npm-package
```

## TypeScript Support

This package is written in TypeScript and includes type definitions. When using it in a TypeScript project, you'll get full type checking and autocompletion:

```typescript
import { greet } from '@aashari/boilerplate-npm-package';

// Type checking works as expected
greet(); // OK
greet('Alice'); // OK
greet(123); // Type error: Argument of type 'number' is not assignable to parameter of type 'string | undefined'
```

## Usage

### As a Library

```javascript
// ES Modules
import { greet } from '@aashari/boilerplate-npm-package';

// CommonJS
const { greet } = require('@aashari/boilerplate-npm-package');

// Call the function with default greeting
greet(); // Outputs "Hello World"

// Call the function with custom name
greet('Alice'); // Outputs "Hello Alice"
```

### Command Line Interface (CLI)

This package also provides a CLI that can be used after installation:

```bash
# Basic usage (prints "Hello World")
my-node-package

# Specific greeting command
my-node-package greet

# Greeting with custom name
my-node-package greet --name Alice
# OR
my-node-package greet -n Alice

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
    - Package is published to npm registry
    - GitHub release is created with release notes

> **Note:** Automated publishing to npm requires an `NPM_TOKEN` secret to be configured in your GitHub repository settings. See the [CI/CD Workflows](#cicd-workflows) section for details.

To trigger a release, push a commit with a message following the [Conventional Commits](https://www.conventionalcommits.org/) format:

- `fix: ...` - for a patch release (e.g., 1.0.1)
- `feat: ...` - for a minor release (e.g., 1.1.0)
- `feat!: ...` or `fix!: ...` or `feat: ...BREAKING CHANGE...` - for a major release (e.g., 2.0.0)

### Manual Release

If you need to publish manually:

```bash
npm run publish:npm  # Publish to npm
```

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## CI/CD Workflows

This project uses GitHub Actions for continuous integration and delivery:

1. **Semantic Release** - Automatically determines version bumps based on commit messages, creates releases, and publishes to npm.
2. **Dependency Checks** - Scheduled workflow that checks for outdated dependencies.
3. **Dependabot Auto-merge** - Automatically tests and merges minor and patch Dependabot PRs if they pass tests.

All workflows use Node.js 22 with dependency caching for optimal performance.

### Required Repository Secrets

For the CI/CD pipeline to work correctly, you need to configure the following secrets in your GitHub repository settings:

- `NPM_TOKEN` - An npm authentication token with publish permissions. You can create one at https://www.npmjs.com/settings/[your-username]/tokens.

To add these secrets:

1. Go to your repository on GitHub
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add your NPM_TOKEN with the appropriate value

## License

MIT
