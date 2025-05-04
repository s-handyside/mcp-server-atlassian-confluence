import { z } from 'zod';

/**
 * Types for Atlassian Confluence Search API
 */

/**
 * Content excerpt highlighting
 */
export type ExcerptFormat = 'plain' | 'highlight';

/**
 * Valid generic content types for search
 */
export enum GenericContentType {
	DATABASES = 'DATABASES',
	EMBEDS = 'EMBEDS',
	FOLDERS = 'FOLDERS',
	WHITEBOARDS = 'WHITEBOARDS',
}

/**
 * Search parameters
 */
export interface SearchParams {
	cql: string;
	cursor?: string;
	limit?: number;
	includeTotalSize?: boolean;
	excerpt?: ExcerptFormat;
	includeArchivedSpaces?: boolean;
	genericContentType?: GenericContentType;
}

/**
 * Zod schemas for Confluence API search response types
 */

/**
 * Excerpt format enum schema
 */
export const ExcerptFormatSchema = z.enum(['plain', 'highlight']);

/**
 * Generic content type enum schema
 */
export const GenericContentTypeSchema = z.nativeEnum(GenericContentType);

/**
 * Content excerpt schema
 */
export const ContentExcerptSchema = z.object({
	content: z.string(),
	highlights: z.array(z.array(z.number())).optional(),
});

/**
 * Search result reference schema
 */
export const SearchResultReferenceSchema = z.object({
	id: z.string(),
	type: z.string(),
	status: z.string(),
	title: z.string(),
});

/**
 * Search result links schema
 */
export const SearchResultLinksSchema = z
	.object({
		webui: z.string().optional(),
		self: z.string().optional(),
	})
	.optional();

/**
 * Search result content schema - made more flexible to accommodate V1 API
 */
export const SearchResultContentSchema = z
	.object({
		id: z.string().optional(),
		type: z.string().optional(),
		status: z.string().optional(),
		title: z.string().optional(),
		spaceId: z.string().optional(), // Made optional for V1 API
		excerpt: ContentExcerptSchema.optional(),
		lastModified: z.string().optional(),
		_links: SearchResultLinksSchema,
	})
	.passthrough(); // Allow additional properties

/**
 * Search result space schema - made more flexible to accommodate V1 API
 */
export const SearchResultSpaceSchema = z
	.object({
		id: z.string().optional(), // Made optional for V1 API
		key: z.string().optional(), // Made optional for V1 API
		name: z.string().optional(), // Made optional for V1 API
		type: z.string().optional(), // Made optional for V1 API
		_links: SearchResultLinksSchema,
	})
	.passthrough(); // Allow additional properties

/**
 * Search result user schema
 */
export const SearchResultUserSchema = z
	.object({
		accountId: z.string().optional(),
		publicName: z.string().optional(),
		_links: z
			.object({
				self: z.string().optional(),
			})
			.optional(),
	})
	.passthrough(); // Allow additional properties

/**
 * Search result schema - made more flexible to accommodate both V1 and V2 API
 */
export const SearchResultSchema = z
	.object({
		content: SearchResultContentSchema.optional(), // Make optional and accept empty object
		space: SearchResultSpaceSchema.optional(), // Make optional and accept empty object
		user: SearchResultUserSchema.optional(),
		container: SearchResultReferenceSchema.optional(),
		parentPage: SearchResultReferenceSchema.optional(),
		childPages: z.array(SearchResultReferenceSchema).optional(),
		onboardingPage: z.boolean().optional(),
		// Add V1-specific fields
		title: z.string().optional(),
		excerpt: z.string().optional(),
		url: z.string().optional(),
		resultGlobalContainer: z
			.object({
				title: z.string().optional(),
				displayUrl: z.string().optional(),
			})
			.optional(),
		breadcrumbs: z.array(z.unknown()).optional(),
		entityType: z.string().optional(),
		iconCssClass: z.string().optional(),
		lastModified: z.string().optional(),
		friendlyLastModified: z.string().optional(),
		score: z.number().optional(),
	})
	.passthrough(); // Allow additional properties

/**
 * Search response schema - made more flexible to accommodate both V1 and V2 API
 */
export const SearchResponseSchema = z
	.object({
		results: z.array(SearchResultSchema),
		_links: z.object({}).passthrough().optional(), // Accept any object structure
		total: z.number().optional(), // Only included if includeTotalSize is true
	})
	.passthrough(); // Allow additional properties like start, limit, etc.

/**
 * Inferred types from Zod schemas
 */
export type SearchResultType = z.infer<typeof SearchResultSchema>;
export type SearchResponseType = z.infer<typeof SearchResponseSchema>;
