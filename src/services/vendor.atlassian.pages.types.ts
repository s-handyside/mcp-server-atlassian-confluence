/**
 * Types for Atlassian Confluence Pages API
 */
import { z } from 'zod';
import {
	ContentProperty,
	ContentRepresentation,
	Label,
	Operation,
	OptionalFieldMeta,
	OptionalFieldLinks,
	PaginatedResponse,
	Version,
} from './vendor.atlassian.types.js';
import {
	LabelSchema,
	OptionalCollectionSchema,
	OperationSchema,
} from './vendor.atlassian.spaces.types.js';

/**
 * Legacy type definitions - these will be replaced by inferred types from Zod schemas
 */

/**
 * Page status enum
 */
export type ContentStatus =
	| 'current'
	| 'trashed'
	| 'deleted'
	| 'draft'
	| 'archived'
	| 'historical';

/**
 * Parent content type enum
 */
export type ParentContentType = 'page' | 'blogpost';

/**
 * Page sort order enum
 */
export type PageSortOrder =
	| 'id'
	| '-id'
	| 'created-date'
	| '-created-date'
	| 'modified-date'
	| '-modified-date'
	| 'title'
	| '-title';

/**
 * Body format enum
 */
export type BodyFormat =
	| 'storage'
	| 'atlas_doc_format'
	| 'view'
	| 'export_view'
	| 'anonymous_export_view'
	| 'styled_view'
	| 'editor';

/**
 * Body type object - extends ContentRepresentation with no additional fields
 */
export type BodyType = ContentRepresentation;

/**
 * Body bulk object
 */
export interface BodySingle {
	storage?: BodyType;
	atlas_doc_format?: BodyType;
	view?: BodyType;
}

/**
 * Page links object
 */
export interface PageLinks {
	webui: string;
	editui?: string;
	tinyui?: string;
	base?: string;
}

/**
 * Like object
 */
export interface Like {
	userId: string;
	createdAt: string;
}

/**
 * Page object returned from the API (basic fields)
 */
export interface Page {
	id: string;
	status: ContentStatus;
	title: string;
	spaceId: string;
	parentId: string | null;
	parentType?: ParentContentType;
	position?: number | null;
	authorId: string;
	ownerId?: string | null;
	lastOwnerId?: string | null;
	createdAt: string;
	version?: Version;
	body?: BodySingle;
	_links: PageLinks;
}

/**
 * Extended page object with optional fields
 */
export interface PageDetailed extends Page {
	labels?: {
		results: Label[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
	properties?: {
		results: ContentProperty[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
	operations?: {
		results: Operation[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
	likes?: {
		results: Like[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
	versions?: {
		results: Version[];
		meta: OptionalFieldMeta;
		_links: OptionalFieldLinks;
	};
	isFavoritedByCurrentUser?: boolean;
}

/**
 * Parameters for listing pages
 */
export interface ListPagesParams {
	spaceId?: string[];
	title?: string;
	status?: ContentStatus[];
	bodyFormat?: BodyFormat;
	sort?: PageSortOrder;
	query?: string;
	cursor?: string;
	limit?: number;
}

/**
 * Parameters for getting a specific page
 */
export interface GetPageByIdParams {
	bodyFormat?: BodyFormat;
	getDraft?: boolean;
	version?: number;
	includeAncestors?: boolean;
	includeBody?: boolean;
	includeChildTypes?: boolean;
	includeLabels?: boolean;
	includeVersion?: boolean;
	includeOperations?: boolean;
	includeWebresources?: boolean;
	includeCollaborators?: boolean;
}

/**
 * API response for listing pages
 */
export type PagesResponse = PaginatedResponse<Page>;

/**
 * Zod schemas for Confluence API response types
 */

/**
 * Content status enum schema
 */
export const ContentStatusSchema = z.enum([
	'current',
	'deleted',
	'historical',
	'trashed',
	'archived',
	'draft',
]);

/**
 * Page sort order enum schema
 */
export const PageSortOrderSchema = z.enum([
	'id',
	'-id',
	'created-date',
	'-created-date',
	'modified-date',
	'-modified-date',
	'title',
	'-title',
]);

/**
 * Body format enum schema
 */
export const BodyFormatSchema = z.enum([
	'storage',
	'view',
	'export_view',
	'styled_view',
]);

/**
 * Content representation schema
 */
export const ContentRepresentationSchema = z.object({
	representation: z.string(),
	value: z.string(),
});

/**
 * Version schema
 */
export const VersionSchema = z.object({
	number: z.number(),
	message: z.string().optional(),
	minorEdit: z.boolean().optional(),
	authorId: z.string().optional(),
	createdAt: z.string().optional(),
	contentTypeModifiedAt: z.string().optional(),
});

/**
 * Body schema
 */
export const BodySchema = z.object({
	storage: ContentRepresentationSchema.optional(),
	view: ContentRepresentationSchema.optional(),
	export_view: ContentRepresentationSchema.optional(),
	styled_view: ContentRepresentationSchema.optional(),
	atlas_doc_format: ContentRepresentationSchema.optional(),
	wiki: ContentRepresentationSchema.optional(),
	anonymous_export_view: ContentRepresentationSchema.optional(),
});

/**
 * Page links schema
 */
export const PageLinksSchema = z.object({
	webui: z.string().optional(),
	editui: z.string().optional(),
	tinyui: z.string().optional(),
	base: z.string().optional(),
	next: z.string().optional(),
});

/**
 * Web resource schema
 */
export const WebResourceSchema = z.object({
	key: z.string(),
	contexts: z.array(z.string()),
	superbatch: z.string(),
	uris: z.record(z.string()),
	tags: z.array(z.string()),
});

/**
 * Page collaborator schema
 */
export const PageCollaboratorSchema = z.object({
	collaboratorId: z.string(),
	businessObjectId: z.string(),
	appearanceId: z.string(),
});

/**
 * Page parent schema
 */
export const PageParentSchema = z.object({
	id: z.string(),
	type: z.string(),
	status: z.string(),
	title: z.string(),
});

/**
 * Child types schema
 */
export const ChildTypesSchema = z.object({
	attachment: z.boolean().optional(),
	comment: z.boolean().optional(),
	page: z.boolean().optional(),
});

/**
 * Base page schema (common fields)
 */
export const PageSchema = z.object({
	id: z.string(),
	status: ContentStatusSchema,
	title: z.string(),
	spaceId: z.string(),
	parentId: z.string().nullable().optional(),
	parentType: z.string().nullable().optional(),
	authorId: z.string().optional(),
	createdAt: z.string(),
	position: z.number().nullable().optional(),
	version: VersionSchema.optional(),
	_links: PageLinksSchema,
	body: BodySchema.optional(),
});

/**
 * Detailed page schema
 */
export const PageDetailedSchema = PageSchema.extend({
	parent: PageParentSchema.optional(),
	childTypes: ChildTypesSchema.optional(),
	labels: OptionalCollectionSchema(LabelSchema).optional(),
	operations: OptionalCollectionSchema(OperationSchema).optional(),
	collaborators: z
		.union([
			OptionalCollectionSchema(PageCollaboratorSchema),
			z.array(z.any()),
		])
		.optional(),
	webResources: z
		.union([
			OptionalCollectionSchema(WebResourceSchema),
			z.object({}).passthrough(),
		])
		.optional(),
});

/**
 * Pages response schema
 */
export const PagesResponseSchema = z.object({
	results: z.array(PageSchema),
	_links: PageLinksSchema.optional(),
});

/**
 * Inferred types from Zod schemas
 */
export type PageSchemaType = z.infer<typeof PageSchema>;
export type PageDetailedSchemaType = z.infer<typeof PageDetailedSchema>;

// export type PagesResponseType = z.infer<typeof PagesResponseSchema>; // Keep this commented/removed
