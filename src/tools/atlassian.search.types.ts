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
			'Maximum number of items to return (1-100). Use this to control the response size. Useful for pagination or when you only need a few results. The Confluence search API caps results at 100 items per request.',
		),

	cursor: z
		.string()
		.optional()
		.describe(
			'Pagination cursor for retrieving the next set of results. Use this to navigate through large result sets. The cursor value can be obtained from the pagination information in a previous response.',
		),
};

/**
 * Arguments for searching Confluence content
 * Matches the controller's search function parameters
 */
const SearchToolArgs = z.object({
	cql: z
		.string()
		.optional()
		.describe(
			'Search query using Confluence Query Language (CQL). Use this to search for content using standard CQL syntax (e.g., "text ~ \'project plan\' AND space = DEV"). If omitted, returns recent content sorted by last modified date.',
		),

	...PaginationArgs,
});

type SearchToolArgsType = z.infer<typeof SearchToolArgs>;

export { SearchToolArgs, type SearchToolArgsType };
