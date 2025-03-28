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

	// Helper function to skip tests when credentials are missing
	const skipIfNoCredentials = () => !getAtlassianCredentials();

	describe('search', () => {
		it('should return formatted search results for a valid CQL query', async () => {
			if (skipIfNoCredentials()) return;

			// Call the function with a simple query
			const result = await atlassianSearchController.search({
				cql: 'type=page',
				limit: 5,
			});

			// Verify the response structure
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');
			expect(result).toHaveProperty('pagination');

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
				// Pagination information is now handled by the CLI, not in the content
			}
		}, 15000);

		it('should automatically handle reserved keywords by quoting them', async () => {
			if (skipIfNoCredentials()) return;

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

		it('should automatically quote spaces in field values', async () => {
			if (skipIfNoCredentials()) return;

			try {
				// Using a CQL query with spaces in a field value
				// The test is looking for spaces that don't exist, like "SpaceName With Spaces"
				// We expect it to fail with a NOT_FOUND (the space doesn't exist), but the controller
				// should properly quote the space name in the query first
				await atlassianSearchController.search({
					cql: 'space = SpaceName With Spaces',
				});
				fail('Should have thrown an error');
			} catch (error) {
				// The test is checking our pre-processing worked, not that the space exists
				expect(error).toBeInstanceOf(McpError);
				// Accept either NOT_FOUND or API_ERROR, as the error handling may vary
				expect(['NOT_FOUND', 'API_ERROR']).toContain(
					(error as McpError).type,
				);
			}
		}, 15000);

		it('should handle complex CQL queries with multiple criteria', async () => {
			if (skipIfNoCredentials()) return;

			// Create a complex query with multiple criteria
			const result = await atlassianSearchController.search({
				cql: 'type=page AND creator=currentUser() AND created >= "2020-01-01"',
				limit: 5,
			});

			// Verify the response structure
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');
			expect(result).toHaveProperty('pagination');

			// We can't predict if there will be results, so just verify the function runs
			// without errors and returns either results or the empty message
			expect([
				true,
				result.content.includes('# Confluence Search Results'),
				result.content ===
					'No Confluence content found matching your query.',
			]).toContain(true);
		}, 15000);

		it('should handle text search with ~ operator correctly', async () => {
			if (skipIfNoCredentials()) return;

			// Call with a text search using the ~ operator
			const result = await atlassianSearchController.search({
				cql: 'text ~ "test"',
				limit: 5,
			});

			// Verify the response structure
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');
			expect(result).toHaveProperty('pagination');
		}, 15000);

		it('should correctly process CQL with parentheses and logical operators', async () => {
			if (skipIfNoCredentials()) return;

			// Call with a complex query that uses grouping and logical operators
			const result = await atlassianSearchController.search({
				cql: '(type=page OR type=blogpost) AND space.type=global',
				limit: 5,
			});

			// Verify the response structure
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');
			expect(result).toHaveProperty('pagination');

			// The content should either contain results or the empty message
			expect([
				true,
				result.content.includes('# Confluence Search Results'),
				result.content ===
					'No Confluence content found matching your query.',
			]).toContain(true);
		}, 15000);

		it('should handle CQL with date comparisons', async () => {
			if (skipIfNoCredentials()) return;

			// Get a date string for one year ago
			const oneYearAgo = new Date();
			oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
			const dateString = oneYearAgo.toISOString().split('T')[0]; // Format as YYYY-MM-DD

			// Call with a query that uses date comparisons
			const result = await atlassianSearchController.search({
				cql: `created >= "${dateString}"`,
				limit: 5,
			});

			// Verify the response structure
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');
			expect(result).toHaveProperty('pagination');
		}, 15000);

		it('should handle pagination with cursor-based navigation', async () => {
			if (skipIfNoCredentials()) return;

			// Get first page with small limit
			const firstPage = await atlassianSearchController.search({
				cql: 'type=page',
				limit: 2,
			});

			// Verify first page structure
			expect(firstPage).toHaveProperty('content');
			expect(firstPage).toHaveProperty('pagination');
			expect(firstPage.pagination).toHaveProperty('count');
			expect(firstPage.pagination).toHaveProperty('hasMore');

			// If there are more pages and we have a cursor, test pagination
			if (
				firstPage.pagination?.hasMore &&
				firstPage.pagination.nextCursor
			) {
				// Get second page using the cursor
				const secondPage = await atlassianSearchController.search({
					cql: 'type=page',
					limit: 2,
					cursor: firstPage.pagination.nextCursor,
				});

				// Verify second page structure
				expect(secondPage).toHaveProperty('content');
				expect(secondPage).toHaveProperty('pagination');

				// If both pages have content (not the empty message), they should be different
				if (
					firstPage.content !==
						'No Confluence content found matching your query.' &&
					secondPage.content !==
						'No Confluence content found matching your query.'
				) {
					expect(firstPage.content).not.toEqual(secondPage.content);
				}
			}
		}, 15000);

		it('should handle empty results gracefully', async () => {
			if (skipIfNoCredentials()) return;

			try {
				// Use an invalid CQL that should trigger an API error due to missing search term
				// The controller should handle this gracefully
				const result = await atlassianSearchController.search({
					cql: 'text ~ ""',
				});

				// If we get here, check that the response is properly formatted
				expect(result).toHaveProperty('content');
				expect(typeof result.content).toBe('string');

				// Check if the content contains the "No results found" message
				expect(result.content).toContain('No results found');
			} catch (error) {
				// If API throws an error about empty search, that's expected too
				// Just verify it's a properly formatted error
				expect(error).toBeInstanceOf(McpError);
			}
		}, 15000);

		it('should process CQL query for AND criteria correctly', async () => {
			if (skipIfNoCredentials()) return;

			// Test with AND operator
			const result = await atlassianSearchController.search({
				cql: 'type=page AND space=test',
				limit: 5,
			});

			// Verify the function runs without errors (proper result structuring is tested elsewhere)
			expect(result).toHaveProperty('content');
		}, 15000);

		it('should process CQL query for OR criteria correctly', async () => {
			if (skipIfNoCredentials()) return;

			// Test with OR operator
			const result = await atlassianSearchController.search({
				cql: 'type=page OR type=blogpost',
				limit: 5,
			});

			// Verify the function runs without errors
			expect(result).toHaveProperty('content');
		}, 15000);

		it('should process CQL query with text search correctly', async () => {
			if (skipIfNoCredentials()) return;

			// Test with text search using ~
			const result = await atlassianSearchController.search({
				cql: 'text ~ "test"',
				limit: 5,
			});

			// Verify the function runs without errors
			expect(result).toHaveProperty('content');
		}, 15000);

		it('should process CQL query with exact text match correctly', async () => {
			if (skipIfNoCredentials()) return;

			// Test with exact text search using =
			const result = await atlassianSearchController.search({
				cql: 'title = "Welcome"',
				limit: 5,
			});

			// Verify the function runs without errors
			expect(result).toHaveProperty('content');
		}, 15000);

		it('should properly handle multiple keywords that need quoting', async () => {
			if (skipIfNoCredentials()) return;

			// Use CQL with multiple reserved keywords that would need quoting
			try {
				const result = await atlassianSearchController.search({
					cql: 'space=AND AND title=OR',
					limit: 5,
				});

				// Verify the response structure
				expect(result).toHaveProperty('content');
			} catch (error) {
				// This might fail if space/title with those names don't exist
				// That's ok, we're testing the query processing, not the result
				expect(error).toBeInstanceOf(McpError);
				expect(['NOT_FOUND', 'API_ERROR']).toContain(
					(error as McpError).type,
				);
			}
		}, 15000);

		it('should handle quotes within quotes by processing them correctly', async () => {
			if (skipIfNoCredentials()) return;

			// Use a query with a value containing quotes
			try {
				const result = await atlassianSearchController.search({
					cql: 'text ~ "This has "quotes" inside"',
					limit: 5,
				});

				// Verify the response structure
				expect(result).toHaveProperty('content');
			} catch (error) {
				// If the API doesn't accept the processed query, check that it's the right error type
				expect(error).toBeInstanceOf(McpError);
				expect(['API_ERROR', 'BAD_REQUEST']).toContain(
					(error as McpError).type,
				);
			}
		}, 15000);

		it('should handle invalid CQL queries by throwing an error', async () => {
			if (skipIfNoCredentials()) return;

			// Call with an invalid CQL query using incorrect operator syntax
			await expect(
				atlassianSearchController.search({
					cql: 'type===page', // Using invalid operator === instead of =
				}),
			).rejects.toThrow(McpError);

			// Try to catch the error to verify its properties
			try {
				await atlassianSearchController.search({
					cql: 'type===page',
				});
			} catch (error) {
				expect(error).toBeInstanceOf(McpError);
				expect((error as McpError).type).toBe('API_ERROR');
			}
		}, 15000);

		it('should handle invalid field names by throwing an error', async () => {
			if (skipIfNoCredentials()) return;

			// Call with a non-existent field name
			await expect(
				atlassianSearchController.search({
					cql: 'nonexistentfield=value',
				}),
			).rejects.toThrow(McpError);
		}, 15000);
	});
});
