import atlassianPagesController from './atlassian.pages.controller.js';
import { getAtlassianCredentials } from '../utils/transport.util.js';
import { config } from '../utils/config.util.js';
import { McpError } from '../utils/error.util.js';

describe('Atlassian Pages Controller', () => {
	// Load configuration and skip all tests if Atlassian credentials are not available
	beforeAll(() => {
		// Load configuration from all sources
		config.load();

		const credentials = getAtlassianCredentials();
		if (!credentials) {
			console.warn(
				'Skipping Atlassian Pages Controller tests: No credentials available',
			);
		}
	});

	describe('list', () => {
		it('should return a formatted list of pages', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Call the function
			const result = await atlassianPagesController.list();

			// Verify the response structure
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');

			// Verify the content format
			if (result.content !== 'No Confluence pages found.') {
				expect(result.content).toContain('# Confluence Pages');
				expect(result.content).toContain('**ID**');
				expect(result.content).toContain('**Title**');
				expect(result.content).toContain('**Space ID**');
				expect(result.content).toContain('**Status**');
			}
		}, 15000);

		it('should handle filtering by space ID', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// First, get a list of pages to find a valid space ID
			const initialResult = await atlassianPagesController.list();

			// Skip if no pages are available
			if (initialResult.content === 'No Confluence pages found.') {
				console.warn('Skipping test: No pages available');
				return;
			}

			// Extract a space ID from the list result
			const match = initialResult.content.match(
				/\*\*Space ID\*\*: ([0-9]+)/,
			);
			if (!match || !match[1]) {
				console.warn(
					'Skipping test: Could not extract space ID from list result',
				);
				return;
			}

			const spaceId = match[1];

			// Call the function with the space ID filter
			const result = await atlassianPagesController.list({
				spaceId: [spaceId],
			});

			// Verify the response
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');
			expect(result.content).toContain(`**Space ID**: ${spaceId}`);
		}, 15000);

		it('should handle empty results gracefully', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Call with a non-existent space ID to force empty results
			const result = await atlassianPagesController.list({
				spaceId: ['999999999'],
			});

			// Verify the response
			expect(result).toHaveProperty('content');
			expect(result.content).toBe('No Confluence pages found.');
		}, 15000);

		it('should handle pagination correctly', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Get two pages with different limits
			const firstResult = await atlassianPagesController.list({
				limit: 2,
			});
			const secondResult = await atlassianPagesController.list({
				limit: 3,
			});

			// Skip if no pages are available
			if (
				firstResult.content === 'No Confluence pages found.' ||
				secondResult.content === 'No Confluence pages found.'
			) {
				console.warn('Skipping test: No pages available');
				return;
			}

			// Count the number of pages in each result
			const firstCount = (firstResult.content.match(/\*\*ID\*\*:/g) || [])
				.length;
			const secondCount = (
				secondResult.content.match(/\*\*ID\*\*:/g) || []
			).length;

			// Verify limits are respected
			expect(firstCount).toBeLessThanOrEqual(2);
			expect(secondCount).toBeLessThanOrEqual(3);
		}, 15000);

		it('should handle invalid space ID by throwing an error', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Call with an invalid space ID format
			await expect(
				atlassianPagesController.list({
					spaceId: ['invalid-space-id'],
				}),
			).rejects.toThrow(McpError);

			// Try to catch the error to verify its properties
			try {
				await atlassianPagesController.list({
					spaceId: ['invalid-space-id'],
				});
			} catch (error) {
				expect(error).toBeInstanceOf(McpError);
				if (error instanceof McpError) {
					// Don't check for specific message content since it comes from the API
					expect(error.type).toBe('API_ERROR');
				}
			}
		}, 15000);
	});

	describe('get', () => {
		it('should return formatted details for a valid page ID', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// First, get a list of pages to find a valid ID
			const listResult = await atlassianPagesController.list();

			// Skip if no pages are available
			if (listResult.content === 'No Confluence pages found.') {
				console.warn('Skipping test: No pages available');
				return;
			}

			// Extract a page ID from the list result
			const match = listResult.content.match(/\*\*ID\*\*: ([0-9]+)/);
			if (!match || !match[1]) {
				console.warn(
					'Skipping test: Could not extract page ID from list result',
				);
				return;
			}

			const pageId = match[1];

			// Call the function with the extracted ID
			const result = await atlassianPagesController.get(pageId);

			// Verify the response structure
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');

			// Verify the content format
			expect(result.content).toContain('# Confluence Page:');
			expect(result.content).toContain(`**ID**: ${pageId}`);
			expect(result.content).toContain('**Title**:');
			expect(result.content).toContain('**Space ID**:');
			expect(result.content).toContain('**Status**:');
			expect(result.content).toContain('**Created At**:');
			expect(result.content).toContain('**Author ID**:');
			expect(result.content).toContain('## Content');
			expect(result.content).toContain('## Links');
			expect(result.content).toContain('**Web UI**:');
			expect(result.content).toContain('*Page information retrieved at');
			expect(result.content).toContain(
				'*To view this page in Confluence, visit:',
			);
		}, 15000);

		it('should throw an error for invalid page ID', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Use an invalid ID (non-numeric)
			const invalidId = 'invalid-page-id';

			// Try to catch the error to verify its properties
			try {
				await atlassianPagesController.get(invalidId);
				fail('Expected an error to be thrown');
			} catch (error) {
				expect(error).toBeInstanceOf(McpError);
				if (error instanceof McpError) {
					// Don't check for specific message content since it comes from the API
					expect(error.type).toBe('API_ERROR');
				}
			}
		}, 15000);

		it('should throw an error for non-existent page ID', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Use a non-existent ID
			const nonExistentId = '999999999';

			// Expect the function to throw an error
			await expect(
				atlassianPagesController.get(nonExistentId),
			).rejects.toThrow(McpError);

			// Try to catch the error to verify its properties
			try {
				await atlassianPagesController.get(nonExistentId);
			} catch (error) {
				expect(error).toBeInstanceOf(McpError);
				if (error instanceof McpError) {
					expect(error.message).toContain('Resource not found');
					expect(error.type).toBe('API_ERROR');
				}
			}
		}, 15000);

		it('should include additional fields when requested', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// First, get a list of pages to find a valid ID
			const listResult = await atlassianPagesController.list();

			// Skip if no pages are available
			if (listResult.content === 'No Confluence pages found.') {
				console.warn('Skipping test: No pages available');
				return;
			}

			// Extract a page ID from the list result
			const match = listResult.content.match(/\*\*ID\*\*: ([0-9]+)/);
			if (!match || !match[1]) {
				console.warn(
					'Skipping test: Could not extract page ID from list result',
				);
				return;
			}

			const pageId = match[1];

			// Call the function with the extracted ID
			const result = await atlassianPagesController.get(pageId);

			// Verify the response structure
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');

			// Verify additional fields are included
			expect(result.content).toContain('## Content');
			expect(result.content).toContain('## Labels');
		}, 15000);
	});
});
