import { z } from 'zod';

/**
 * Base pagination arguments for all tools
 */
const PaginationArgs = {
	limit: z
		.number()
		.min(1)
		.max(250)
		.optional()
		.describe(
			'Maximum number of items to return (1-250). Use this to control the response size. Useful for pagination or when you only need a few results. The Confluence API caps results at 250 items per request.',
		),

	cursor: z
		.string()
		.optional()
		.describe(
			'Pagination cursor for retrieving the next set of results. Use this to navigate through large result sets. The cursor value can be obtained from the pagination information in a previous response.',
		),
};

/**
 * Arguments for listing Confluence pages
 * Matches the controller's ListPagesOptions interface
 */
const ListPagesToolArgs = z.object({
	spaceId: z
		.array(z.string())
		.optional()
		.describe(
			'Filter pages by space IDs. Provide an array of space IDs (e.g., ["123456", "789012"]) to only show pages from specific spaces. Useful when you want to focus on content from particular projects or teams.',
		),

	query: z
		.string()
		.optional()
		.describe(
			'Filter pages by title, content, or labels (text search). Use this to narrow down results to specific topics or content.',
		),

	status: z
		.array(
			z.enum([
				'current',
				'trashed',
				'deleted',
				'draft',
				'archived',
				'historical',
			]),
		)
		.optional()
		.describe(
			'Filter pages by status. Options include: "current" (published pages), "trashed" (pages in trash), "deleted" (permanently deleted), "draft" (unpublished drafts), "archived" (archived pages), or "historical" (previous versions). Defaults to "current" if not specified. Provide as an array to include multiple statuses.',
		),

	...PaginationArgs,
});

type ListPagesToolArgsType = z.infer<typeof ListPagesToolArgs>;

/**
 * Arguments for getting a specific Confluence page
 * Matches the controller's get function signature
 */
const GetPageToolArgs = z.object({
	entityId: z
		.string()
		.describe(
			'The numeric ID of the Confluence page to retrieve (e.g., "456789"). This is required and must be a valid page ID from your Confluence instance. The page content will be returned in Markdown format for easy reading.',
		),

	bodyFormat: z
		.enum(['storage', 'view', 'editor'])
		.optional()
		.describe(
			'Format for the body content. Options include: "storage" (the Confluence storage format), "view" (the rendered HTML), or "editor" (the Confluence editor format). Defaults to "view" if not specified.',
		),

	includeLabels: z
		.boolean()
		.optional()
		.describe(
			'Whether to include labels associated with the page in the response. Defaults to false.',
		),

	includeProperties: z
		.boolean()
		.optional()
		.describe(
			'Whether to include properties associated with the page in the response. Defaults to false.',
		),

	includeWebresources: z
		.boolean()
		.optional()
		.describe(
			'Whether to include web resources associated with the page in the response. Defaults to false.',
		),

	includeCollaborators: z
		.boolean()
		.optional()
		.describe(
			'Whether to include collaborator information for the page in the response. Defaults to false.',
		),

	includeVersion: z
		.boolean()
		.optional()
		.describe(
			'Whether to include version information for the page in the response. Defaults to false.',
		),
});

type GetPageToolArgsType = z.infer<typeof GetPageToolArgs>;

export {
	ListPagesToolArgs,
	type ListPagesToolArgsType,
	GetPageToolArgs,
	type GetPageToolArgsType,
};
