import { z } from 'zod';

/**
 * Base pagination arguments for all tools
 */
const PaginationArgs = {
	limit: z
		.number()
		.int()
		.positive()
		.min(1)
		.max(100)
		.optional()
		.describe(
			'Maximum number of search results to return (1-100). Controls the response size. Defaults to 25 if omitted. The Confluence search API caps results at 100 items per request.',
		),

	cursor: z
		.string()
		.optional()
		.describe(
			'Pagination cursor for retrieving the next set of results. Obtain this opaque string from the metadata.pagination.nextCursor of a previous response when more results are available. Confluence uses cursor-based pagination rather than offset-based pagination.',
		),
};

/**
 * Arguments for searching Confluence content
 */
const SearchToolArgs = z.object({
	cql: z
		.string()
		.optional()
		.describe(
			'Optional: Full Confluence Query Language (CQL) string for advanced filtering. Example: `space = "DOCS" AND label = "release-notes" AND (title ~ "Q1" OR text ~ "Quarter 1")`. If provided, this forms the base of the search and other filter parameters (title, spaceKey, etc.) will be ANDed with it. Ensure terms in `text ~` clauses are double-quoted if they contain spaces or are not simple words (e.g., `text ~ "my search phrase"`). Refer to Confluence CQL syntax guide for details.',
		),
	title: z
		.string()
		.optional()
		.describe(
			'Optional: Filter results to content where the title contains this text (case-insensitive search). Example: "Meeting Notes". If `cql` is also provided, this will be ANDed with it (e.g., `title ~ "YOUR_TITLE" AND (YOUR_CQL)`). Otherwise, it will be used to build the CQL as `title ~ "YOUR_TITLE"`.',
		),
	spaceKey: z
		.string()
		.optional()
		.describe(
			'Optional: Filter results to content within a specific space key. Example: "DEV", "HR". If `cql` is also provided, this will be ANDed with it (e.g., `space = "YOUR_SPACE" AND (YOUR_CQL)`). Otherwise, it will be used to build the CQL as `space = "YOUR_SPACE"`.',
		),
	labels: z
		.array(z.string())
		.optional()
		.describe(
			'Optional: Filter results to content tagged with ALL of these labels (array). Example: ["project-x", "roadmap"]. If `cql` is also provided, this will be ANDed with it (e.g., `label = "label1" AND label = "label2" AND (YOUR_CQL)`). Otherwise, it will be used to build the CQL with multiple label conditions.',
		),
	contentType: z
		.enum(['page', 'blogpost'])
		.optional()
		.describe(
			'Optional: Filter results by content type. Choose either "page" or "blogpost". If `cql` is also provided, this will be ANDed with it (e.g., `type = "YOUR_TYPE" AND (YOUR_CQL)`). Otherwise, it will be used to build the CQL as `type = "YOUR_TYPE"`.',
		),
	query: z
		.string()
		.optional()
		.describe(
			'Optional: Simple text search query. This will search for the given text within the content body, title, and comments. Translates to CQL: `text ~ "YOUR_QUERY"`. If both `query` and `cql` are provided, they will be combined with AND (e.g., `text ~ "YOUR_QUERY" AND (YOUR_CQL)`). For sophisticated text searches, prefer using the `cql` parameter directly.',
		),
	...PaginationArgs,
});

type SearchToolArgsType = z.infer<typeof SearchToolArgs>;

export { SearchToolArgs, type SearchToolArgsType };
