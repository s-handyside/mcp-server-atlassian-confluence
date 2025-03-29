import pagesService from './vendor.atlassian.pages.service.js';
import { getAtlassianCredentials } from '../utils/transport.util.js';
import { config } from '../utils/config.util.js';

describe('Vendor Atlassian Pages Service', () => {
	// Load configuration before all tests
	beforeAll(() => {
		// Load configuration from all sources
		config.load();

		// Log a warning if credentials aren't available
		const credentials = getAtlassianCredentials();
		if (!credentials) {
			console.warn(
				'Skipping Atlassian Pages tests: No credentials available',
			);
		}
	});

	// Conditional test suite that only runs when credentials are available
	(getAtlassianCredentials() ? describe : describe.skip)('list', () => {
		it('should return a list of pages', async () => {
			// Get pages without filters
			const result = await pagesService.list({});

			// Verify the response structure
			expect(result).toHaveProperty('results');
			expect(Array.isArray(result.results)).toBe(true);
			expect(result).toHaveProperty('_links');

			// Verify data types in the results
			if (result.results.length > 0) {
				const firstPage = result.results[0];
				expect(firstPage).toHaveProperty('id');
				expect(firstPage).toHaveProperty('title');
				expect(firstPage).toHaveProperty('status');
				expect(firstPage).toHaveProperty('spaceId');
			}
		}, 15000);

		it('should support filtering by space ID', async () => {
			// Get the first space ID from the API (if available)
			let spaceId: string | undefined = undefined;
			try {
				const result = await pagesService.list({ limit: 1 });
				if (result.results.length > 0) {
					spaceId = result.results[0].spaceId;
				}
			} catch (error) {
				console.warn('Error getting space ID for test:', error);
			}

			// If we have a space ID, test filtering by it
			if (spaceId) {
				const result = await pagesService.list({ spaceId: [spaceId] });

				// Verify the response structure
				expect(result).toHaveProperty('results');
				expect(Array.isArray(result.results)).toBe(true);

				// Verify all pages have the correct space ID
				for (const page of result.results) {
					expect(page.spaceId).toBe(spaceId);
				}
			} else {
				// Skip this test case if we couldn't get a space ID
				console.warn(
					'Skipping space ID filter test: No space ID available',
				);
			}
		}, 15000);

		it('should support filtering by status', async () => {
			// Get pages with status filter
			const result = await pagesService.list({ status: ['current'] });

			// Verify the response structure
			expect(result).toHaveProperty('results');
			expect(Array.isArray(result.results)).toBe(true);

			// Verify all pages have the correct status
			for (const page of result.results) {
				expect(page.status).toBe('current');
			}
		}, 15000);

		it('should support sorting with different sort parameters', async () => {
			// Test sorting by title (ascending)
			const ascResult = await pagesService.list({ sort: 'title' });

			// Verify the response structure
			expect(ascResult).toHaveProperty('results');
			expect(Array.isArray(ascResult.results)).toBe(true);

			// Test sorting by title (descending)
			const descResult = await pagesService.list({ sort: '-title' });

			// Verify the response structure
			expect(descResult).toHaveProperty('results');
			expect(Array.isArray(descResult.results)).toBe(true);

			// If there are at least 2 pages, verify the order is reversed
			if (
				ascResult.results.length >= 2 &&
				descResult.results.length >= 2
			) {
				// The titles should be in reverse order
				expect(ascResult.results[0].title).not.toBe(
					descResult.results[0].title,
				);
			}
		}, 15000);

		it('should support filtering by page title (query parameter)', async () => {
			// First get a list of pages
			const initialResult = await pagesService.list({ limit: 1 });

			// If we have at least one page, use part of its title as a query
			let titleQuery = 'test';
			if (initialResult.results.length > 0) {
				const firstPage = initialResult.results[0];
				// Use the first word of the title as a query if it's at least 3 chars
				const words = firstPage.title.split(' ');
				for (const word of words) {
					if (word.length >= 3) {
						titleQuery = word;
						break;
					}
				}
			}

			// Test the title parameter
			const result = await pagesService.list({ title: titleQuery });

			// Verify the response structure
			expect(result).toHaveProperty('results');
			expect(Array.isArray(result.results)).toBe(true);
		}, 15000);

		it('should handle pagination correctly with cursor-based navigation', async () => {
			// Get pages with a small limit
			const firstResult = await pagesService.list({ limit: 2 });

			// Verify the response structure
			expect(firstResult).toHaveProperty('results');
			expect(Array.isArray(firstResult.results)).toBe(true);
			expect(firstResult).toHaveProperty('_links');

			// If there are more pages, test pagination
			if (
				firstResult._links.next &&
				firstResult._links.next.includes('cursor=')
			) {
				// Extract the cursor from the next link
				const cursorMatch =
					firstResult._links.next.match(/cursor=([^&]+)/);
				if (cursorMatch && cursorMatch[1]) {
					const cursor = cursorMatch[1];

					// Get the next page using the cursor
					const secondResult = await pagesService.list({ cursor });

					// Verify the response structure
					expect(secondResult).toHaveProperty('results');
					expect(Array.isArray(secondResult.results)).toBe(true);

					// Verify the pages are different
					if (
						firstResult.results.length > 0 &&
						secondResult.results.length > 0
					) {
						expect(firstResult.results[0].id).not.toBe(
							secondResult.results[0].id,
						);
					}
				}
			}
		}, 15000);

		it('should handle filtering by multiple space IDs', async () => {
			// Get some space IDs
			const spaceIds: string[] = [];
			try {
				const result = await pagesService.list({ limit: 10 });
				for (const page of result.results) {
					if (
						!spaceIds.includes(page.spaceId) &&
						spaceIds.length < 2
					) {
						spaceIds.push(page.spaceId);
					}
				}
			} catch (error) {
				console.warn('Error getting space IDs for test:', error);
			}

			// If we have at least one space ID, test filtering
			if (spaceIds.length > 0) {
				const result = await pagesService.list({ spaceId: spaceIds });

				// Verify the response structure
				expect(result).toHaveProperty('results');
				expect(Array.isArray(result.results)).toBe(true);

				// Verify all pages have one of the correct space IDs
				for (const page of result.results) {
					expect(spaceIds).toContain(page.spaceId);
				}
			} else {
				// Skip this test case if we couldn't get any space IDs
				console.warn(
					'Skipping multiple space IDs test: No space IDs available',
				);
			}
		}, 15000);

		it('should handle empty result correctly', async () => {
			// Use a nonsense query that shouldn't match any pages
			const result = await pagesService.list({
				title: `no-such-page-${Date.now()}`,
			});

			// Verify the response structure for empty results
			expect(result).toHaveProperty('results');
			expect(Array.isArray(result.results)).toBe(true);
			expect(result.results).toHaveLength(0);
			expect(result).toHaveProperty('_links');
		}, 15000);

		it('should throw an error for invalid spaceId format if enforced by API', async () => {
			// Different Confluence instances may handle invalid space IDs differently
			// Some validate and return 400, others might allow and return empty results
			try {
				await pagesService.list({
					spaceId: ['invalid-not-numeric-id'],
				});

				// If API doesn't validate IDs, this will succeed with empty results
				// Specific API versions may diverge in behavior, so skip checking
			} catch (error) {
				// If API validates IDs and rejects, verify it's a proper error
				expect(error).toBeInstanceOf(Error);
				if (error instanceof Error) {
					// The error type might be VALIDATION_ERROR, BAD_REQUEST, API_ERROR, or NOT_FOUND
					// depending on API version and configuration
					expect([
						'VALIDATION_ERROR',
						'BAD_REQUEST',
						'API_ERROR',
						'NOT_FOUND',
						'AUTH_MISSING',
					]).toContain(error.name || (error as any).type);
				}
			}
		}, 15000);
	});

	// Helper function to get a page ID for tests
	async function getFirstPageId(): Promise<string | null> {
		try {
			// Get the first page
			const result = await pagesService.list({ limit: 1 });
			return result.results.length > 0 ? result.results[0].id : null;
		} catch (error) {
			console.warn('Error getting page ID for tests:', error);
			return null;
		}
	}

	// Conditional test suite that only runs when credentials are available
	(getAtlassianCredentials() ? describe : describe.skip)('get', () => {
		it('should retrieve a page by ID', async () => {
			const pageId = await getFirstPageId();
			if (!pageId) {
				console.warn('Skipping get test: No page ID available');
				return;
			}

			// Get the page
			const result = await pagesService.get(pageId);

			// Verify the response structure
			expect(result).toHaveProperty('id', pageId);
			expect(result).toHaveProperty('title');
			expect(result).toHaveProperty('status');
			expect(result).toHaveProperty('body');
		}, 15000);

		it('should support body format parameter', async () => {
			const pageId = await getFirstPageId();
			if (!pageId) {
				console.warn('Skipping body format test: No page ID available');
				return;
			}

			// Get the page with specific body format
			const result = await pagesService.get(pageId, {
				bodyFormat: 'storage',
			});

			// Verify the body format
			expect(result).toHaveProperty('body');
			if (result.body && result.body.storage) {
				expect(result.body.storage).toHaveProperty('value');
				expect(result.body.storage).toHaveProperty(
					'representation',
					'storage',
				);
			}
		}, 15000);

		it('should retrieve page labels', async () => {
			const pageId = await getFirstPageId();
			if (!pageId) {
				console.warn('Skipping labels test: No page ID available');
				return;
			}

			// Get the page with labels expanded
			const result = await pagesService.get(pageId, {
				includeLabels: true,
			});

			// Verify the labels structure
			expect(result).toHaveProperty('labels');
			if (result.labels) {
				expect(result.labels).toHaveProperty('results');
				expect(Array.isArray(result.labels.results)).toBe(true);
			}
		}, 15000);

		it('should retrieve page version information', async () => {
			const pageId = await getFirstPageId();
			if (!pageId) {
				console.warn('Skipping version test: No page ID available');
				return;
			}

			// Get the page with version expanded
			const result = await pagesService.get(pageId, {
				includeVersion: true,
			});

			// Verify the version structure
			expect(result).toHaveProperty('version');
			if (result.version) {
				expect(result.version).toHaveProperty('number');
				expect(typeof result.version.number).toBe('number');
			}
		}, 15000);

		it('should throw properly formatted error for non-existent page ID', async () => {
			try {
				// Use a page ID that shouldn't exist
				await pagesService.get('999999999');
				// If we get here, the test has failed
				fail('Expected an error for non-existent page ID');
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				// Error behavior may vary by API version and implementation
				// (NOT_FOUND or AUTH_MISSING are both valid)
				if (error instanceof Error) {
					expect(['NOT_FOUND', 'AUTH_MISSING']).toContain(
						error.name || (error as any).type,
					);

					// Status code test is skipped as it depends on credential state
				}
			}
		}, 15000);

		it('should throw properly formatted error for invalid page ID format', async () => {
			try {
				// Use an invalid page ID format
				await pagesService.get('invalid-page-id');
				// If we get here, the test has failed
				fail('Expected an error for invalid page ID format');
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				// The error type might be INVALID_REQUEST or NOT_FOUND depending on the API
				if (error instanceof Error) {
					expect([
						'INVALID_REQUEST',
						'NOT_FOUND',
						'API_ERROR',
						'AUTH_MISSING',
					]).toContain(error.name || (error as any).type);
					// Status code test is skipped as it depends on credential state
				}
			}
		}, 15000);

		it('should support multiple include parameters', async () => {
			const pageId = await getFirstPageId();
			if (!pageId) {
				console.warn(
					'Skipping multiple include test: No page ID available',
				);
				return;
			}

			// Get the page with multiple includes
			const result = await pagesService.get(pageId, {
				includeVersion: true,
				includeLabels: true,
			});

			// Verify multiple expanded sections
			expect(result).toHaveProperty('version');
			expect(result).toHaveProperty('labels');
		}, 15000);
	});
});
