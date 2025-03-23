import { SearchResult } from '../services/vendor.atlassian.search.types.js';

/**
 * Format search results for display
 * @param searchData - Raw search results from the API
 * @param nextCursor - Pagination cursor for retrieving the next set of results
 * @returns Formatted string with search results in markdown format
 */
export function formatSearchResults(
	searchData: SearchResult[],
	nextCursor?: string,
): string {
	if (searchData.length === 0) {
		return 'No Confluence content found matching your query.';
	}

	const lines: string[] = ['# Confluence Search Results'];

	searchData.forEach((result, index) => {
		const content = result.content;
		lines.push(`\n## ${index + 1}. ${content.title}`);
		lines.push(`- **ID**: ${content.id}`);
		lines.push(`- **Type**: ${content.type}`);
		lines.push(`- **Status**: ${content.status}`);

		// Handle space information safely
		if (result.resultGlobalContainer) {
			lines.push(`- **Space**: ${result.resultGlobalContainer.title}`);
		}

		// Check if URL is available in the result
		if (result.url) {
			lines.push(`- **URL**: [View in Confluence](${result.url})`);
		}

		// Add excerpt if available in a more compact format
		if (result.excerpt) {
			lines.push(
				`- **Excerpt**: \`${result.excerpt.replace(/\n/g, ' ')}\``,
			);
		}
	});

	// Pagination information
	if (nextCursor) {
		lines.push('\n---');
		lines.push('## Pagination');
		lines.push(
			'*More results available. Use the following cursor to retrieve the next page:*',
		);
		lines.push('');
		lines.push(`\`${nextCursor}\``);
		lines.push('');
		lines.push(
			'*For CLI: Use `--cursor "' +
				nextCursor +
				'"` to get the next page*',
		);
		lines.push(
			'*For MCP tools: Set the `cursor` parameter to retrieve the next page*',
		);
	}

	return lines.join('\n');
}

/**
 * Process CQL query to handle reserved keywords
 * @param cql - Original CQL query
 * @returns Processed CQL query with reserved keywords properly quoted
 */
export function processCqlQuery(cql: string): string {
	// List of CQL reserved keywords that might be used as space keys
	const reservedKeywords = [
		'AND',
		'OR',
		'NOT',
		'IN',
		'LIKE',
		'IS',
		'NULL',
		'EMPTY',
		'ORDER',
		'BY',
		'ASC',
		'DESC',
	];

	// Check for space=KEYWORD pattern and quote the keyword if it's reserved
	return cql.replace(/space\s*=\s*(\w+)(?!\s*")/g, (match, spaceKey) => {
		if (reservedKeywords.includes(spaceKey.toUpperCase())) {
			return `space="${spaceKey}"`;
		}
		return match;
	});
}
