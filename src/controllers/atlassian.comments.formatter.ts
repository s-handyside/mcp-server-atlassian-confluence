/**
 * Formatter for Confluence comments
 */

import { CommentData } from '../services/vendor.atlassian.comments.types.js';
import { adfToMarkdown } from '../utils/adf.util.js';
import { htmlToMarkdown } from '../utils/markdown.util.js';
import {
	formatDate,
	formatHeading,
	formatBulletList,
	formatSeparator,
	formatNumberedList,
} from '../utils/formatter.util.js';

/**
 * Format a list of comments for display
 *
 * @param commentsData - Raw comments data from the API
 * @param baseUrl - Base URL for constructing comment links
 * @returns Formatted string with comments information in markdown format
 */
export function formatCommentsList(
	commentsData: CommentData[],
	pageId: string,
	baseUrl: string = '',
): string {
	if (!commentsData || commentsData.length === 0) {
		return (
			'No comments found for this page.' +
			'\n\n' +
			formatSeparator() +
			'\n' +
			`*Information retrieved at: ${formatDate(new Date())}*`
		);
	}

	const lines: string[] = [formatHeading('Page Comments', 1), ''];

	// Format each comment with its details
	const formattedList = formatNumberedList(
		commentsData,
		(comment, _index) => {
			const itemLines: string[] = [];

			// Basic information
			const title = comment.title.replace(/^Re: /, '');
			itemLines.push(formatHeading(title, 3));

			// Comment metadata
			const properties: Record<string, unknown> = {
				ID: comment.id,
				Status: comment.status,
				Type:
					comment.extensions?.location === 'inline'
						? 'Inline Comment'
						: 'Page Comment',
				Created: comment._links?.self ? formatDate(new Date()) : 'N/A', // We don't have creation date in the response
			};

			// Format as a bullet list
			itemLines.push(formatBulletList(properties, (key) => key));

			// Comment content
			itemLines.push(formatHeading('Content', 4));

			let content = '';

			// First try ADF format if available
			if (comment.body?.atlas_doc_format?.value) {
				content = adfToMarkdown(comment.body.atlas_doc_format.value);
			}
			// Then try storage format (XML)
			else if (comment.body?.storage?.value) {
				// For storage format, we currently don't have a direct converter
				// Just strip HTML tags for now as a simple approach
				content = htmlToMarkdown(comment.body.storage.value);
			}
			// Finally try HTML view format
			else if (comment.body?.view?.value) {
				content = htmlToMarkdown(comment.body.view.value);
			}

			if (content) {
				itemLines.push(content);
			} else {
				itemLines.push('*No content available*');
			}

			// Add link to the comment if available
			if (comment._links?.webui) {
				const commentUrl = comment._links.webui.startsWith('http')
					? comment._links.webui
					: `${baseUrl}${comment._links.webui}`;

				itemLines.push('');
				itemLines.push(`[View comment in Confluence](${commentUrl})`);
			}

			return itemLines.join('\n');
		},
	);

	lines.push(formattedList);

	// Add standard footer with timestamp
	lines.push('\n\n' + formatSeparator());
	lines.push(`*Information retrieved at: ${formatDate(new Date())}*`);

	// Add link to the page
	if (baseUrl && pageId) {
		const pageUrl = `${baseUrl}/pages/viewpage.action?pageId=${pageId}`;
		lines.push(`*View all comments on [this page](${pageUrl})*`);
	}

	return lines.join('\n');
}
