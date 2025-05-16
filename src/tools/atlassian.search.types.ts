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
			'Pagination cursor for retrieving the next set of results. Obtain this opaque string from the metadata of a previous response when more results are available.',
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
			'Optional: Full Confluence Query Language (CQL) string for advanced filtering. Example: `space = "DOCS" AND label = "release-notes" AND (title ~ "Q1" OR text ~ "Quarter 1")`. Ensure terms in `text ~` clauses are double-quoted if they contain spaces or are not simple words (e.g., `text ~ "my search phrase"`). Refer to Confluence CQL syntax guide for details. If this is provided, other specific filter arguments (title, spaceKey, query, etc.) are typically ANDed to this CQL query, unless this CQL is complex enough to stand alone.',
		),
	title: z
		.string()
		.optional()
		.describe(
			'Optional: Filter results to content where the title contains this text (case-insensitive search). Example: "Meeting Notes"',
		),
	spaceKey: z
		.string()
		.optional()
		.describe(
			'Optional: Filter results to content within a specific space key. Example: "DEV", "HR".',
		),
	labels: z
		.array(z.string())
		.optional()
		.describe(
			'Optional: Filter results to content tagged with ALL of these labels (array). Example: ["project-x", "roadmap"]',
		),
	contentType: z
		.enum(['page', 'blogpost'])
		.optional()
		.describe(
			'Optional: Filter results by content type. Choose either "page" or "blogpost".',
		),
	query: z
		.string()
		.optional()
		.describe(
			'Optional: Simple text search query. This will search for the given text within the content body, title, and comments. Equivalent to using cql: `text ~ "<query>"`. If both `query` and `cql` are provided, `cql` takes precedence.',
		),
	...PaginationArgs,
});

type SearchToolArgsType = z.infer<typeof SearchToolArgs>;

export { SearchToolArgs, type SearchToolArgsType };
