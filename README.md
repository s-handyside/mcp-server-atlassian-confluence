# Boilerplate NPM Package

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
my-node-package
```

This will print "Hello World" to the console.

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the package: `npm run build`
4. Test locally: `node dist/index.js`

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