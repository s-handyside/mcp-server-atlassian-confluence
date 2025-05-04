import { z } from 'zod';
import type { PageSortOrder } from '../services/vendor.atlassian.pages.types.js';

/**
 * Base pagination arguments for all tools
 */
const PaginationArgs = {
	limit: z
		.number()
		.int()
		.positive()
		.min(1)
		.max(250)
		.optional()
		.describe(
			'Maximum number of items to return (1-250). Controls the response size. Defaults to 25 if omitted. The Confluence API caps results at 250 items per request.',
		),

	cursor: z
		.string()
		.optional()
		.describe(
			'Pagination cursor for retrieving the next set of results. Obtain this opaque string from the metadata of a previous response when more results are available.',
		),
};

/**
 * Arguments for listing Confluence pages
 * Matches the controller's ListPagesOptions interface
 */
const ListPagesToolArgs = z.object({
	spaceIds: z
		.array(z.string())
		.optional()
		.describe(
			'Optional: Numeric Space IDs to filter by. Use this OR spaceKeys.',
		),

	spaceKeys: z
		.array(z.string())
		.optional()
		.describe(
			'Optional: Space Keys (e.g., "DEV") to filter by. Use this OR spaceIds. Preferred for usability.',
		),

	query: z
		.string()
		.optional()
		.describe(
			'Filter pages by title, content, or labels (text search). Use this to narrow down results to specific topics or content.',
		),

	status: z
		.array(
			z.enum(['current', 'trashed', 'deleted', 'archived', 'historical']),
		)
		.optional()
		.describe(
			'Optional: Filter pages by status. Options: "current" (published), "trashed", "deleted", "archived", "historical" (previous versions). Defaults to ["current"] if not specified. Provide as an array to include multiple statuses.',
		),

	...PaginationArgs,

	sort: z
		.enum([
			'id',
			'-id',
			'created-date',
			'-created-date',
			'modified-date',
			'-modified-date',
			'title',
			'-title',
		] as [PageSortOrder, ...PageSortOrder[]])
		.optional()
		.describe(
			'Optional: Property to sort pages by. Default is "-modified-date" (most recently modified first). The "-" prefix indicates descending order. Valid values: "id", "-id", "created-date", "-created-date", "modified-date", "-modified-date", "title", "-title".',
		),
});

type ListPagesToolArgsType = z.infer<typeof ListPagesToolArgs>;

/**
 * Arguments for getting a specific Confluence page
 * Matches the controller's get function signature
 */
const GetPageToolArgs = z.object({
	pageId: z
		.string()
		.describe(
			'The numeric ID of the Confluence page to retrieve (e.g., "456789"). This is required and must be a valid page ID from your Confluence instance. The page content will be returned in Markdown format for easy reading.',
		),
});

type GetPageToolArgsType = z.infer<typeof GetPageToolArgs>;

export {
	ListPagesToolArgs,
	type ListPagesToolArgsType,
	GetPageToolArgs,
	type GetPageToolArgsType,
};
