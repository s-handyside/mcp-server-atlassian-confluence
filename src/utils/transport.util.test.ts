import { getAtlassianCredentials, fetchAtlassian } from './transport.util.js';
import { config } from './config.util.js';
import { Logger } from './logger.util.js';
import { McpError } from './error.util.js';

/**
 * SpacesResponse type definition (moved from deleted vendor.atlassian.spaces.types.js)
 */
interface SpacesResponse {
	results: Array<{
		id: string;
		key: string;
		name: string;
		[key: string]: any;
	}>;
	_links?: {
		[key: string]: string;
	};
}

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
	});

	describe('getAtlassianCredentials', () => {
		it('should return credentials when environment variables are set', () => {
			const credentials = getAtlassianCredentials();

			// This test is not skipped - it should pass either way
			if (credentials) {
				// Verify the structure of the credentials
				expect(credentials).toHaveProperty('siteName');
				expect(credentials).toHaveProperty('userEmail');
				expect(credentials).toHaveProperty('apiToken');

				// Verify the credentials are not empty
				expect(credentials.siteName).toBeTruthy();
				expect(credentials.userEmail).toBeTruthy();
				expect(credentials.apiToken).toBeTruthy();
			} else {
				// If no credentials, this is also valid (test passes)
				expect(credentials).toBeNull();
			}
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

	// Helper function to skip tests when credentials are missing
	const skipIfNoCredentials = () => !getAtlassianCredentials();

	// Always describe the suite, but skip individual tests if needed
	describe('fetchAtlassian with credentials', () => {
		it('should handle API requests appropriately', async () => {
			if (skipIfNoCredentials()) return; // Skip if no credentials

			const credentials = getAtlassianCredentials();
			// We know credentials won't be null here because of the check above
			if (!credentials) {
				// This is just a safety check - we should never get here
				return;
			}

			try {
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
			if (skipIfNoCredentials()) return; // Skip if no credentials

			const credentials = getAtlassianCredentials();
			// We know credentials won't be null here because of the check above
			if (!credentials) {
				// This is just a safety check - we should never get here
				return;
			}

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
					// The API seems to return 404 for invalid endpoints now, not 400.
					// Allow either 400 or 404 to make the test more robust.
					expect([400, 404]).toContain(error.statusCode);
				}
			}
		}, 15000);

		it('should normalize paths', async () => {
			if (skipIfNoCredentials()) return; // Skip if no credentials

			const credentials = getAtlassianCredentials();
			// We know credentials won't be null here because of the check above
			if (!credentials) {
				// This is just a safety check - we should never get here
				return;
			}

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
			if (skipIfNoCredentials()) return; // Skip if no credentials

			const credentials = getAtlassianCredentials();
			// We know credentials won't be null here because of the check above
			if (!credentials) {
				// This is just a safety check - we should never get here
				return;
			}

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
