import { z } from 'zod';

/**
 * Arguments for searching Confluence content
 * Matches the controller's SearchOptions interface
 */
const SearchToolArgs = z.object({
	cql: z
		.string()
		.describe(
			'The Confluence Query Language (CQL) query to search for. This is a powerful query language that allows you to search for content based on various criteria. Examples:\n- Search by space: "space=DEV AND type=page"\n- Search by title: "title~Project AND type=page"\n- Search by content: "text~API AND type=page"\n- Search by label: "label=documentation AND type=page"\n- Combined search: "space=DEV AND title~Project AND created>=2023-01-01"',
		),
	limit: z
		.number()
		.min(1)
		.max(100)
		.optional()
		.describe(
			'Maximum number of results to return (1-100). Use this to control the response size. Useful for pagination or when you only need a few results. The Confluence API may have its own limits on the number of results returned.',
		),
	cursor: z
		.string()
		.optional()
		.describe(
			'Pagination cursor for retrieving the next set of results. Use this to navigate through large result sets. The cursor value can be obtained from the pagination information in a previous response.',
		),
});

type SearchToolArgsType = z.infer<typeof SearchToolArgs>;

export { SearchToolArgs, type SearchToolArgsType };
