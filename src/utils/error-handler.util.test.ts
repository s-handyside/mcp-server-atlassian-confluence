import { describe, expect, test } from '@jest/globals';
import {
	ErrorCode,
	buildErrorContext,
	detectErrorType,
	createUserFriendlyErrorMessage,
	handleControllerError,
} from './error-handler.util.js';
import { createApiError, McpError, ErrorType } from './error.util.js';

describe('Error Handler Utilities', () => {
	describe('buildErrorContext function', () => {
		test('builds a complete error context object', () => {
			const context = buildErrorContext(
				'Space',
				'retrieving',
				'controllers/spaces.controller.ts@get',
				'DEV',
				{ query: 'name~"Development"' },
			);

			expect(context).toEqual({
				entityType: 'Space',
				operation: 'retrieving',
				source: 'controllers/spaces.controller.ts@get',
				entityId: 'DEV',
				additionalInfo: { query: 'name~"Development"' },
			});
		});

		test('handles minimal required parameters', () => {
			const context = buildErrorContext(
				'Content',
				'listing',
				'controllers/pages.controller.ts@list',
			);

			expect(context).toEqual({
				entityType: 'Content',
				operation: 'listing',
				source: 'controllers/pages.controller.ts@list',
			});
			expect(context.entityId).toBeUndefined();
			expect(context.additionalInfo).toBeUndefined();
		});
	});

	describe('detectErrorType function', () => {
		describe('Confluence-specific errors', () => {
			test('detects Confluence title/detail structure errors', () => {
				const confluenceError = {
					title: 'Not Found',
					detail: 'The requested space does not exist',
					status: 404,
				};
				const error = createApiError('API error', 404, confluenceError);

				const result = detectErrorType(error);
				expect(result).toEqual({
					code: ErrorCode.NOT_FOUND,
					statusCode: 404,
				});
			});

			test('detects Confluence errors array format', () => {
				const confluenceError = {
					errors: [
						{
							message: 'Invalid CQL syntax',
							extensions: {
								errorType: 'search',
							},
						},
					],
				};
				const error = createApiError('API error', 400, confluenceError);

				const result = detectErrorType(error);
				expect(result).toEqual({
					code: ErrorCode.CONFLUENCE_CQL_ERROR,
					statusCode: 400,
				});
			});

			test('detects content errors', () => {
				const confluenceError = {
					errors: [
						{
							message: 'Content is in trash',
							extensions: {
								errorType: 'content',
							},
						},
					],
				};
				const error = createApiError('API error', 400, confluenceError);

				const result = detectErrorType(error);
				expect(result).toEqual({
					code: ErrorCode.CONFLUENCE_CONTENT_ERROR,
					statusCode: 400,
				});
			});

			test('detects permission errors', () => {
				const confluenceError = {
					errors: [
						{
							message:
								'You do not have permission to view this content',
						},
					],
				};
				const error = createApiError('API error', 403, confluenceError);

				const result = detectErrorType(error);
				expect(result).toEqual({
					code: ErrorCode.ACCESS_DENIED,
					statusCode: 403,
				});
			});
		});

		describe('Generic error detection', () => {
			test('detects network errors', () => {
				const error = new Error('network error: connection refused');
				const result = detectErrorType(error);
				expect(result).toEqual({
					code: ErrorCode.NETWORK_ERROR,
					statusCode: 500,
				});
			});

			test('detects rate limit errors', () => {
				const error = new Error('too many requests');
				const result = detectErrorType(error);
				expect(result).toEqual({
					code: ErrorCode.RATE_LIMIT_ERROR,
					statusCode: 429,
				});
			});

			test('detects not found errors', () => {
				const error = new Error('resource not found');
				const result = detectErrorType(error);
				expect(result).toEqual({
					code: ErrorCode.NOT_FOUND,
					statusCode: 404,
				});
			});

			test('uses status code when available', () => {
				const error = createApiError('some error', 403);
				const result = detectErrorType(error);
				expect(result).toEqual({
					code: ErrorCode.ACCESS_DENIED,
					statusCode: 403,
				});
			});

			test('defaults to unexpected error', () => {
				const error = new Error('something unexpected happened');
				const result = detectErrorType(error);
				expect(result).toEqual({
					code: ErrorCode.UNEXPECTED_ERROR,
					statusCode: 500,
				});
			});
		});
	});

	describe('createUserFriendlyErrorMessage function', () => {
		test('creates space not found message', () => {
			const message = createUserFriendlyErrorMessage(
				ErrorCode.NOT_FOUND,
				{
					entityType: 'Space',
					entityId: 'DEV',
					operation: 'retrieving',
				},
			);
			expect(message).toContain('Space DEV not found');
			expect(message).toContain('space key is correct');
		});

		test('creates page not found message', () => {
			const message = createUserFriendlyErrorMessage(
				ErrorCode.NOT_FOUND,
				{
					entityType: 'Page',
					entityId: '12345',
					operation: 'retrieving',
				},
			);
			expect(message).toContain('Page 12345 not found');
			expect(message).toContain('content ID is valid');
		});

		test('creates access denied message', () => {
			const message = createUserFriendlyErrorMessage(
				ErrorCode.ACCESS_DENIED,
				{
					entityType: 'Space',
					entityId: 'PRIVATE',
				},
			);
			expect(message).toContain(
				'Access denied for space private PRIVATE',
			);
			expect(message).toContain(
				'Atlassian API token has sufficient privileges',
			);
		});

		test('creates CQL error message', () => {
			const message = createUserFriendlyErrorMessage(
				ErrorCode.CONFLUENCE_CQL_ERROR,
				{},
				'Invalid syntax at line 1',
			);
			expect(message).toContain('Invalid CQL syntax in search query');
			expect(message).toContain(
				'Error details: Invalid syntax at line 1',
			);
		});

		test('creates validation error message', () => {
			const originalMessage = 'Invalid space key format';
			const message = createUserFriendlyErrorMessage(
				ErrorCode.VALIDATION_ERROR,
				{
					entityType: 'Space',
					operation: 'creating',
				},
				originalMessage,
			);
			expect(message).toContain(originalMessage);
		});
	});

	describe('handleControllerError function', () => {
		test('handles NOT_FOUND errors with createNotFoundError', () => {
			const originalError = new Error('Space not found');
			const context = buildErrorContext(
				'Space',
				'retrieving',
				'controllers/spaces.controller.ts@get',
				'DEV',
			);

			expect(() => handleControllerError(originalError, context)).toThrow(
				McpError,
			);

			try {
				handleControllerError(originalError, context);
			} catch (error) {
				expect(error).toBeInstanceOf(McpError);
				expect((error as McpError).type).toBe(ErrorType.NOT_FOUND);
				expect((error as McpError).statusCode).toBe(404);
				expect((error as McpError).message).toContain(
					'Space DEV not found',
				);
				expect((error as McpError).originalError).toBe(originalError);
			}
		});

		test('handles other errors with createApiError', () => {
			const originalError = new Error('Permission denied');
			const context = buildErrorContext(
				'Space',
				'updating',
				'controllers/spaces.controller.ts@update',
				'DEV',
			);

			try {
				handleControllerError(originalError, context);
			} catch (error) {
				expect(error).toBeInstanceOf(McpError);
				expect((error as McpError).type).toBe(ErrorType.API_ERROR);
				expect((error as McpError).statusCode).toBeDefined();
				expect((error as McpError).message).toContain(
					'Error details: Permission denied',
				);
				expect((error as McpError).originalError).toBe(originalError);
			}
		});
	});
});
