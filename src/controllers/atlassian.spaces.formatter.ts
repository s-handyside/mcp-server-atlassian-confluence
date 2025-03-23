import {
	SpaceDetailed,
	SpacesResponse,
} from '../services/vendor.atlassian.spaces.types.js';

/**
 * Format a list of spaces for display
 * @param spacesData - Raw spaces data from the API
 * @param nextCursor - Pagination cursor for retrieving the next set of results
 * @returns Formatted string with spaces information in markdown format
 */
export function formatSpacesList(
	spacesData: SpacesResponse,
	nextCursor?: string,
): string {
	if (!spacesData.results || spacesData.results.length === 0) {
		return 'No Confluence spaces found.';
	}

	const lines: string[] = ['# Confluence Spaces', ''];

	spacesData.results.forEach((space, index) => {
		// Format creation date
		const createdDate = new Date(space.createdAt).toLocaleString();

		// Basic information
		lines.push(`## ${index + 1}. ${space.name}`);
		lines.push(`- **ID**: ${space.id}`);
		lines.push(`- **Key**: ${space.key}`);
		lines.push(`- **Type**: ${space.type}`);
		lines.push(`- **Status**: ${space.status}`);
		lines.push(`- **Created**: ${createdDate}`);
		lines.push(`- **Homepage ID**: ${space.homepageId}`);

		// Description preview
		if (space.description?.view?.value) {
			const description = space.description.view.value.trim();
			if (description) {
				lines.push(`- **Description**: ${description}`);
			}
		} else if (space.description?.plain?.value) {
			const description = space.description.plain.value.trim();
			if (description) {
				lines.push(`- **Description**: ${description}`);
			}
		}

		// URL and navigation
		const baseUrl = spacesData._links.base || '';
		const spaceUrl = space._links.webui;
		const fullUrl = spaceUrl.startsWith('http')
			? spaceUrl
			: `${baseUrl}${spaceUrl}`;
		lines.push(`- **URL**: [${space.key}](${fullUrl})`);

		// Additional metadata
		if (space.currentActiveAlias) {
			lines.push(`- **Alias**: ${space.currentActiveAlias}`);
		}

		lines.push('');
	});

	// Pagination information
	if (nextCursor) {
		lines.push('---');
		lines.push('## Pagination');
		lines.push(
			'*More spaces available. Use the following cursor to retrieve the next page:*',
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
 * Format detailed space information for display
 * @param spaceData - Raw space details from the API
 * @param homepageContent - Optional homepage content to include
 * @returns Formatted string with space details in markdown format
 */
export function formatSpaceDetails(
	spaceData: SpaceDetailed,
	homepageContent?: string,
): string {
	// Format creation date
	const createdDate = new Date(spaceData.createdAt).toLocaleString();

	// Create URL
	const baseUrl = spaceData._links.base || '';
	const spaceUrl = spaceData._links.webui || '';
	const fullUrl = spaceUrl.startsWith('http')
		? spaceUrl
		: `${baseUrl}${spaceUrl}`;

	const lines: string[] = [];

	// Title and summary
	lines.push(`# Confluence Space: ${spaceData.name}`);
	lines.push('');
	lines.push(
		`> A ${spaceData.status} ${spaceData.type} space with key \`${spaceData.key}\` created on ${createdDate}.`,
	);
	lines.push('');

	// Basic information
	lines.push('## Basic Information');
	lines.push(`- **ID**: ${spaceData.id}`);
	lines.push(`- **Key**: ${spaceData.key}`);
	lines.push(`- **Type**: ${spaceData.type}`);
	lines.push(`- **Status**: ${spaceData.status}`);
	lines.push(`- **Created At**: ${createdDate}`);
	lines.push(`- **Author ID**: ${spaceData.authorId}`);
	lines.push(`- **Homepage ID**: ${spaceData.homepageId}`);

	// Additional metadata
	if (spaceData.currentActiveAlias) {
		lines.push(`- **Current Alias**: ${spaceData.currentActiveAlias}`);
	}

	// Description section
	if (
		spaceData.description?.view?.value ||
		spaceData.description?.plain?.value
	) {
		lines.push('');
		lines.push('## Description');

		const viewValue = spaceData.description?.view?.value;
		const plainValue = spaceData.description?.plain?.value;

		if (viewValue && viewValue.trim()) {
			lines.push(viewValue.trim());
		} else if (plainValue && plainValue.trim()) {
			lines.push(plainValue.trim());
		} else {
			lines.push('*No description provided*');
		}
	}

	// Homepage content section (placed after description)
	if (spaceData.homepageId) {
		lines.push('');
		lines.push('## Homepage Content');
		if (homepageContent) {
			lines.push(homepageContent);
		} else {
			lines.push('*No homepage content available*');
		}
	}

	// Labels section
	if (spaceData.labels?.results) {
		lines.push('');
		lines.push('## Labels');

		if (spaceData.labels.results.length === 0) {
			lines.push('*No labels assigned to this space*');
		} else {
			spaceData.labels.results.forEach((label) => {
				const prefix = label.prefix ? `${label.prefix}:` : '';
				lines.push(`- **${prefix}${label.name}** (ID: ${label.id})`);
			});

			if (spaceData.labels.meta?.hasMore) {
				lines.push('');
				lines.push('*More labels are available but not shown*');
			}
		}
	}

	// Links section
	lines.push('');
	lines.push('## Links');
	lines.push(`- **Web UI**: [Open in Confluence](${fullUrl})`);
	if (spaceData.homepageId) {
		const homepageUrl = `${baseUrl}/wiki/spaces/${spaceData.key}/overview`;
		lines.push(`- **Homepage**: [View Homepage](${homepageUrl})`);
	}

	// Footer
	lines.push('');
	lines.push('---');
	lines.push(
		`*Space information retrieved at ${new Date().toLocaleString()}*`,
	);
	lines.push(`*To view this space in Confluence, visit: ${fullUrl}*`);

	return lines.join('\n');
}
