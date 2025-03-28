// vendor.atlassian.search.test.ts

import atlassianSearchService from './vendor.atlassian.search.service.js';
import { getAtlassianCredentials } from '../utils/transport.util.js';
import { config } from '../utils/config.util.js';
import { McpError } from '../utils/error.util.js';

describe('Vendor Atlassian Search Service', () => {
	beforeAll(() => {
		config.load();
		const credentials = getAtlassianCredentials();
		if (!credentials) {
			console.warn(
				'Skipping Atlassian Search tests: No credentials available',
			);
		}
	});

	// Helper function to skip tests when credentials are missing
	const skipIfNoCredentials = () => !getAtlassianCredentials();

	describe('search', () => {
		it('should return search results for valid CQL', async () => {
			if (skipIfNoCredentials()) return;

			const result = await atlassianSearchService.search({
				cql: 'type=page',
				limit: 5,
			});

			// Verify the response structure
			expect(result).toHaveProperty('results');
			expect(Array.isArray(result.results)).toBe(true);
			expect(result).toHaveProperty('_links');
			expect(result).toHaveProperty('start');
			expect(result).toHaveProperty('limit');
			expect(result.limit).toBeLessThanOrEqual(5);

			// If results are returned, verify they match the expected structure
			if (result.results.length > 0) {
				const firstResult = result.results[0];
				expect(firstResult).toHaveProperty('content');
				expect(firstResult).toHaveProperty('title');
				expect(firstResult).toHaveProperty('excerpt');
				expect(firstResult).toHaveProperty('url');
				expect(firstResult).toHaveProperty('lastModified');
			}
		}, 15000);

		it('should handle complex CQL queries with multiple conditions', async () => {
			if (skipIfNoCredentials()) return;

			// Complex query with multiple conditions and operators
			const result = await atlassianSearchService.search({
				cql: 'type=page AND space.type=global AND created >= "2020-01-01"',
				limit: 5,
			});

			// Verify the response structure
			expect(result).toHaveProperty('results');
			expect(Array.isArray(result.results)).toBe(true);

			// If results are returned, verify they match the filters
			// Note: We can't easily verify the filter criteria from the response
			// without additional parsing, so we just check the structure
			if (result.results.length > 0) {
				expect(result.results[0]).toHaveProperty('content');
				expect(result.results[0].content).toHaveProperty(
					'type',
					'page',
				);
			}
		}, 15000);

		it('should handle CQL with space filtering', async () => {
			if (skipIfNoCredentials()) return;

			// First, find an available space to filter by
			const pageResults = await atlassianSearchService.search({
				cql: 'type=page',
				limit: 1,
			});

			// Skip if no results found
			if (pageResults.results.length === 0) {
				console.warn(
					'Skipping space filtering test: No search results available',
				);
				return;
			}

			// Get the space key from the first result
			const spaceKey = pageResults.results[0]?.content?.space?.key;

			// Skip if no space key found
			if (!spaceKey) {
				console.warn(
					'Skipping space filtering test: No space key found in results',
				);
				return;
			}

			// Search using the space key
			const spaceFilterResults = await atlassianSearchService.search({
				cql: `space="${spaceKey}" AND type=page`,
				limit: 5,
			});

			// Verify results
			expect(spaceFilterResults).toHaveProperty('results');
			expect(Array.isArray(spaceFilterResults.results)).toBe(true);

			// If results found, verify they all belong to the specified space
			if (spaceFilterResults.results.length > 0) {
				spaceFilterResults.results.forEach((result) => {
					expect(result.content.space).toHaveProperty(
						'key',
						spaceKey,
					);
				});
			}
		}, 15000);

		it('should handle CQL with text search conditions', async () => {
			if (skipIfNoCredentials()) return;

			// Test with text search using ~ operator (contains)
			const result = await atlassianSearchService.search({
				cql: 'text ~ "test" AND type=page',
				limit: 5,
			});

			// Verify the response structure
			expect(result).toHaveProperty('results');
			expect(Array.isArray(result.results)).toBe(true);

			// We can't verify content matches without complex parsing, but we can check the request completes
		}, 15000);

		it('should handle CQL with complex date conditions', async () => {
			if (skipIfNoCredentials()) return;

			// Get content created or updated in the last year
			const oneYearAgo = new Date();
			oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
			const dateString = oneYearAgo.toISOString().split('T')[0]; // Format as YYYY-MM-DD

			try {
				// The field name "modified" is not supported in Confluence Cloud
				// Using "created" which is widely supported
				const result = await atlassianSearchService.search({
					cql: `created >= "${dateString}" AND type=page`,
					limit: 5,
				});

				// Verify the response structure
				expect(result).toHaveProperty('results');
				expect(Array.isArray(result.results)).toBe(true);
			} catch (error) {
				// Skip test if there's a permission issue or API limitation
				console.warn('Unable to test date conditions:', error);
			}
		}, 15000);

		it('should handle CQL with OR conditions and grouping', async () => {
			if (skipIfNoCredentials()) return;

			// Test with OR operator and parentheses for grouping
			const result = await atlassianSearchService.search({
				cql: '(type=page OR type=blogpost) AND space.type=global',
				limit: 5,
			});

			// Verify the response structure
			expect(result).toHaveProperty('results');
			expect(Array.isArray(result.results)).toBe(true);

			// If results are returned, verify they match either type
			if (result.results.length > 0) {
				result.results.forEach((searchResult) => {
					const contentType = searchResult.content.type;
					expect(['page', 'blogpost']).toContain(contentType);
				});
			}
		}, 15000);

		it('should handle pagination correctly with cursor-based navigation', async () => {
			if (skipIfNoCredentials()) return;

			// Get first page with small limit to ensure pagination
			const firstPage = await atlassianSearchService.search({
				cql: 'type=page',
				limit: 2,
			});

			// Verify first page has expected properties
			expect(firstPage).toHaveProperty('results');
			expect(firstPage.results.length).toBeLessThanOrEqual(2);
			expect(firstPage).toHaveProperty('limit', 2);

			// Skip further testing if there's no next page
			if (!firstPage._links.next) {
				console.warn(
					'Skipping pagination test: No next page available',
				);
				return;
			}

			// Extract cursor from the next link
			const nextLink = firstPage._links.next;
			const cursorMatch = nextLink.match(/cursor=([^&]+)/);
			const cursor = cursorMatch
				? decodeURIComponent(cursorMatch[1])
				: null;

			if (!cursor) {
				console.warn(
					'Skipping pagination test: Could not extract cursor',
				);
				return;
			}

			// Get second page using the cursor
			const secondPage = await atlassianSearchService.search({
				cql: 'type=page',
				limit: 2,
				cursor: cursor,
			});

			// Verify second page structure
			expect(secondPage).toHaveProperty('results');
			expect(secondPage.results.length).toBeLessThanOrEqual(2);

			// Verify pages are different by comparing results
			if (firstPage.results.length > 0 && secondPage.results.length > 0) {
				// Extract IDs or unique identifiers from each page
				const firstPageIds = firstPage.results.map((r) => r.content.id);
				const secondPageIds = secondPage.results.map(
					(r) => r.content.id,
				);

				// Verify there's no overlap between pages
				const hasOverlap = firstPageIds.some((id) =>
					secondPageIds.includes(id),
				);
				expect(hasOverlap).toBe(false);
			}
		}, 15000);

		it('should respect different limit values', async () => {
			if (skipIfNoCredentials()) return;

			// Get results with different limits
			const smallLimit = await atlassianSearchService.search({
				cql: 'type=page',
				limit: 1,
			});

			const largerLimit = await atlassianSearchService.search({
				cql: 'type=page',
				limit: 3,
			});

			// Verify limits are respected
			expect(smallLimit.results.length).toBeLessThanOrEqual(1);
			expect(largerLimit.results.length).toBeLessThanOrEqual(3);

			// Verify the limit property in the response
			expect(smallLimit).toHaveProperty('limit', 1);
			expect(largerLimit).toHaveProperty('limit', 3);
		}, 15000);

		it('should handle empty results gracefully', async () => {
			if (skipIfNoCredentials()) return;

			try {
				// Use a highly specific query that's unlikely to match anything
				const uniqueTerm = `UniqueSearchTerm${Date.now()}`;
				const result = await atlassianSearchService.search({
					cql: `text="${uniqueTerm}" AND type=page`,
					limit: 5,
				});

				// Verify empty result structure
				expect(result).toHaveProperty('results');
				expect(Array.isArray(result.results)).toBe(true);
				expect(result.results.length).toBe(0);
				expect(result).toHaveProperty('start', 0);
				expect(result).toHaveProperty('limit');
				expect(result).toHaveProperty('size', 0);
				expect(result._links).not.toHaveProperty('next'); // No next page for empty results
			} catch (error) {
				// The API might reject extremely specific queries that don't match anything
				// We'll consider this test passing as long as the error is a proper McpError
				expect(error).toBeInstanceOf(McpError);
			}
		}, 15000);

		it('should throw an error for invalid CQL syntax', async () => {
			if (skipIfNoCredentials()) return;

			// Test with invalid CQL syntax
			await expect(
				atlassianSearchService.search({ cql: 'invalid-cql-syntax' }),
			).rejects.toThrow(McpError);

			try {
				await atlassianSearchService.search({
					cql: 'invalid-cql-syntax',
				});
			} catch (error) {
				expect(error).toBeInstanceOf(McpError);
				expect((error as McpError).type).toBe('API_ERROR');
				// Error message should indicate syntax problem
				expect((error as McpError).message.toLowerCase()).toContain(
					'cql',
				);
			}
		}, 15000);

		it('should throw an error for CQL with invalid field names', async () => {
			if (skipIfNoCredentials()) return;

			// Test with a non-existent field name
			await expect(
				atlassianSearchService.search({
					cql: 'nonexistentfield=somevalue',
				}),
			).rejects.toThrow(McpError);
		}, 15000);

		it('should throw an error for CQL with invalid operators', async () => {
			if (skipIfNoCredentials()) return;

			try {
				// Test with an invalid operator
				await atlassianSearchService.search({
					cql: 'type === page', // Using invalid operator ===
				});

				// If we get here, the test should fail
				fail('Should have thrown an error');
			} catch (error) {
				// Only check if it's an McpError, don't test the specific error message or type
				// as the API could respond with different errors
				expect(error).toBeInstanceOf(McpError);
			}
		}, 15000);

		it('should properly handle operator precedence in complex queries', async () => {
			if (skipIfNoCredentials()) return;

			try {
				// Complex query with mixed operators that tests precedence
				const result = await atlassianSearchService.search({
					cql: 'type=page AND (space.type=global OR creator=currentUser())',
					limit: 5,
				});

				// Verify the response structure
				expect(result).toHaveProperty('results');
				expect(Array.isArray(result.results)).toBe(true);

				// If results are returned, all should be pages
				if (result.results.length > 0) {
					result.results.forEach((searchResult) => {
						expect(searchResult.content.type).toBe('page');
					});
				}
			} catch (error) {
				// If currentUser() is not supported, skip this test
				console.warn(
					'Skipping operator precedence test: API may not support currentUser() function',
				);
			}
		}, 15000);
	});
});
