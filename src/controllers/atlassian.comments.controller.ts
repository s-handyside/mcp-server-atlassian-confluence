/**
 * Controller for Confluence comments
 */

import { Logger } from '../utils/logger.util.js';
import { handleControllerError } from '../utils/error-handler.util.js';
import { atlassianCommentsService } from '../services/vendor.atlassian.comments.service.js';
import {
	extractPaginationInfo,
	PaginationType,
} from '../utils/pagination.util.js';
import { ControllerResponse } from '../types/common.types.js';
import { formatCommentsList } from './atlassian.comments.formatter.js';
import { DEFAULT_PAGE_SIZE } from '../utils/defaults.util.js';

// Create logger for this controller
const logger = Logger.forContext(
	'controllers/atlassian.comments.controller.ts',
);

/**
 * Interface for list comments options
 */
interface ListPageCommentsOptions {
	/**
	 * The ID of the page to get comments for
	 */
	pageId: string;

	/**
	 * Maximum number of results to return
	 */
	limit?: number;

	/**
	 * Starting point for pagination
	 */
	start?: number;

	/**
	 * Body format (storage, view, atlas_doc_format)
	 */
	bodyFormat?: 'storage' | 'view' | 'atlas_doc_format';
}

/**
 * List comments for a specific Confluence page
 *
 * @param options - Options for listing comments
 * @returns Controller response with formatted comments and pagination info
 */
async function listPageComments(
	options: ListPageCommentsOptions,
): Promise<ControllerResponse> {
	const methodLogger = logger.forMethod('listPageComments');
	try {
		// Apply defaults and prepare service parameters
		const {
			pageId,
			limit = DEFAULT_PAGE_SIZE,
			start = 0,
			bodyFormat,
		} = options;

		methodLogger.debug('Listing page comments', {
			pageId,
			limit,
			start,
			bodyFormat,
		});

		// Call the service to get comments data
		const commentsData = await atlassianCommentsService.listPageComments({
			pageId,
			limit,
			start,
			bodyFormat,
		});

		// Extract pagination information
		const pagination = extractPaginationInfo(
			commentsData,
			PaginationType.OFFSET,
			'Comment',
		);

		// Format the comments for display
		const baseUrl = commentsData._links?.base || '';
		const formattedContent = formatCommentsList(
			commentsData.results,
			pageId,
			baseUrl,
		);

		return {
			content: formattedContent,
			pagination,
		};
	} catch (error) {
		// Handle errors
		throw handleControllerError(error, {
			entityType: 'Comment',
			operation: 'list',
			source: 'controllers/atlassian.comments.controller.ts@listPageComments',
			additionalInfo: { pageId: options.pageId },
		});
	}
}

// Export controller functions
export const atlassianCommentsController = {
	listPageComments,
};
