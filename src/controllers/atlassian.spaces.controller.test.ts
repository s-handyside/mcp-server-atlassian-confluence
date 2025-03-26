import atlassianSpacesController from './atlassian.spaces.controller.js';
import { McpError } from '../utils/error.util.js';
import { config } from '../utils/config.util.js';

describe('Atlassian Spaces Controller', () => {
	// Load configuration before tests
	beforeAll(() => {
		config.load();
	});

	// Helper function to check if credentials are available
	function hasCredentials() {
		return (
			config.get('ATLASSIAN_AUTH_HEADER') ||
			(config.get('ATLASSIAN_API_KEY') && config.get('ATLASSIAN_EMAIL'))
		);
	}

	describe('list()', () => {
		it('should return a formatted list of spaces', async () => {
			// Check if credentials are available
			if (!hasCredentials()) {
				console.warn('Skipping test: No credentials available');
				return; // Skip this test if no credentials
			}

			// Call the function with no filters
			const result = await atlassianSpacesController.list();

			// Verify the response structure
			expect(result).toHaveProperty('content');
			expect(result).toHaveProperty('pagination');
			expect(typeof result.content).toBe('string');

			// Check pagination structure
			expect(result.pagination).toHaveProperty('hasMore');
			expect(result.pagination).toHaveProperty('count');

			// Verify the content format based on example output
			expect(result.content).toContain('## Spaces');
			expect(result.content).toContain('| Space Key | Name | Type |');
			expect(result.content).toContain('| --- | --- | --- |');
		}, 15000); // Increase timeout for API call

		it('should filter spaces by type', async () => {
			// Check if credentials are available
			if (!hasCredentials()) {
				console.warn('Skipping test: No credentials available');
				return; // Skip this test if no credentials
			}

			// Call the function with type filter
			const result = await atlassianSpacesController.list({
				type: 'global',
			});

			// Verify the response structure
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');

			// The test would ideally verify that only spaces of the specified type are returned,
			// but that would require parsing the output or examining the internal service call results
			// For now, we just verify that we get a valid response
		}, 15000); // Increase timeout for API call
	});

	describe('get()', () => {
		it('should return detailed information for a valid space', async () => {
			// Check if credentials are available
			if (!hasCredentials()) {
				console.warn('Skipping test: No credentials available');
				return; // Skip this test if no credentials
			}

			// Get a list of spaces
			const spacesResult = await atlassianSpacesController.list({
				limit: 1,
			});

			// Extract a space key from the result
			// Look for "| Key | Name |" pattern in the table
			const match = spacesResult.content.match(/\| ([A-Z]+) \|/);
			if (!match) {
				console.warn('No spaces found, skipping test');
				return;
			}

			const spaceKey = match[1];

			// Call the function with the extracted key
			const result = await atlassianSpacesController.get({
				key: spaceKey,
			});

			// Verify the response structure
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');

			// Verify the content format based on example output
			expect(result.content).toContain('# Confluence Space:');
			expect(result.content).toContain('**ID**:');
			expect(result.content).toContain(`**Key**: ${spaceKey}`);
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

		it('should handle invalid space keys', async () => {
			// Check if credentials are available
			if (!hasCredentials()) {
				console.warn('Skipping test: No credentials available');
				return; // Skip this test if no credentials
			}

			// Use an invalid space key
			const invalidKey = 'invalid-space-id';

			// Expect the function to throw an error
			await expect(
				atlassianSpacesController.get({ key: invalidKey }),
			).rejects.toThrow(McpError);

			// Try to catch the error to verify its properties
			try {
				await atlassianSpacesController.get({ key: invalidKey });
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
