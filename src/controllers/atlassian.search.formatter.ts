import { SearchResult } from '../services/vendor.atlassian.search.types.js';
import {
	formatHeading,
	formatBulletList,
	formatNumberedList,
} from '../utils/formatter.util.js';

/**
 * Format search results for display
 * @param searchData - Raw search results from the API
 * @returns Formatted string with search results in markdown format
 */
export function formatSearchResults(searchData: SearchResult[]): string {
	if (searchData.length === 0) {
		return 'No Confluence content found matching your query.';
	}

	const lines: string[] = [formatHeading('Confluence Search Results', 1), ''];

	// Use the numbered list formatter for consistent formatting
	const formattedList = formatNumberedList(searchData, (result) => {
		const itemLines: string[] = [];
		const entityType =
			result.entityType || result.content?.type || 'unknown';
		const content = result.content;

		// Determine title, ID, and status based on entity type
		let title = 'Untitled Result';
		let id = 'N/A';
		let status = 'N/A';
		let spaceTitle = result.resultGlobalContainer?.title || 'N/A';

		if (entityType === 'page' || entityType === 'blogpost') {
			title = content?.title || title;
			id = content?.id || id;
			status = content?.status || status;
			// Space title comes from resultGlobalContainer for content types too
		} else if (entityType === 'space') {
			title = result.title || spaceTitle || title; // Use result.title for space name
			id = result.space?.id || 'N/A'; // Use the top-level space object if present
			status = result.space?.status || 'N/A';
			spaceTitle = title; // The space IS the result
		} else if (entityType === 'attachment') {
			title = result.title || title;
			id = content?.id || 'N/A'; // Attachment ID is usually in content
			status = content?.status || status;
		} else if (entityType === 'folder') {
			title = result.title || title;
			id = content?.id || 'N/A';
			status = content?.status || status;
		} else if (entityType === 'comment') {
			title = 'Comment'; // Comments don't have a title
			id = content?.id || 'N/A';
			status = content?.status || status;
		}

		itemLines.push(formatHeading(title, 2));

		// Create an object with common properties
		const properties: Record<string, unknown> = {
			ID: id,
			Type: entityType,
			Status: status,
			Space: spaceTitle,
			URL: result.url
				? {
						url: result.url,
						title: 'View in Confluence',
					}
				: undefined,
			Excerpt: result.excerpt
				? result.excerpt.replace(/\\n/g, ' ')
				: undefined,
			Modified: result.lastModified,
		};

		// Format as a bullet list with proper formatting for each value type
		itemLines.push(formatBulletList(properties, (key) => key));

		return itemLines.join('\\n');
	});

	lines.push(formattedList);

	return lines.join('\\n');
}
