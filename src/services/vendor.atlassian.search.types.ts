import {
	ExcerptStrategy,
	Operation,
	ResponseLinks,
} from './vendor.atlassian.types.js';

export interface SearchParams {
	cql: string;
	cqlcontext?: string;
	cursor?: string;
	limit?: number;
	start?: number;
	includeArchivedSpaces?: boolean;
	excludeCurrentSpaces?: boolean;
	excerpt?: ExcerptStrategy;
}

export interface SearchResultContent {
	id: string;
	type: string;
	status: string;
	title: string;
	space?: {
		key: string;
		name: string;
		type: string;
		status: string;
	};
	history?: {
		latest: boolean;
	};
	version?: {
		when: string;
		number: number;
		minorEdit?: boolean;
	};
	ancestors?: Array<unknown>;
	operations?: Array<Operation>;
	_links?: {
		webui?: string;
		self?: string;
		tinyui?: string;
	};
}

export interface SearchResult {
	content: SearchResultContent;
	title: string;
	excerpt?: string;
	url?: string;
	entityType?: string;
	iconCssClass?: string;
	lastModified?: string;
	friendlyLastModified?: string;
	score?: number;
	resultGlobalContainer?: {
		title: string;
		displayUrl?: string;
	};
	breadcrumbs?: unknown[];
}

export interface SearchResponse {
	results: SearchResult[];
	limit: number;
	size: number;
	start: number;
	totalSize?: number;
	cqlQuery?: string;
	searchDuration?: number;
	_links: ResponseLinks;
}
