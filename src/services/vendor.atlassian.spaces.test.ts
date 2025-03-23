import atlassianSpacesService from './vendor.atlassian.spaces.service.js';
import { getAtlassianCredentials } from '../utils/transport.util.js';
import { config } from '../utils/config.util.js';

describe('Vendor Atlassian Spaces Service', () => {
	// Load configuration and skip all tests if Atlassian credentials are not available
	beforeAll(() => {
		// Load configuration from all sources
		config.load();

		const credentials = getAtlassianCredentials();
		if (!credentials) {
			console.warn(
				'Skipping Atlassian Spaces tests: No credentials available',
			);
		}
	});

	describe('listSpaces', () => {
		it('should return a list of spaces', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Call the function with the real API
			const result = await atlassianSpacesService.list();

			// Verify the response structure
			expect(result).toHaveProperty('results');
			expect(Array.isArray(result.results)).toBe(true);
			expect(result).toHaveProperty('_links');

			// If spaces are returned, verify their structure
			if (result.results.length > 0) {
				const space = result.results[0];
				expect(space).toHaveProperty('id');
				expect(space).toHaveProperty('key');
				expect(space).toHaveProperty('name');
				expect(space).toHaveProperty('type');
				expect(space).toHaveProperty('status');
				expect(space).toHaveProperty('_links');
			}
		}, 15000); // Increase timeout for API call

		it('should support filtering by type', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Call the function with the real API and filter by type
			const result = await atlassianSpacesService.list({
				type: 'global',
				limit: 5,
			});

			// Verify the response structure
			expect(result).toHaveProperty('results');
			expect(Array.isArray(result.results)).toBe(true);

			// If spaces are returned, verify they match the filter
			if (result.results.length > 0) {
				result.results.forEach((space) => {
					expect(space.type).toBe('global');
				});
			}
		}, 15000); // Increase timeout for API call
	});

	describe('getSpaceById', () => {
		it('should return details for a valid space ID', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// First, get a list of spaces to find a valid ID
			const spaces = await atlassianSpacesService.list({ limit: 1 });

			// Skip if no spaces are available
			if (spaces.results.length === 0) {
				console.warn('Skipping test: No spaces available');
				return;
			}

			const spaceId = spaces.results[0].id;

			// Call the function with the real API
			const result = await atlassianSpacesService.get(spaceId);

			// Verify the response contains expected fields
			expect(result).toHaveProperty('id', spaceId);
			expect(result).toHaveProperty('key');
			expect(result).toHaveProperty('name');
			expect(result).toHaveProperty('type');
			expect(result).toHaveProperty('status');
			expect(result).toHaveProperty('authorId');
			expect(result).toHaveProperty('createdAt');
			expect(result).toHaveProperty('homepageId');
			expect(result).toHaveProperty('_links');
		}, 15000); // Increase timeout for API call

		it('should include additional fields when requested', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// First, get a list of spaces to find a valid ID
			const spaces = await atlassianSpacesService.list({ limit: 1 });

			// Skip if no spaces are available
			if (spaces.results.length === 0) {
				console.warn('Skipping test: No spaces available');
				return;
			}

			const spaceId = spaces.results[0].id;

			// Call the function with the real API and request additional fields
			const result = await atlassianSpacesService.get(spaceId, {
				includeIcon: true,
				includeLabels: true,
				descriptionFormat: 'plain',
			});

			// Verify the response contains expected fields
			expect(result).toHaveProperty('id', spaceId);

			// Check for labels if they were requested
			if (result.labels) {
				expect(result.labels).toHaveProperty('results');
				expect(Array.isArray(result.labels.results)).toBe(true);
				expect(result.labels).toHaveProperty('meta');
				expect(result.labels).toHaveProperty('_links');
			}
		}, 15000); // Increase timeout for API call

		it('should handle invalid space IDs', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Use an invalid space ID
			const invalidId = 'invalid-space-id';

			// Call the function with the real API and expect it to throw
			await expect(
				atlassianSpacesService.get(invalidId),
			).rejects.toThrow();
		}, 15000); // Increase timeout for API call
	});
});
