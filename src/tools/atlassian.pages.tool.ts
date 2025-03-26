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
		const message = await atlassianPagesController.get(
			{ id: args.pageId },
			{
				bodyFormat: args.bodyFormat,
				includeLabels: args.includeLabels,
				includeProperties: args.includeProperties,
				includeWebresources: args.includeWebresources,
				includeCollaborators: args.includeCollaborators,
				includeVersion: args.includeVersion,
			},
		);

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
		`List Confluence pages with optional filtering by space, status, and content.

PURPOSE: Helps you discover pages across Confluence or within specific spaces, providing metadata and access links.

WHEN TO USE:
- When you need to find pages in a specific space
- When you need to list pages matching specific criteria
- When you need to browse content before viewing specific pages
- When you need page IDs for use with other Confluence tools

WHEN NOT TO USE:
- When you already know the specific page ID (use get-page instead)
- When you need to search by content (use search instead)
- When you need detailed information about a single page (use get-page instead)
- When you need to list spaces rather than pages (use list-spaces instead)

RETURNS: Formatted list of pages with titles, IDs, spaces, creation dates, and links.

EXAMPLES:
- List pages in a space: {spaceId: ["123456"]}
- Filter by status: {status: ["current"]}
- With pagination: {limit: 25, cursor: "next-page-token"}

ERRORS:
- Space not found: Verify the space ID is correct
- Authentication failures: Check your Confluence credentials
- No results: Adjust filters or check permissions`,
		ListPagesToolArgs.shape,
		listPages,
	);

	// Register the get page details tool
	server.tool(
		'get-page',
		`Get detailed information about a specific Confluence page by ID.

PURPOSE: Retrieves comprehensive page content and metadata including body, properties, labels, and version history.

WHEN TO USE:
- When you need to view the complete content of a page
- When you need page metadata like labels or properties
- When you need to check page version history or collaborators
- After using list-pages or search to identify the page ID
- When you need to extract information from a specific page

WHEN NOT TO USE:
- When you don't know which page to look for (use list-pages or search first)
- When you need to browse multiple pages (use list-pages instead)
- When you need space information rather than page details (use get-space instead)

RETURNS: Detailed page information including title, body content, space, author, version, labels, and creation/update dates.

EXAMPLES:
- Get page content: {pageId: "123456"}
- With specific format: {pageId: "123456", bodyFormat: "view"}
- With all metadata: {pageId: "123456", includeLabels: true, includeProperties: true}

ERRORS:
- Page not found: Verify the page ID is correct
- Permission errors: Ensure you have access to the requested page
- Rate limiting: Cache page information when appropriate`,
		GetPageToolArgs.shape,
		getPage,
	);

	logger.debug(`${logPrefix} Successfully registered Atlassian Pages tools`);
}

export default { register };
