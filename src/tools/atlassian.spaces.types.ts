import { z } from 'zod';

/**
 * Base pagination arguments for all tools
 */
const PaginationArgs = {
	limit: z
		.number()
		.min(1)
		.max(100)
		.optional()
		.describe(
			'Maximum number of items to return (1-100). Use this to control the response size. Useful for pagination or when you only need a few results. The Confluence API caps results at 100 items per request.',
		),

	cursor: z
		.string()
		.optional()
		.describe(
			'Pagination cursor for retrieving the next set of results. Use this to navigate through large result sets. The cursor value can be obtained from the pagination information in a previous response.',
		),
};

/**
 * Arguments for listing Confluence spaces
 * Matches the controller's ListSpacesOptions interface
 */
const ListSpacesToolArgs = z.object({
	type: z
		.enum(['global', 'personal', 'archived'])
		.optional()
		.describe(
			'Filter spaces by type. Options include: "global" (team spaces), "personal" (user spaces), or "archived" (archived spaces). If omitted, returns all types.',
		),

	status: z
		.enum(['current', 'archived'])
		.optional()
		.describe(
			'Filter spaces by status. Options include: "current" (active spaces) or "archived" (archived spaces). If omitted, returns spaces with all statuses.',
		),

	query: z
		.string()
		.optional()
		.describe(
			'Search filter to find spaces matching specific text in their name, key, or description (text search).',
		),

	...PaginationArgs,
});

type ListSpacesToolArgsType = z.infer<typeof ListSpacesToolArgs>;

/**
 * Arguments for getting a specific Confluence space
 * Matches the controller's get function signature
 */
const GetSpaceToolArgs = z.object({
	spaceKey: z
		.string()
		.describe(
			'The key of the Confluence space to retrieve (e.g., "DEV" or "MARKETING"). The space key is a unique identifier for a space, typically a short uppercase code.',
		),
});

type GetSpaceToolArgsType = z.infer<typeof GetSpaceToolArgs>;

export {
	ListSpacesToolArgs,
	type ListSpacesToolArgsType,
	GetSpaceToolArgs,
	type GetSpaceToolArgsType,
};
