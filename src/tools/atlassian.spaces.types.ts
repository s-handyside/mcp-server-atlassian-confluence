import { z } from 'zod';

/**
 * Arguments for listing Confluence spaces
 * Includes optional filters with defaults applied in the controller
 */
const ListSpacesToolArgs = z.object({
	type: z
		.enum(['global', 'personal', 'collaboration', 'knowledge_base'])
		.optional()
		.describe(
			'Filter spaces by type. Options: "global" (company-wide spaces), "personal" (user-specific spaces), "collaboration" (team spaces), or "knowledge_base" (documentation spaces). Defaults to "global" if not specified.',
		),
	status: z
		.enum(['current', 'archived'])
		.optional()
		.describe(
			'Filter spaces by status. Options: "current" (active spaces) or "archived" (inactive spaces). Defaults to "current" if not specified.',
		),
	limit: z
		.number()
		.min(1)
		.max(250)
		.optional()
		.describe(
			'Maximum number of spaces to return (1-250). Use this to control the response size. Useful for pagination or when you only need a few results.',
		),
	cursor: z
		.string()
		.optional()
		.describe(
			'Pagination cursor for retrieving the next set of results. Use this to navigate through large result sets. The cursor value can be obtained from the pagination information in a previous response.',
		),
});

type ListSpacesToolArgsType = z.infer<typeof ListSpacesToolArgs>;

/**
 * Arguments for getting a specific Confluence space
 * This matches the controller implementation which takes only an ID parameter
 */
const GetSpaceToolArgs = z.object({
	id: z
		.string()
		.describe(
			'The numeric ID of the Confluence space to retrieve (e.g., "123456"). This is required and must be a valid space ID from your Confluence instance.',
		),
});

type GetSpaceToolArgsType = z.infer<typeof GetSpaceToolArgs>;

export {
	ListSpacesToolArgs,
	type ListSpacesToolArgsType,
	GetSpaceToolArgs,
	type GetSpaceToolArgsType,
};
