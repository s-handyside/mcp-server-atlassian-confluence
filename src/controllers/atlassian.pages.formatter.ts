import {
	Page,
	PageDetailed,
} from '../services/vendor.atlassian.pages.types.js';
import { Label } from '../services/vendor.atlassian.types.js';
import { htmlToMarkdown } from '../utils/markdown.util.js';

/**
 * Format a list of pages for display
 * @param pagesData - Raw pages data from the API
 * @param nextCursor - Pagination cursor for retrieving the next set of results
 * @returns Formatted string with pages information in markdown format
 */
export function formatPagesList(
	pagesData: Page[],
	nextCursor?: string,
): string {
	if (pagesData.length === 0) {
		return 'No Confluence pages found.';
	}

	const lines: string[] = ['# Confluence Pages'];

	pagesData.forEach((page, index) => {
		lines.push(`\n## ${index + 1}. ${page.title}`);
		lines.push(`- **ID**: ${page.id}`);
		lines.push(`- **Title**: ${page.title}`);
		lines.push(`- **Space ID**: ${page.spaceId}`);
		lines.push(`- **Status**: ${page.status}`);
		lines.push(
			`- **Created**: ${new Date(page.createdAt).toLocaleString()}`,
		);
		lines.push(`- **Author ID**: ${page.authorId}`);
		if (page.body?.view?.value) {
			lines.push(
				`- **Content Preview**: ${htmlToMarkdown(page.body.view.value).substring(0, 100)}...`,
			);
		}
		lines.push(`- **URL**: [${page.title}](${page._links.webui})`);
		if (page.parentId) {
			lines.push(`- **Parent ID**: ${page.parentId}`);
		}
	});

	// Pagination information
	if (nextCursor) {
		lines.push('\n---');
		lines.push('## Pagination');
		lines.push(
			'*More pages available. Use the following cursor to retrieve the next page:*',
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
 * Format detailed page information for display
 * @param pageData - Raw page details from the API
 * @returns Formatted string with page details in markdown format
 */
export function formatPageDetails(pageData: PageDetailed): string {
	// Format creation date
	const createdDate = new Date(pageData.createdAt).toLocaleString();

	// Create URL
	const baseUrl = pageData._links.base || '';
	const pageUrl = pageData._links.webui || '';
	const fullUrl = pageUrl.startsWith('http')
		? pageUrl
		: `${baseUrl}${pageUrl}`;

	const lines: string[] = [];

	// Title and summary
	lines.push(`# Confluence Page: ${pageData.title}`);
	lines.push('');
	lines.push(
		`> A ${pageData.status} page in space \`${pageData.spaceId}\` created on ${createdDate}.`,
	);
	lines.push('');

	// Basic information
	lines.push('## Basic Information');
	lines.push(`- **ID**: ${pageData.id}`);
	lines.push(`- **Title**: ${pageData.title}`);
	lines.push(`- **Space ID**: ${pageData.spaceId}`);
	lines.push(`- **Status**: ${pageData.status}`);
	lines.push(`- **Created At**: ${createdDate}`);
	lines.push(`- **Author ID**: ${pageData.authorId}`);

	// Additional metadata
	if (pageData.parentId) {
		lines.push(`- **Parent ID**: ${pageData.parentId}`);
	}

	// Content section
	if (pageData.body?.view?.value) {
		lines.push('');
		lines.push('## Content');
		// Convert HTML content to Markdown
		const markdownContent = htmlToMarkdown(pageData.body.view.value.trim());
		lines.push(markdownContent);
	} else {
		lines.push('');
		lines.push('## Content');
		lines.push('*No content available*');
	}

	// Labels section
	lines.push('');
	lines.push('## Labels');
	if (pageData.labels?.results && pageData.labels.results.length > 0) {
		pageData.labels.results.forEach((label: Label) => {
			lines.push(`- **${label.name}** (ID: ${label.id})`);
		});
	} else {
		lines.push('*No labels assigned to this page*');
	}

	// Links section
	lines.push('');
	lines.push('## Links');
	lines.push(`- **Web UI**: [Open in Confluence](${fullUrl})`);

	// Footer
	lines.push('');
	lines.push('---');
	lines.push(
		`*Page information retrieved at ${new Date().toLocaleString()}*`,
	);
	lines.push(`*To view this page in Confluence, visit: ${fullUrl}*`);

	return lines.join('\n');
}
