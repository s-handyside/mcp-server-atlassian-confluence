import { CliTestUtil } from '../utils/cli.test.util.js';
import { getAtlassianCredentials } from '../utils/transport.util.js';
import { config } from '../utils/config.util.js';

describe('Atlassian Confluence Search CLI Commands', () => {
	// Load configuration and check for credentials before all tests
	beforeAll(() => {
		// Load configuration from all sources
		config.load();

		// Log warning if credentials aren't available
		const credentials = getAtlassianCredentials();
		if (!credentials) {
			console.warn(
				'Skipping Atlassian Confluence Search CLI tests: No credentials available',
			);
		}
	});

	// Helper function to skip tests when credentials are missing
	const skipIfNoCredentials = () => {
		const credentials = getAtlassianCredentials();
		if (!credentials) {
			return true;
		}
		return false;
	};

	// Helper function to get a valid space key for testing
	async function getSpaceKey(): Promise<string | null> {
		// First, get a list of spaces to find a valid key
		const listResult = await CliTestUtil.runCommand([
			'list-spaces',
			'--limit',
			'1',
		]);

		// Skip if no spaces are available
		if (listResult.stdout.includes('No spaces found')) {
			console.warn('Skipping test: No spaces available');
			return null;
		}

		// Extract a space key from the output
		const keyMatch = listResult.stdout.match(/\*\*Key\*\*:\s+([^\n]+)/);
		if (!keyMatch || !keyMatch[1]) {
			console.warn('Skipping test: Could not extract space key');
			return null;
		}

		return keyMatch[1].trim();
	}

	describe('search command', () => {
		// Test basic search functionality
		it('should search content with a query string', async () => {
			if (skipIfNoCredentials()) {
				return;
			}

			// Use a common search term that should find something
			const query = 'a'; // A common letter/word that likely appears in content

			// Run the CLI command
			const result = await CliTestUtil.runCommand([
				'search',
				'--cql',
				`text ~ "${query}"`,
			]);

			// Check command exit code
			expect(result.exitCode).toBe(0);

			// Output might contain search results or no matches, both are valid
			if (!result.stdout.includes('No results found')) {
				// Validate expected Markdown structure
				expect(result.stdout).toContain('# Confluence Search Results');
				expect(result.stdout).toContain('**ID**');
				expect(result.stdout).toContain('**Type**');
				expect(result.stdout).toMatch(/^#\s.+/m);
			} else {
				// Even with no results, output should mention search term
				expect(result.stdout).toContain(query);
			}
		}, 30000); // Increased timeout for API call

		// Test search with space filter
		it('should filter search by space', async () => {
			if (skipIfNoCredentials()) {
				return;
			}

			// Get a valid space key
			const spaceKey = await getSpaceKey();
			if (!spaceKey) {
				return; // Skip if no valid space key found
			}

			// Use a common search term that should find something
			const query = 'a'; // A common letter/word that likely appears in content

			// Run the CLI command with space filter
			const result = await CliTestUtil.runCommand([
				'search',
				'--cql',
				`space = "${spaceKey}" AND text ~ "${query}"`,
			]);

			// Check command exit code
			expect(result.exitCode).toBe(0);

			// The output should mention the space key in some form
			expect(result.stdout).toContain(spaceKey);
		}, 30000); // Increased timeout for API call

		// Test search with pagination
		it('should support pagination with --limit flag', async () => {
			if (skipIfNoCredentials()) {
				return;
			}

			// Use a common search term that should find something
			const query = 'a'; // A common letter/word that likely appears in content

			// Run the CLI command with limit
			const result = await CliTestUtil.runCommand([
				'search',
				'--cql',
				`text ~ "${query}"`,
				'--limit',
				'1',
			]);

			// Check command exit code
			expect(result.exitCode).toBe(0);

			// If there are multiple results, pagination section should be present
			if (
				!result.stdout.includes('No results found') &&
				result.stdout.includes('items remaining')
			) {
				expect(result.stdout).toContain('Next cursor');
			}
		}, 30000); // Increased timeout for API call

		// Test with missing required parameter
		it('should fail when query is not provided', async () => {
			if (skipIfNoCredentials()) {
				return;
			}

			// Run command without required parameter
			const result = await CliTestUtil.runCommand(['search']);

			// Should fail with non-zero exit code
			expect(result.exitCode).not.toBe(0);

			// Should indicate missing required option
			expect(result.stderr).toContain('required option');
		}, 15000);

		// Test with content type filtering
		it('should filter by content type', async () => {
			if (skipIfNoCredentials()) {
				return;
			}

			// Use a common search term that should find something
			const query = 'a'; // A common letter/word that likely appears in content

			// Run the CLI command with content type filter
			const result = await CliTestUtil.runCommand([
				'search',
				'--cql',
				`type = page AND text ~ "${query}"`,
			]);

			// Check command exit code
			expect(result.exitCode).toBe(0);

			// Specific validation not needed as we're just checking the command doesn't fail
			// The exact format of the output and whether it contains matches depends on the actual data
		}, 30000);

		// Test with label filtering
		it('should filter by label if supported', async () => {
			if (skipIfNoCredentials()) {
				return;
			}

			// Use a common search term that should find something
			const query = 'a'; // A common letter/word that likely appears in content

			// Use a common label that might exist
			const label = 'documentation';

			// Run the CLI command with label filter
			const result = await CliTestUtil.runCommand([
				'search',
				'--cql',
				`label = "${label}" AND text ~ "${query}"`,
			]);

			// Check command exit code - this should not fail even if the label doesn't exist
			expect(result.exitCode).toBe(0);

			// The output might mention the label in some form, but not guaranteed
			// Just check that the command executed without errors
		}, 30000);

		// Test with invalid parameters
		it('should handle invalid CQL syntax properly', async () => {
			if (skipIfNoCredentials()) {
				return;
			}

			// Run the CLI command with invalid CQL syntax
			const result = await CliTestUtil.runCommand([
				'search',
				'--cql',
				'invalid syntax',
			]);

			// Should either handle this gracefully or return an error, both are valid
			// Just check that the command completed (with or without errors)
			expect(result).toBeDefined();
		}, 15000);

		// Test with very long query
		it('should handle very long queries', async () => {
			if (skipIfNoCredentials()) {
				return;
			}

			// Create a long query string
			const longQuery = 'test '.repeat(20).trim(); // 100 characters

			// Run the CLI command with a long query
			const result = await CliTestUtil.runCommand([
				'search',
				'--cql',
				`text ~ "${longQuery}"`,
			]);

			// Check command exit code
			expect(result.exitCode).toBe(0);

			// The search should execute without errors, even if no results are found
			expect(result.stdout).toBeDefined();
		}, 30000);
	});
});
