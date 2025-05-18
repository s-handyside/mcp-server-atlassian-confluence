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
import { DEFAULT_PAGE_SIZE, PAGE_DEFAULTS } from '../utils/defaults.util.js';
import { adfToMarkdown } from '../utils/adf.util.js';
import {
	CommentData,
	InlineProperties,
} from '../services/vendor.atlassian.comments.types.js';
import { formatPagination } from '../utils/formatter.util.js';

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
 * Extended interface for a comment with converted markdown content
 */
interface CommentWithContext extends CommentData {
	/**
	 * Converted markdown body
	 */
	convertedMarkdownBody: string;

	/**
	 * Highlighted text that the comment refers to (for inline comments)
	 */
	highlightedText?: string;
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
			bodyFormat = PAGE_DEFAULTS.BODY_FORMAT as
				| 'storage'
				| 'view'
				| 'atlas_doc_format', // Cast to expected type
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

		// Convert ADF content to Markdown and extract highlighted text for inline comments
		const convertedComments: CommentWithContext[] =
			commentsData.results.map((comment) => {
				let markdownBody =
					'*Content format not supported or unavailable*';

				// Convert comment body from ADF to Markdown
				if (comment.body?.atlas_doc_format?.value) {
					try {
						markdownBody = adfToMarkdown(
							comment.body.atlas_doc_format.value,
						);
						methodLogger.debug(
							`Successfully converted ADF to Markdown for comment ${comment.id}`,
						);
					} catch (conversionError) {
						methodLogger.error(
							`ADF conversion failed for comment ${comment.id}`,
							conversionError,
						);
						// Keep default error message
					}
				} else {
					methodLogger.warn(
						`No ADF content available for comment ${comment.id}`,
					);
				}

				// Extract the highlighted text for inline comments
				let highlightedText: string | undefined = undefined;
				if (
					comment.extensions?.location === 'inline' &&
					comment.extensions.inlineProperties
				) {
					// Safely access inlineProperties fields with type checking
					const props = comment.extensions
						.inlineProperties as InlineProperties;

					// Try different properties that might contain the highlighted text
					// Some Confluence versions use different property names
					highlightedText =
						props.originalSelection || props.textContext;

					// If not found in standard properties, check for custom properties
					if (!highlightedText && 'selectionText' in props) {
						highlightedText = String(props.selectionText || '');
					}

					if (highlightedText) {
						methodLogger.debug(
							`Found highlighted text for comment ${comment.id}: ${highlightedText.substring(0, 50)}${highlightedText.length > 50 ? '...' : ''}`,
						);
					} else {
						methodLogger.warn(
							`No highlighted text found for inline comment ${comment.id}`,
						);
					}
				}

				// Return comment with added context
				return {
					...comment,
					convertedMarkdownBody: markdownBody,
					highlightedText,
				};
			});

		// Format the comments for display
		const baseUrl = commentsData._links?.base || '';
		const formattedContent = formatCommentsList(
			convertedComments,
			pageId,
			baseUrl,
		);

		// Create the final content with pagination information included
		let finalContent = formattedContent;

		// Add pagination information if available
		if (
			pagination &&
			(pagination.hasMore || pagination.count !== undefined)
		) {
			const paginationString = formatPagination(pagination);
			finalContent += '\n\n' + paginationString;
		}

		return {
			content: finalContent,
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
