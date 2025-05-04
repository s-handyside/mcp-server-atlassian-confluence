import { SearchResultType } from '../services/vendor.atlassian.search.types.js';
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
export function formatSearchResults(searchData: SearchResultType[]): string {
	if (searchData.length === 0) {
		return 'No Confluence content found matching your query.';
	}

	const lines: string[] = [formatHeading('Confluence Search Results', 1), ''];

	// Use the numbered list formatter for consistent formatting
	const formattedList = formatNumberedList(searchData, (result) => {
		const itemLines: string[] = [];

		// Extract data from the new structure
		const content = result.content;
		const space = result.space;

		// Determine title, ID, and status
		const title = content.title || 'Untitled Result';
		const id = content.id || 'N/A';
		const status = content.status || 'N/A';
		const spaceTitle = space.name || 'N/A';

		itemLines.push(formatHeading(title, 2));

		// Create an object with properties
		const properties: Record<string, unknown> = {
			ID: id,
			Type: content.type,
			Status: status,
			Space: spaceTitle,
			'Space ID': space.id,
			URL: content._links.webui
				? {
						url: content._links.webui,
						title: 'View in Confluence',
					}
				: undefined,
			Excerpt: content.excerpt ? content.excerpt.content : undefined,
			Modified: content.lastModified,
		};

		// Format as a bullet list with proper formatting for each value type
		itemLines.push(formatBulletList(properties, (key) => key));

		return itemLines.join('\n');
	});

	lines.push(formattedList);

	return lines.join('\n');
}
