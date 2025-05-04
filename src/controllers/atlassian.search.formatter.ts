import { SearchResultType } from '../services/vendor.atlassian.search.types.js';
import {
	formatHeading,
	formatBulletList,
	formatNumberedList,
	formatSeparator,
	formatDate,
} from '../utils/formatter.util.js';

/**
 * Format search results for display
 * @param searchData - Raw search results from the API
 * @returns Formatted string with search results in markdown format
 */
export function formatSearchResults(searchData: SearchResultType[]): string {
	if (searchData.length === 0) {
		return (
			'No Confluence content found matching your query.' +
			'\n\n' +
			formatSeparator() +
			'\n' +
			`*Information retrieved at: ${formatDate(new Date())}*`
		);
	}

	const lines: string[] = [formatHeading('Confluence Search Results', 1), ''];

	// Use the numbered list formatter for consistent formatting
	const formattedList = formatNumberedList(searchData, (result) => {
		const itemLines: string[] = [];

		// Handle both v1 and v2 API result formats
		// For v1 API, result.title is directly available
		// For v2 API, title is in content object

		// Get title from either direct property or content object
		const title =
			result.title || result.content?.title || 'Untitled Result';

		// Create an object with properties, handling optional fields
		const properties: Record<string, unknown> = {
			// Use optional chaining and fallbacks for all fields
			ID: result.content?.id || result.id || 'N/A',
			Type: result.content?.type || result.entityType || 'N/A',
			Status: result.content?.status || 'N/A',
			Space:
				result.space?.name ||
				result.resultGlobalContainer?.title ||
				'N/A',
		};

		// Add Space ID only if available
		if (result.space?.id) {
			properties['Space ID'] = result.space.id;
		}

		// Add URL with proper handling of optional fields
		const url =
			result.url ||
			result.content?._links?.webui ||
			result.resultGlobalContainer?.displayUrl;

		if (url) {
			properties['URL'] = {
				url: url,
				title: 'View in Confluence',
			};
		}

		// Add excerpt if available, with proper handling of both API formats
		const excerpt = result.excerpt || result.content?.excerpt?.content;

		if (excerpt) {
			properties['Excerpt'] = excerpt;
		}

		// Add modification date if available
		const modified =
			result.lastModified ||
			result.content?.lastModified ||
			result.friendlyLastModified;

		if (modified) {
			// Attempt to format date, fallback to original string
			try {
				properties['Modified'] = formatDate(new Date(modified));
			} catch {
				properties['Modified'] = modified; // Fallback if parsing fails
			}
		}

		// Create the formatted output
		itemLines.push(formatHeading(title, 2));
		itemLines.push(formatBulletList(properties, (key) => key));

		return itemLines.join('\n');
	});

	lines.push(formattedList);

	// Add standard footer with timestamp
	lines.push('\n\n' + formatSeparator());
	lines.push(`*Information retrieved at: ${formatDate(new Date())}*`);

	return lines.join('\n');
}
