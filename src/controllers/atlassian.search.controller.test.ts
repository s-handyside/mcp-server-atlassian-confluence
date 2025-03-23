import atlassianSearchController from './atlassian.search.controller.js';
import { getAtlassianCredentials } from '../utils/transport.util.js';
import { config } from '../utils/config.util.js';
import { McpError } from '../utils/error.util.js';

describe('Atlassian Search Controller', () => {
	// Load configuration and skip all tests if Atlassian credentials are not available
	beforeAll(() => {
		// Load configuration from all sources
		config.load();

		const credentials = getAtlassianCredentials();
		if (!credentials) {
			console.warn(
				'Skipping Atlassian Search Controller tests: No credentials available',
			);
		}
	});

	describe('search', () => {
		it('should return formatted search results for a valid CQL query', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Call the function with a simple query
			const result = await atlassianSearchController.search({
				cql: 'type=page',
				limit: 5,
			});

			// Verify the response structure
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');

			// Verify the content format
			if (
				result.content !==
				'No Confluence content found matching your query.'
			) {
				expect(result.content).toContain('# Confluence Search Results');
				expect(result.content).toContain('**ID**');
				expect(result.content).toContain('**Type**');
				expect(result.content).toContain('**Status**');
				expect(result.content).toContain('**Space**');
			}

			// Verify pagination if present
			if (result.pagination?.hasMore) {
				expect(result.pagination).toHaveProperty('nextCursor');
				expect(result.content).toContain('## Pagination');
			}
		}, 15000);

		it('should automatically handle reserved keywords by quoting them', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Call with a query containing an unquoted reserved keyword
			const result = await atlassianSearchController.search({
				cql: 'space=IN',
			});

			// Verify the response structure
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');

			// Verify the content format
			if (
				result.content !==
				'No Confluence content found matching your query.'
			) {
				expect(result.content).toContain('# Confluence Search Results');
			}
		}, 15000);

		it('should handle invalid CQL queries by throwing an error', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Call with an invalid CQL query
			await expect(
				atlassianSearchController.search({
					cql: 'invalid query syntax',
				}),
			).rejects.toThrow(McpError);
		}, 15000);
	});
});
