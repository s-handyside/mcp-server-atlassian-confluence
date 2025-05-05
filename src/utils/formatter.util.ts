/**
 * Standardized formatting utilities for consistent output across all CLI and Tool interfaces.
 * These functions should be used by all formatters to ensure consistent formatting.
 */

import { Logger } from './logger.util.js';
import { ResponsePagination } from '../types/common.types.js';

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
 * Format pagination information in a standardized way for CLI output.
 * Includes separator, item counts, availability message, next page instructions, and timestamp.
 * @param pagination - The ResponsePagination object containing pagination details.
 * @returns Formatted pagination footer string for CLI.
 */
export function formatPagination(pagination: ResponsePagination): string {
	const methodLogger = Logger.forContext(
		'utils/formatter.util.ts',
		'formatPagination',
	);
	const parts: string[] = [formatSeparator()]; // Start with separator

	const { count = 0, hasMore, nextCursor, total } = pagination;

	// Showing count and potentially total
	if (total !== undefined && total >= 0) {
		parts.push(`*Showing ${count} of ${total} total items.*`);
	} else if (count >= 0) {
		parts.push(`*Showing ${count} item${count !== 1 ? 's' : ''}.*`);
	}

	// More results availability
	if (hasMore) {
		parts.push('More results are available.');
	}

	// Prompt for the next action (using cursor string for Confluence)
	if (hasMore && nextCursor) {
		parts.push(`*Use --cursor "${nextCursor}" to view more.*`);
	}

	// Add standard timestamp
	parts.push(`*Information retrieved at: ${formatDate(new Date())}*`);

	const result = parts.join('\n').trim(); // Join with newline
	methodLogger.debug(`Formatted pagination footer: ${result}`);
	return result;
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

/**
 * Format text as a Markdown code block
 * @param text Text content
 * @param language Optional language identifier
 * @returns Formatted code block string
 */
// Unused function - commented out
// export function formatCodeBlock(text: string, language: string = ''): string {
// 	// Trim trailing newline if present to avoid extra line in block
// 	const trimmedText = text.replace(/$\n/, '');
// 	return `\`\`\`${language}\n${trimmedText}\n\`\`\``;
// }
