import atlassianSpacesController from './atlassian.spaces.controller.js';
import { getAtlassianCredentials } from '../utils/transport.util.js';
import { config } from '../utils/config.util.js';
import { McpError } from '../utils/error.util.js';

describe('Atlassian Spaces Controller', () => {
	// Load configuration and check for credentials before all tests
	beforeAll(() => {
		config.load(); // Ensure config is loaded
		const credentials = getAtlassianCredentials();
		if (!credentials) {
			console.warn(
				'Skipping Atlassian Spaces Controller tests: No credentials available',
			);
		}
	});

	// Helper function to skip tests when credentials are missing
	const skipIfNoCredentials = () => !getAtlassianCredentials();

	describe('list', () => {
		it('should return a formatted list of spaces in Markdown', async () => {
			if (skipIfNoCredentials()) return;

			const result = await atlassianSpacesController.list();

			// Verify the ControllerResponse structure
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');
			expect(result).toHaveProperty('pagination');

			// Basic Markdown content checks
			if (
				result.content !==
				'No Confluence spaces found matching your criteria.'
			) {
				expect(result.content).toMatch(/^# Confluence Spaces/m); // Main heading for spaces list
				// The actual format is now a numbered list rather than a table
				expect(result.content).toContain('**ID**:');
				expect(result.content).toContain('**Key**:');
				expect(result.content).toContain('**Type**:');
			}

			// Verify pagination structure
			expect(result.pagination).toBeDefined();
			expect(result.pagination).toHaveProperty('hasMore');
			expect(typeof result.pagination?.hasMore).toBe('boolean');
			expect(result.pagination).toHaveProperty('count'); // Should have count from service
			// nextCursor might be undefined if hasMore is false
			if (result.pagination?.hasMore) {
				expect(result.pagination).toHaveProperty('nextCursor');
				expect(typeof result.pagination?.nextCursor).toBe('string');
			}
		}, 30000); // Increased timeout

		it('should handle pagination options (limit/cursor)', async () => {
			if (skipIfNoCredentials()) return;

			// Fetch first page
			const result1 = await atlassianSpacesController.list({ limit: 1 });
			expect(result1.pagination?.count).toBeLessThanOrEqual(1);

			// If there's a next page, fetch it
			if (result1.pagination?.hasMore && result1.pagination.nextCursor) {
				const result2 = await atlassianSpacesController.list({
					limit: 1,
					cursor: result1.pagination.nextCursor, // Use cursor from previous response
				});
				expect(result2.pagination?.count).toBeLessThanOrEqual(1);
				// Check if content is different (simple check)
				if (
					result1.content !==
						'No Confluence spaces found matching your criteria.' &&
					result2.content !==
						'No Confluence spaces found matching your criteria.'
				) {
					expect(result1.content).not.toEqual(result2.content);
				}
			} else {
				console.warn(
					'Skipping controller cursor step: Only one page of spaces found.',
				);
			}
		}, 30000);

		it('should handle filtering options (type/status/query)', async () => {
			if (skipIfNoCredentials()) return;

			// Test filtering by type
			const resultType = await atlassianSpacesController.list({
				type: 'global',
				limit: 5,
			});
			expect(resultType.pagination?.count).toBeLessThanOrEqual(5);
			// Could add check that all returned spaces have type 'global' if parsing Markdown

			// Test filtering by status
			const resultStatus = await atlassianSpacesController.list({
				status: 'current',
				limit: 5,
			});
			expect(resultStatus.pagination?.count).toBeLessThanOrEqual(5);
			// Could add check that all returned spaces have status 'current'

			// Test filtering by query (use a common term)
			const resultQuery = await atlassianSpacesController.list({
				query: 'a',
				limit: 5,
			});
			expect(resultQuery.pagination?.count).toBeLessThanOrEqual(5);
			// Result content should contain 'a' if matches found
		}, 30000);
	});

	describe('get', () => {
		// Helper to get a valid key for testing 'get'
		async function getFirstSpaceKeyForController(): Promise<string | null> {
			if (skipIfNoCredentials()) return null;
			try {
				const listResult = await atlassianSpacesController.list({
					limit: 1,
				});
				if (
					listResult.content ===
					'No Confluence spaces found matching your criteria.'
				)
					return null;
				// Extract key from Markdown content - find the Key pattern in the content
				const keyMatch = listResult.content.match(
					/\*\*Key\*\*:\s+([A-Z0-9_~]+)/,
				);
				return keyMatch ? keyMatch[1] : null;
			} catch (error) {
				console.warn(
					"Could not fetch space list for controller 'get' test setup:",
					error,
				);
				return null;
			}
		}

		it('should return formatted details for a valid space key in Markdown', async () => {
			const spaceKey = await getFirstSpaceKeyForController();
			if (!spaceKey) {
				console.warn(
					'Skipping controller get test: No space key found.',
				);
				return;
			}

			const result = await atlassianSpacesController.get({ spaceKey });

			// Verify the ControllerResponse structure
			expect(result).toHaveProperty('content');
			expect(typeof result.content).toBe('string');
			expect(result).not.toHaveProperty('pagination'); // 'get' shouldn't have pagination

			// Verify Markdown content
			expect(result.content).toMatch(/^# Confluence Space:/m); // Main heading for space details
			expect(result.content).toContain(`**Key**: ${spaceKey}`);
			expect(result.content).toContain('## Basic Information');
			expect(result.content).toContain('## Homepage Content'); // Should attempt to fetch
			expect(result.content).toContain('## Labels'); // Included by default now
			expect(result.content).toContain('## Links');
		}, 30000);

		it('should throw McpError for an invalid space key', async () => {
			if (skipIfNoCredentials()) return;

			const invalidKey = 'THISSPACEDOESNOTEXIST123';

			// Expect the controller call to reject with an McpError
			await expect(
				atlassianSpacesController.get({ spaceKey: invalidKey }),
			).rejects.toThrow(McpError);

			// Optionally check the status code and message via the error handler's behavior
			try {
				await atlassianSpacesController.get({ spaceKey: invalidKey });
			} catch (e) {
				expect(e).toBeInstanceOf(McpError);
				expect((e as McpError).statusCode).toBe(404); // Expecting Not Found from the initial list call
				expect((e as McpError).message).toContain('not found');
			}
		}, 30000);
	});
});
