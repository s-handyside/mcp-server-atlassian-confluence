# Dependency Management

This project has several automated tools to help keep dependencies up-to-date and secure.

## Automated Tools

### Dependabot

[Dependabot](https://github.com/dependabot) is configured to automatically create pull requests when dependencies need updating. The configuration is in `.github/dependabot.yml`.

Dependabot will:
- Check for npm package updates weekly
- Create pull requests with necessary updates
- Label PRs with "dependencies"
- Skip patch-level updates to reduce noise
- Also keep GitHub Actions workflows up-to-date

### Auto-merge Workflow

We have a GitHub Action in `.github/workflows/auto-merge-dependencies.yml` that will:
- Run automatically on Dependabot pull requests
- Run tests and linting to verify the updates don't break anything
- Auto-approve and merge the PR if all checks pass

### Periodic Validation

A GitHub Action in `.github/workflows/dependency-validation.yml` will run weekly to:
- Check for outdated dependencies
- Run security audits
- Run tests and linting to ensure everything works
- This action can also be triggered manually

## Local Tools

### NPM Scripts

The package.json includes helpful scripts:
- `npm run update:check`: Lists dependencies that can be updated
- `npm run update:deps`: Updates all dependencies and installs them

## Best Practices

1. Review Dependabot PRs before merging, especially for major version updates
2. Run `npm run update:check` before starting new development
3. Regularly check npm audit for security vulnerabilities
4. Keep the Node.js version updated to support newer dependencies

## Manual Update

To manually update all dependencies:

```bash
npm run update:deps
npm test
``` 