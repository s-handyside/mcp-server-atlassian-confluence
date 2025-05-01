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
 */
const SearchToolArgs = z.object({
	cql: z
		.string()
		.optional()
		.describe(
			'Optional: Full Confluence Query Language (CQL) string for advanced filtering (e.g., \'type=page AND space=DEV AND text ~ "release notes"\'). Use this for complex queries. If combined with other specific filter arguments (title, spaceKey, etc.), they will be added with AND logic.',
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
	...PaginationArgs,
});

type SearchToolArgsType = z.infer<typeof SearchToolArgs>;

export { SearchToolArgs, type SearchToolArgsType };
