/**
 * Standardized formatting utilities for consistent output across all CLI and Tool interfaces.
 * These functions should be used by all formatters to ensure consistent formatting.
 */

/**
 * Format a date in a standardized way: YYYY-MM-DD HH:MM:SS UTC
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string
 */
export function formatDate(dateString?: string | Date): string {
	if (!dateString) {
		return 'Not available';
	}

	try {
		const date =
			typeof dateString === 'string' ? new Date(dateString) : dateString;

		// Format: YYYY-MM-DD HH:MM:SS UTC
		return date
			.toISOString()
			.replace('T', ' ')
			.replace(/\.\d+Z$/, ' UTC');
	} catch {
		return 'Invalid date';
	}
}

/**
 * Format a heading with the specified level (markdown)
 * @param text - The heading text
 * @param level - The heading level (1-6, defaults to 1)
 * @returns Formatted heading
 */
export function formatHeading(text: string, level: number = 1): string {
	const hashes = '#'.repeat(Math.max(1, Math.min(6, level)));
	return `${hashes} ${text}`;
}

/**
 * Format pagination information
 * @param count - The number of items in the current page
 * @param hasMore - Whether there are more items to fetch
 * @param nextCursor - The cursor for the next page (if available)
 * @returns Formatted pagination details
 */
export function formatPagination(
	count: number,
	hasMore: boolean,
	nextCursor?: string,
): string {
	const lines: string[] = [];

	// Append the count information
	lines.push(`**Results:** ${count} items`);

	// Append pagination information if available
	if (hasMore) {
		lines.push(
			'**More results available:** Use the pagination cursor to fetch the next page.',
		);
		if (nextCursor) {
			lines.push(`**Next cursor:** \`${nextCursor}\``);
		}
	} else {
		lines.push('**No more results available.**');
	}

	return lines.join('\n');
}

/**
 * Format a URL as a markdown link
 * @param url - The URL to format
 * @param title - Optional title for the link
 * @returns Formatted URL as a markdown link
 */
export function formatUrl(url: string, title?: string): string {
	return `[${title || url}](${url})`;
}

/**
 * Format a separator line
 * @returns Formatted separator line
 */
export function formatSeparator(): string {
	return '---';
}

/**
 * Format a bullet list from an object
 * @param items - The object to format as a bullet list
 * @param formatter - Optional function to format keys
 * @returns Formatted bullet list
 */
export function formatBulletList(
	items: Record<string, unknown>,
	formatter: (key: string) => string = (key) => key,
): string {
	const lines: string[] = [];

	for (const [key, value] of Object.entries(items)) {
		if (value === undefined || value === null) {
			continue;
		}

		const formattedKey = formatter(key);

		if (typeof value === 'object' && value !== null && 'url' in value) {
			const urlObj = value as { url: string; title?: string };
			// Handle URL objects with title
			const urlTitle = urlObj.title || urlObj.url;
			lines.push(
				`- **${formattedKey}**: ${formatUrl(String(urlObj.url), String(urlTitle))}`,
			);
		} else if (
			typeof value === 'string' &&
			(value.startsWith('http://') || value.startsWith('https://'))
		) {
			// Handle URL strings
			lines.push(`- **${formattedKey}**: ${formatUrl(value)}`);
		} else if (value instanceof Date) {
			// Handle dates
			lines.push(`- **${formattedKey}**: ${formatDate(value)}`);
		} else if (Array.isArray(value)) {
			// Handle arrays
			lines.push(`- **${formattedKey}**: ${value.join(', ')}`);
		} else {
			// Handle all other types
			lines.push(`- **${formattedKey}**: ${String(value)}`);
		}
	}

	return lines.join('\n');
}

/**
 * Format a numbered list from an array
 * @param items - The array of items to format
 * @param formatter - Function to format each item
 * @returns Formatted numbered list
 */
export function formatNumberedList<T>(
	items: T[],
	formatter: (item: T, index: number) => string,
): string {
	return items
		.map((item, index) => {
			const formattedItem = formatter(item, index);
			return `${index + 1}. ${formattedItem}`;
		})
		.join('\n\n');
}

export default {
	formatDate,
	formatHeading,
	formatPagination,
	formatUrl,
	formatSeparator,
	formatBulletList,
	formatNumberedList,
};
