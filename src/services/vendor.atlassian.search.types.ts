import { z } from 'zod';
import { PageLinksSchema } from './vendor.atlassian.pages.types.js';

/**
 * Types for Atlassian Confluence Search API
 */

/**
 * Content excerpt highlighting
 */
export type ExcerptFormat = 'plain' | 'highlight';

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
}

/**
 * Zod schemas for Confluence API search response types
 */

/**
 * Excerpt format enum schema
 */
export const ExcerptFormatSchema = z.enum(['plain', 'highlight']);

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
export const SearchResultLinksSchema = z.object({
	webui: z.string(),
	self: z.string().optional(),
});

/**
 * Search result content schema
 */
export const SearchResultContentSchema = z.object({
	id: z.string(),
	type: z.string(),
	status: z.string(),
	title: z.string(),
	spaceId: z.string(),
	excerpt: ContentExcerptSchema.optional(),
	lastModified: z.string().optional(),
	_links: SearchResultLinksSchema,
});

/**
 * Search result space schema
 */
export const SearchResultSpaceSchema = z.object({
	id: z.string(),
	key: z.string(),
	name: z.string(),
	type: z.string(),
	_links: SearchResultLinksSchema,
});

/**
 * Search result user schema
 */
export const SearchResultUserSchema = z.object({
	accountId: z.string(),
	publicName: z.string(),
	_links: z.object({
		self: z.string(),
	}),
});

/**
 * Search result schema
 */
export const SearchResultSchema = z.object({
	content: SearchResultContentSchema,
	space: SearchResultSpaceSchema,
	user: SearchResultUserSchema.optional(),
	container: SearchResultReferenceSchema.optional(),
	parentPage: SearchResultReferenceSchema.optional(),
	childPages: z.array(SearchResultReferenceSchema).optional(),
	onboardingPage: z.boolean().optional(),
});

/**
 * Search response schema
 */
export const SearchResponseSchema = z.object({
	results: z.array(SearchResultSchema),
	_links: PageLinksSchema.optional(),
	total: z.number().optional(), // Only included if includeTotalSize is true
});

/**
 * Inferred types from Zod schemas
 */
export type ContentExcerptType = z.infer<typeof ContentExcerptSchema>;
export type SearchResultReferenceType = z.infer<
	typeof SearchResultReferenceSchema
>;
export type SearchResultContentType = z.infer<typeof SearchResultContentSchema>;
export type SearchResultSpaceType = z.infer<typeof SearchResultSpaceSchema>;
export type SearchResultUserType = z.infer<typeof SearchResultUserSchema>;
export type SearchResultType = z.infer<typeof SearchResultSchema>;
export type SearchResponseType = z.infer<typeof SearchResponseSchema>;
