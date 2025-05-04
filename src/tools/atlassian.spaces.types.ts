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
			'Maximum number of items to return (1-100). Controls the response size. Defaults to 25 if omitted. The Confluence API caps results at 100 items per request.',
		),

	cursor: z
		.string()
		.optional()
		.describe(
			'Pagination cursor for retrieving the next set of results. Obtain this opaque string from the metadata of a previous response when more results are available.',
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
			'Optional: Filter spaces by type. Options: "global" (team spaces), "personal" (user spaces), or "archived" (archived spaces). If omitted, returns spaces of all types.',
		),

	status: z
		.enum(['current', 'archived'])
		.optional()
		.describe(
			'Optional: Filter spaces by status. Options: "current" (active spaces) or "archived" (archived spaces). If omitted, returns spaces with all statuses.',
		),

	...PaginationArgs,
});

type ListSpacesToolArgsType = z.infer<typeof ListSpacesToolArgs>;

// Extended type for internal controller use, including the keys filter
export type ListSpacesOptions = ListSpacesToolArgsType & {
	keys?: string[];
};

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
