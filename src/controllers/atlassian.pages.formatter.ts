import {
	PageSchemaType,
	PageDetailedSchemaType,
} from '../services/vendor.atlassian.pages.types.js';
import { htmlToMarkdown } from '../utils/markdown.util.js';
import {
	formatUrl,
	formatDate,
	formatHeading,
	formatBulletList,
	formatSeparator,
	formatNumberedList,
} from '../utils/formatter.util.js';

/**
 * Format a list of pages for display
 * @param pagesData - Raw pages data from the API
 * @param baseUrl - Base URL for constructing page links
 * @returns Formatted string with pages information in markdown format
 */
export function formatPagesList(
	pagesData: PageSchemaType[],
	baseUrl: string = '',
): string {
	if (!pagesData || pagesData.length === 0) {
		return (
			'No Confluence pages found matching your criteria.' +
			'\n\n' +
			formatSeparator() +
			'\n' +
			`*Information retrieved at: ${formatDate(new Date())}*`
		);
	}

	const lines: string[] = [formatHeading('Confluence Pages', 1), ''];

	// Format each page with its details
	const formattedList = formatNumberedList(pagesData, (page, _index) => {
		const itemLines: string[] = [];

		// Basic information
		itemLines.push(formatHeading(page.title, 2));

		// Create an object with all the properties to display
		const pageUrl = `${baseUrl}/pages/viewpage.action?pageId=${page.id}`;

		const properties: Record<string, unknown> = {
			ID: page.id,
			Status: page.status,
			'Space ID': page.spaceId || 'N/A',
			Title: page.title,
			Created: page.createdAt ? formatDate(page.createdAt) : 'N/A',
			Author: page.authorId || 'Unknown',
			Version: page.version?.number || 'N/A',
			URL: formatUrl(pageUrl, page.title),
		};

		// Format as a bullet list
		itemLines.push(formatBulletList(properties, (key) => key));

		return itemLines.join('\n');
	});

	lines.push(formattedList);

	// Add standard footer with timestamp
	lines.push('\n\n' + formatSeparator());
	lines.push(`*Information retrieved at: ${formatDate(new Date())}*`);

	return lines.join('\n');
}

/**
 * Format detailed page information for display
 * @param pageData - Raw page details from the API
 * @returns Formatted string with page details in markdown format
 */
export function formatPageDetails(pageData: PageDetailedSchemaType): string {
	// Create URL
	const baseUrl = pageData._links.base || '';
	const pageUrl = pageData._links.webui || '';
	const fullUrl = pageUrl.startsWith('http')
		? pageUrl
		: `${baseUrl}${pageUrl}`;

	const lines: string[] = [
		formatHeading(`Confluence Page: ${pageData.title}`, 1),
		'',
		`> A ${pageData.status} page in space \`${pageData.spaceId}\` created on ${formatDate(pageData.createdAt)}.`,
		'',
		formatHeading('Basic Information', 2),
	];

	// Format basic information as a bullet list
	const basicProperties: Record<string, unknown> = {
		ID: pageData.id,
		Title: pageData.title,
		'Space ID': pageData.spaceId,
		Status: pageData.status,
		'Created At': formatDate(pageData.createdAt),
		'Author ID': pageData.authorId,
		'Parent ID': pageData.parentId || 'None',
	};

	lines.push(formatBulletList(basicProperties, (key) => key));

	// Content section
	lines.push('');
	lines.push(formatHeading('Content', 2));
	if (pageData.body?.view?.value) {
		// Convert HTML content to Markdown
		const markdownContent = htmlToMarkdown(pageData.body.view.value.trim());
		lines.push(markdownContent);
	} else {
		lines.push('*No content available*');
	}

	// Labels section
	lines.push('');
	lines.push(formatHeading('Labels', 2));

	if (pageData.labels?.results && pageData.labels.results.length > 0) {
		const labelLines: string[] = [];
		pageData.labels.results.forEach(
			(label: { id: string; name: string }) => {
				labelLines.push(`- **${label.name}** (ID: ${label.id})`);
			},
		);
		lines.push(labelLines.join('\n'));
	} else {
		lines.push('*No labels assigned to this page*');
	}

	// Links section
	lines.push('');
	lines.push(formatHeading('Links', 2));
	lines.push(`- **Web UI**: ${fullUrl}`);
	lines.push(`- ${formatUrl(fullUrl, 'Open in Confluence')}`);

	// Add standard footer with timestamp
	lines.push('\n\n' + formatSeparator());
	lines.push(`*Information retrieved at: ${formatDate(new Date())}*`);

	// Optionally keep the direct link
	if (fullUrl) {
		lines.push(`*View this page in Confluence: ${fullUrl}*`);
	}

	return lines.join('\n');
}
