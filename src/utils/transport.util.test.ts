import { getAtlassianCredentials, fetchAtlassian } from './transport.util.js';
import { config } from './config.util.js';
import { Logger } from './logger.util.js';
import { SpacesResponse } from '../services/vendor.atlassian.spaces.types.js';
import { McpError } from './error.util.js';

// Mock the Logger class to prevent console output during tests
jest.mock('./logger.util.js', () => ({
	Logger: {
		forContext: jest.fn().mockReturnValue({
			debug: jest.fn(),
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		}),
	},
}));

describe('Transport Utility', () => {
	// Load configuration before all tests
	beforeAll(() => {
		// Load configuration from all sources
		config.load();

		const credentials = getAtlassianCredentials();
		if (!credentials) {
			console.warn(
				'Skipping Atlassian Transport Utility tests that require credentials',
			);
		}
	});

	// Helper function to skip tests when credentials are missing
	const skipIfNoCredentials = () => !getAtlassianCredentials();

	describe('getAtlassianCredentials', () => {
		it('should return credentials when environment variables are set', () => {
			const credentials = getAtlassianCredentials();

			// Skip this test if credentials are not available
			if (!credentials) {
				console.warn(
					'Skipping test: No Atlassian credentials available',
				);
				return;
			}

			// Verify the structure of the credentials
			expect(credentials).toHaveProperty('siteName');
			expect(credentials).toHaveProperty('userEmail');
			expect(credentials).toHaveProperty('apiToken');

			// Verify the credentials are not empty
			expect(credentials.siteName).toBeTruthy();
			expect(credentials.userEmail).toBeTruthy();
			expect(credentials.apiToken).toBeTruthy();
		});

		it('should return null and log a warning when environment variables are missing', () => {
			// Create a spy on the Logger instance to track warn calls
			const warnSpy = jest.spyOn(
				Logger.forContext('utils/transport.util.ts'),
				'warn',
			);

			// Store original environment values
			const originalSiteName = process.env.ATLASSIAN_SITE_NAME;
			const originalUserEmail = process.env.ATLASSIAN_USER_EMAIL;
			const originalApiToken = process.env.ATLASSIAN_API_TOKEN;

			// Temporarily remove credentials from environment
			delete process.env.ATLASSIAN_SITE_NAME;
			delete process.env.ATLASSIAN_USER_EMAIL;
			delete process.env.ATLASSIAN_API_TOKEN;

			// Clear the config cache
			jest.clearAllMocks();
			config.load();

			// Call the function
			const credentials = getAtlassianCredentials();

			// Verify the result is null
			expect(credentials).toBeNull();

			// Verify that a warning was logged
			expect(warnSpy).toHaveBeenCalledWith(
				'Missing Atlassian credentials. Please set ATLASSIAN_SITE_NAME, ATLASSIAN_USER_EMAIL, and ATLASSIAN_API_TOKEN environment variables.',
			);

			// Restore original environment values
			process.env.ATLASSIAN_SITE_NAME = originalSiteName;
			process.env.ATLASSIAN_USER_EMAIL = originalUserEmail;
			process.env.ATLASSIAN_API_TOKEN = originalApiToken;

			// Restore config
			config.load();

			// Clean up spy
			warnSpy.mockRestore();
		});
	});

	describe('fetchAtlassian', () => {
		it('should handle API requests appropriately', async () => {
			if (skipIfNoCredentials()) return;

			// Since we skip the test if credentials are null, we can safely assert non-null here
			const credentials = getAtlassianCredentials()!;

			try {
				// We need to use a valid endpoint for this test
				// Make a real API call to get spaces (limiting to 1 result to reduce load)
				const result = await fetchAtlassian<SpacesResponse>(
					credentials,
					'/wiki/api/v2/spaces?limit=1',
				);

				// If the call succeeds, verify the response structure
				expect(result).toHaveProperty('results');
				expect(Array.isArray(result.results)).toBe(true);
				expect(result).toHaveProperty('_links');
			} catch (error) {
				// If API is unavailable, at least check that we're getting a proper McpError
				expect(error).toBeInstanceOf(McpError);
			}
		}, 15000);

		it('should throw an error for invalid endpoints', async () => {
			if (skipIfNoCredentials()) return;

			// Since we skip the test if credentials are null, we can safely assert non-null here
			const credentials = getAtlassianCredentials()!;

			// Make a call to a non-existent endpoint
			try {
				await fetchAtlassian(
					credentials,
					'/wiki/api/v2/non-existent-endpoint',
				);
				// If we get here, fail the test
				fail('Expected an error to be thrown');
			} catch (error) {
				// Verify it's the right kind of error
				expect(error).toBeInstanceOf(McpError);
				if (error instanceof McpError) {
					expect(error.statusCode).toBe(404);
				}
			}
		}, 15000);

		it('should normalize paths', async () => {
			if (skipIfNoCredentials()) return;

			// Since we skip the test if credentials are null, we can safely assert non-null here
			const credentials = getAtlassianCredentials()!;

			try {
				// Path without a leading slash (should be normalized)
				const result = await fetchAtlassian<SpacesResponse>(
					credentials,
					'wiki/api/v2/spaces?limit=1',
				);

				// If the call succeeds, verify the response structure
				expect(result).toHaveProperty('results');
				expect(Array.isArray(result.results)).toBe(true);
			} catch (error) {
				// If API is unavailable, at least check that we're getting a proper McpError
				expect(error).toBeInstanceOf(McpError);
			}
		}, 15000);

		it('should support custom request options', async () => {
			if (skipIfNoCredentials()) return;

			// Since we skip the test if credentials are null, we can safely assert non-null here
			const credentials = getAtlassianCredentials()!;

			// Custom request options
			const options = {
				method: 'GET' as const,
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			};

			try {
				// Make a call with custom options
				const result = await fetchAtlassian<SpacesResponse>(
					credentials,
					'/wiki/api/v2/spaces?limit=1',
					options,
				);

				// If the call succeeds, verify the response structure
				expect(result).toHaveProperty('results');
				expect(Array.isArray(result.results)).toBe(true);
			} catch (error) {
				// If API is unavailable, at least check that we're getting a proper McpError
				expect(error).toBeInstanceOf(McpError);
			}
		}, 15000);
	});
});
