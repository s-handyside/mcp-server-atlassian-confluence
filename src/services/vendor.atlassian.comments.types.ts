/**
 * Types for Confluence comments API
 */

/**
 * Parameters for listing comments on a page
 */
export interface ListPageCommentsParams {
	/**
	 * ID of the page to get comments for
	 */
	pageId: string;

	/**
	 * Maximum number of results to return
	 */
	limit?: number;

	/**
	 * Starting point for pagination
	 */
	start?: number;

	/**
	 * Body format (storage, view, atlas_doc_format)
	 */
	bodyFormat?: 'storage' | 'view' | 'atlas_doc_format';
}

/**
 * Comment content body with multiple possible formats
 */
export interface CommentBody {
	/**
	 * Storage format (XML-based)
	 */
	storage?: {
		value: string;
		representation: string;
		embeddedContent: unknown[];
	};

	/**
	 * HTML view
	 */
	view?: {
		value: string;
		representation: string;
	};

	/**
	 * Atlassian Document Format
	 */
	atlas_doc_format?: {
		value: string;
		representation: string;
	};
}

/**
 * Inline comment properties (position, text context, etc.)
 */
export interface InlineProperties {
	/**
	 * The original text that was highlighted/commented on
	 */
	originalSelection?: string;

	/**
	 * The container element identifier
	 */
	containerId?: string;

	/**
	 * Text representation for the highlighted text
	 */
	textContext?: string;

	/**
	 * Metadata about the comment position
	 */
	markerRef?: string;

	/**
	 * Additional positioning information
	 */
	[key: string]: unknown;
}

/**
 * Comment location (inline, footer, etc.)
 */
export interface CommentExtensions {
	/**
	 * Location of the comment (e.g., "inline" for inline comments)
	 */
	location: string;

	/**
	 * Properties specific to inline comments
	 */
	inlineProperties?: InlineProperties;

	/**
	 * Resolution info for resolved comments
	 */
	resolution?: unknown;
}

/**
 * Single comment data structure
 */
export interface CommentData {
	/**
	 * Comment ID
	 */
	id: string;

	/**
	 * Comment type (usually "comment")
	 */
	type: string;

	/**
	 * Status of the comment ("current", "resolved", etc.)
	 */
	status: string;

	/**
	 * Comment title
	 */
	title: string;

	/**
	 * Comment body in different formats
	 */
	body: CommentBody;

	/**
	 * Extensions containing metadata like comment location
	 */
	extensions?: CommentExtensions;

	/**
	 * Links to access the comment
	 */
	_links: {
		webui: string;
		self: string;
	};
}

/**
 * Response for list comments API
 */
export interface ListCommentsResponse {
	/**
	 * Array of comment results
	 */
	results: CommentData[];

	/**
	 * Start index for pagination
	 */
	start: number;

	/**
	 * Limit used for this response
	 */
	limit: number;

	/**
	 * Total size of available results
	 */
	size: number;

	/**
	 * Links for pagination, etc.
	 */
	_links: {
		base: string;
		context: string;
		self: string;
	};
}
