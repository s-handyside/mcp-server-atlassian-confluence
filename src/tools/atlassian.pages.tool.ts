import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.util.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { formatErrorForMcpTool } from '../utils/error.util.js';
import {
	ListPagesToolArgsType,
	GetPageToolArgsType,
	ListPagesToolArgs,
	GetPageToolArgs,
} from './atlassian.pages.types.js';

import atlassianPagesController from '../controllers/atlassian.pages.controller.js';

/**
 * MCP Tool: List Confluence Pages
 *
 * Lists Confluence pages with optional filtering by space, status, and limit.
 * Returns a formatted markdown response with page details and pagination info.
 *
 * @param {ListPagesToolArgsType} args - Tool arguments for filtering pages
 * @param {RequestHandlerExtra} _extra - Extra request handler information (unused)
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with formatted pages list
 * @throws Will return error message if page listing fails
 */
async function listPages(
	args: ListPagesToolArgsType,
	_extra: RequestHandlerExtra,
) {
	const logPrefix = '[src/tools/atlassian.pages.tool.ts@listPages]';
	logger.debug(`${logPrefix} Listing Confluence pages with filters:`, args);

	try {
		// Pass the options to the controller
		const message = await atlassianPagesController.list({
			spaceId: args.spaceId,
			query: args.query,
			status: args.status,
			limit: args.limit,
			cursor: args.cursor,
		});

		logger.debug(
			`${logPrefix} Successfully retrieved pages from controller`,
			message,
		);

		return {
			content: [
				{
					type: 'text' as const,
					text: message.content,
				},
			],
		};
	} catch (error) {
		logger.error(`${logPrefix} Failed to list pages`, error);
		return formatErrorForMcpTool(error);
	}
}

/**
 * MCP Tool: Get Confluence Page Details
 *
 * Retrieves detailed information about a specific Confluence page.
 * Returns a formatted markdown response with page content and metadata.
 *
 * @param {GetPageToolArgsType} args - Tool arguments containing the page ID
 * @param {RequestHandlerExtra} _extra - Extra request handler information (unused)
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with formatted page details
 * @throws Will return error message if page retrieval fails
 */
async function getPage(args: GetPageToolArgsType, _extra: RequestHandlerExtra) {
	const logPrefix = '[src/tools/atlassian.pages.tool.ts@getPage]';

	logger.debug(`${logPrefix} Retrieving page details for ID: ${args.pageId}`);

	try {
		const message = await atlassianPagesController.get({ id: args.pageId });

		logger.debug(
			`${logPrefix} Successfully retrieved page details from controller`,
			message,
		);

		return {
			content: [
				{
					type: 'text' as const,
					text: message.content,
				},
			],
		};
	} catch (error) {
		logger.error(`${logPrefix} Failed to get page details`, error);
		return formatErrorForMcpTool(error);
	}
}

/**
 * Register Atlassian Pages MCP Tools
 *
 * Registers the list-pages and get-page tools with the MCP server.
 * Each tool is registered with its schema, description, and handler function.
 *
 * @param {McpServer} server - The MCP server instance to register tools with
 */
function register(server: McpServer) {
	const logPrefix = '[src/tools/atlassian.pages.tool.ts@register]';
	logger.debug(`${logPrefix} Registering Atlassian Pages tools...`);

	// Register the list pages tool
	server.tool(
		'list-pages',
		`List Confluence pages, optionally filtering by space ID(s), status, or title/content/label query, with pagination.

        PURPOSE: Discover pages within specific spaces or across the instance based on status or simple text matching. Provides page metadata and IDs needed for the 'get-page' tool.

        WHEN TO USE:
        - To list pages within one or more specific spaces (using 'spaceId').
        - To find pages based on their status ('current', 'archived', etc.).
        - To perform simple text searches on page titles or labels ('query').
        - To get an overview of recent pages in a space before getting full content.
        - To obtain 'pageId' values for use with 'get-page'.

        WHEN NOT TO USE:
        - When you need to search the *full content* of pages with complex logic (use 'search' with CQL).
        - When you already know the 'pageId' and need details (use 'get-page').
        - When you need space information (use space tools).
        - If you only have the space *key* (use 'list-spaces' or 'get-space' to find the numeric 'spaceId' first).

        RETURNS: Formatted list of pages including ID, title, space ID, status, author, creation date, version, and URL. Includes pagination details if applicable (Confluence uses cursor-based pagination).

        EXAMPLES:
        - List pages in space 123456: { spaceId: ["123456"] }
        - List archived pages in space 123456: { spaceId: ["123456"], status: ["archived"] }
        - Find pages with "Project Plan" in title/label in space 123456: { spaceId: ["123456"], query: "Project Plan" }
        - Paginate results: { limit: 10, cursor: "some-cursor-value" }

        ERRORS:
        - Space ID not found: Verify the numeric 'spaceId' is correct.
        - Invalid status: Ensure 'status' is one of the allowed values.
        - Authentication failures: Check Confluence credentials.
        - No pages found: Filters might be too restrictive, or the space is empty/inaccessible.`,
		ListPagesToolArgs.shape,
		listPages,
	);

	// Register the get page details tool
	server.tool(
		'get-page',
		`Retrieve a Confluence page's full content and metadata by its numeric ID.

        PURPOSE: Fetches the complete content (converted to Markdown) and comprehensive metadata for a specific Confluence page, identified by its numeric ID. The page content is properly formatted with headings, tables, lists, and other Markdown elements.

        WHEN TO USE:
        - When you need to read, analyze, or summarize the full content of a specific page.
        - When you need detailed page metadata (author, version, status, etc.).
        - After finding a page ID through 'list-pages' or 'search' and need its complete content.
        - When you need the actual content of a page rather than just its metadata.

        WHEN NOT TO USE:
        - When you only have a space ID or space key (use 'list-pages' first).
        - When you need to find pages based on criteria (use 'list-pages' or 'search').
        - When you want to discover spaces rather than specific pages (use space tools).
        - When you need to search across multiple pages (use 'search').

        RETURNS: Comprehensive page details formatted in Markdown, including:
        - Full title, space information, and creation metadata
        - Complete page content (converted from Atlassian Document Format to Markdown)
        - Version information, permissions status, and URL
        - Metadata including labels, restrictions, and ancestors
        
        The page content is fetched using the Confluence Content REST API, with the body transformed from ADF (Atlassian Document Format) to readable Markdown.

        EXAMPLES:
        - Get page with ID 123456: { pageId: "123456" }

        ERRORS:
        - Page not found (404): Verify the numeric page ID exists and is accessible.
        - Permission denied (403): Check if the page has view restrictions.
        - Authentication failure: Verify API credentials.
        - Content conversion failures: Some complex content elements may not convert perfectly to Markdown.`,
		GetPageToolArgs.shape,
		getPage,
	);

	logger.debug(`${logPrefix} Successfully registered Atlassian Pages tools`);
}

export default { register };
