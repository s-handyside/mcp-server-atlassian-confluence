import atlassianSpacesController from './atlassian.spaces.controller.js';
import { getAtlassianCredentials } from '../utils/transport.util.js';
import { config } from '../utils/config.util.js';
import { McpError } from '../utils/error.util.js';

describe('Atlassian Spaces Controller', () => {
	// Load configuration and skip all tests if Atlassian credentials are not available
	beforeAll(() => {
		// Load configuration from all sources
		config.load();

		const credentials = getAtlassianCredentials();
		if (!credentials) {
			console.warn(
				'Skipping Atlassian Spaces Controller tests: No credentials available',
			);
		}
	});

	describe('list', () => {
		it('should return a formatted list of spaces', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Call the function
			const result = await atlassianSpacesController.list();

			// Verify the response structure
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');

			// Verify the content format
			if (result.content !== 'No Confluence spaces found.') {
				expect(result.content).toContain('# Confluence Spaces');
				expect(result.content).toContain('**ID**');
				expect(result.content).toContain('**Key**');
				expect(result.content).toContain('**Type**');
			}
		}, 15000); // Increase timeout for API call
	});

	describe('get', () => {
		it('should return formatted details for a valid space ID', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// First, get a list of spaces to find a valid ID
			const listResult = await atlassianSpacesController.list();

			// Skip if no spaces are available
			if (listResult.content === 'No Confluence spaces found.') {
				console.warn('Skipping test: No spaces available');
				return;
			}

			// Extract a space ID from the list result
			const match = listResult.content.match(/\*\*ID\*\*: ([0-9]+)/);
			if (!match || !match[1]) {
				console.warn(
					'Skipping test: Could not extract space ID from list result',
				);
				return;
			}

			const spaceId = match[1];

			// Call the function with the extracted ID
			const result = await atlassianSpacesController.get({
				idOrKey: spaceId,
			});

			// Verify the response structure
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');

			// Verify the content format based on example output
			expect(result.content).toContain('# Confluence Space:');
			expect(result.content).toContain(`**ID**: ${spaceId}`);
			expect(result.content).toContain('**Key**:');
			expect(result.content).toContain('**Type**:');
			expect(result.content).toContain('**Status**:');
			expect(result.content).toContain('**Created At**:');
			expect(result.content).toContain('**Author ID**:');
			expect(result.content).toContain('**Homepage ID**:');
			expect(result.content).toContain('## Links');
			expect(result.content).toContain('**Web UI**:');
			expect(result.content).toContain('## Labels');
			expect(result.content).toContain('*Space information retrieved at');
			expect(result.content).toContain(
				'*To view this space in Confluence, visit:',
			);
		}, 15000); // Increase timeout for API call

		it('should handle invalid space IDs', async () => {
			// Check if credentials are available
			const credentials = getAtlassianCredentials();
			if (!credentials) {
				return; // Skip this test if no credentials
			}

			// Use an invalid space ID
			const invalidId = 'invalid-space-id';

			// Expect the function to throw an error
			await expect(
				atlassianSpacesController.get({ idOrKey: invalidId }),
			).rejects.toThrow(McpError);

			// Try to catch the error to verify its properties
			try {
				await atlassianSpacesController.get({ idOrKey: invalidId });
				fail('Expected an error to be thrown');
			} catch (error) {
				expect(error).toBeInstanceOf(McpError);
				if (error instanceof McpError) {
					// Don't check for specific message content since it comes from the API
					expect(error.type).toBe('API_ERROR');
				}
			}
		}, 15000); // Increase timeout for API call
	});
});
