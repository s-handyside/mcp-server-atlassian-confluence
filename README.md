# Boilerplate NPM Package

![npm](https://img.shields.io/npm/v/@aashari/boilerplate-npm-package)
![License](https://img.shields.io/npm/l/@aashari/boilerplate-npm-package)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/aashari/boilerplate-npm-package/release.yml?branch=main)
![Test Coverage](https://img.shields.io/badge/coverage-80%25-brightgreen)
![npm downloads](https://img.shields.io/npm/dm/@aashari/boilerplate-npm-package)

A simple Node.js package that prints 'Hello World' when executed. This package is published to both npm and GitHub Packages.

## Installation

You can install this package globally using npm:

```bash
# From npm registry (preferred)
npm install -g @aashari/boilerplate-npm-package

# OR from GitHub Packages
npm install -g @aashari/boilerplate-npm-package --registry=https://npm.pkg.github.com
```

To install from GitHub Packages, you need to authenticate first:

1. Create a Personal Access Token (PAT) with the `read:packages` scope on GitHub.
2. Create or edit your `.npmrc` file to include:

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT
@aashari:registry=https://npm.pkg.github.com
```

Replace `YOUR_GITHUB_PAT` with your actual token.

## Usage

After installing the package globally, you can run:

```bash
# Default usage - prints "Hello World"
my-node-package

# Or use the specific greet command
my-node-package greet

# View help and available commands
my-node-package --help

# Check the version
my-node-package --version
```

This package uses Commander.js for CLI functionality, making it easy to extend with additional commands in the future.

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the package: `npm run build`
4. Run tests: `npm test`
5. Run test coverage: `npm run test:coverage`
6. Lint code: `npm run lint`
7. Format code: `npm run format`
8. Test locally: `node dist/index.js`

## Semantic Versioning and Release

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and CHANGELOG generation. When you push to the `main` branch, semantic-release will:

1. Analyze commits using conventional commit format
2. Determine the next semantic version
3. Generate/update CHANGELOG.md
4. Create a GitHub release
5. Publish to npm and GitHub Packages

To make this work, follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format for your commit messages:

- `fix: message` - for bug fixes (patch version)
- `feat: message` - for new features (minor version)
- `feat!: message` or `fix!: message` - for breaking changes (major version)
- `chore: message` - for maintenance tasks (no version change)
- `docs: message` - for documentation updates (no version change)

## Publishing

The package is automatically published to both npm and GitHub Packages when a new release is created using GitHub Actions.

### Manual Publishing

If you want to publish manually:

```bash
# Build the package
npm run build

# Publish to npm
npm run publish:npm

# Publish to GitHub Packages
npm run publish:github
```

Note: You'll need to authenticate with both registries before publishing. 