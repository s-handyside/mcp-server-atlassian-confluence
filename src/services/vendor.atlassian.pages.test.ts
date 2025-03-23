import atlassianPagesService from './vendor.atlassian.pages.service.js';
import { getAtlassianCredentials } from '../utils/transport.util.js';
import { config } from '../utils/config.util.js';

describe('Vendor Atlassian Pages Service', () => {
	// Load configuration and skip all tests if Atlassian credentials are not available
	beforeAll(() => {
		// Load configuration from all sources
		config.load();

		const credentials = getAtlassianCredentials();
		if (!credentials) {
			console.warn(
				'Skipping Atlassian Pages tests: No credentials available',
			);
		}
	});

	describe('listPages', () => {
		it('should return a list of pages', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Call the function with the real API
			const result = await atlassianPagesService.list();

			// Verify the response structure
			expect(result).toHaveProperty('results');
			expect(Array.isArray(result.results)).toBe(true);
			expect(result).toHaveProperty('_links');

			// If pages are returned, verify their structure
			if (result.results.length > 0) {
				const page = result.results[0];
				expect(page).toHaveProperty('id');
				expect(page).toHaveProperty('title');
				expect(page).toHaveProperty('spaceId');
				expect(page).toHaveProperty('status');
				expect(page).toHaveProperty('_links');
				expect(page).toHaveProperty('authorId');
				expect(page).toHaveProperty('createdAt');
			}
		}, 15000); // Increase timeout for API call

		it('should support filtering by space ID', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// First, get a list of pages to find a valid space ID
			const pages = await atlassianPagesService.list({ limit: 1 });

			// Skip if no pages are available
			if (pages.results.length === 0) {
				console.warn('Skipping test: No pages available');
				return;
			}

			const spaceId = pages.results[0].spaceId;

			// Call the function with the real API and filter by space ID
			const result = await atlassianPagesService.list({
				spaceId: [spaceId],
				limit: 5,
			});

			// Verify the response structure
			expect(result).toHaveProperty('results');
			expect(Array.isArray(result.results)).toBe(true);

			// If pages are returned, verify they match the filter
			if (result.results.length > 0) {
				result.results.forEach((page) => {
					expect(page.spaceId).toBe(spaceId);
				});
			}
		}, 15000); // Increase timeout for API call

		it('should handle pagination correctly', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Get two pages of results with different limits
			const firstPage = await atlassianPagesService.list({ limit: 2 });
			const secondPage = await atlassianPagesService.list({ limit: 3 });

			// Verify pagination metadata
			expect(firstPage).toHaveProperty('_links');
			expect(secondPage).toHaveProperty('_links');

			// Verify result limits are respected
			if (firstPage.results.length > 0) {
				expect(firstPage.results.length).toBeLessThanOrEqual(2);
			}
			if (secondPage.results.length > 0) {
				expect(secondPage.results.length).toBeLessThanOrEqual(3);
			}
		}, 15000);

		it('should handle invalid filter values gracefully', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Test with invalid space ID
			await expect(
				atlassianPagesService.list({
					spaceId: ['invalid-space-id'],
					limit: 5,
				}),
			).rejects.toThrow(
				/Atlassian API error.*'space-id' is not the correct type/,
			);
		}, 15000);
	});

	describe('getPageById', () => {
		it('should return details for a valid page ID', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// First, get a list of pages to find a valid ID
			const pages = await atlassianPagesService.list({ limit: 1 });

			// Skip if no pages are available
			if (pages.results.length === 0) {
				console.warn('Skipping test: No pages available');
				return;
			}

			const pageId = pages.results[0].id;

			// Call the function with the real API
			const result = await atlassianPagesService.get(pageId);

			// Verify the response contains expected fields
			expect(result).toHaveProperty('id', pageId);
			expect(result).toHaveProperty('title');
			expect(result).toHaveProperty('spaceId');
			expect(result).toHaveProperty('status');
			expect(result).toHaveProperty('authorId');
			expect(result).toHaveProperty('createdAt');
			expect(result).toHaveProperty('_links');
		}, 15000);

		it('should include additional fields when requested', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// First, get a list of pages to find a valid ID
			const pages = await atlassianPagesService.list({ limit: 1 });

			// Skip if no pages are available
			if (pages.results.length === 0) {
				console.warn('Skipping test: No pages available');
				return;
			}

			const pageId = pages.results[0].id;

			// Call the function with the real API and request additional fields
			const result = await atlassianPagesService.get(pageId, {
				bodyFormat: 'view',
				includeLabels: true,
				includeVersions: true,
			});

			// Verify the response contains expected fields
			expect(result).toHaveProperty('id', pageId);

			// Check for body if it was requested
			if (result.body?.view) {
				expect(result.body.view).toHaveProperty('value');
				expect(result.body.view).toHaveProperty('representation');
			}

			// Check for labels if they were requested
			if (result.labels) {
				expect(result.labels).toHaveProperty('results');
				expect(Array.isArray(result.labels.results)).toBe(true);
				expect(result.labels).toHaveProperty('meta');
				expect(result.labels).toHaveProperty('_links');
			}

			// Check for versions if they were requested
			if (result.versions) {
				expect(result.versions).toHaveProperty('results');
				expect(Array.isArray(result.versions.results)).toBe(true);
				expect(result.versions).toHaveProperty('meta');
				expect(result.versions).toHaveProperty('_links');
			}
		}, 15000);

		it('should handle invalid page IDs', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Use an invalid page ID
			const invalidId = 'invalid-page-id';

			// Call the function with the real API and expect it to throw
			await expect(
				atlassianPagesService.get(invalidId),
			).rejects.toThrow();
		}, 15000);

		it('should handle non-existent page IDs', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Use a non-existent but valid-format page ID
			const nonExistentId = '999999999';

			// Call the function with the real API and expect it to throw
			await expect(
				atlassianPagesService.get(nonExistentId),
			).rejects.toThrow();
		}, 15000);
	});
});
