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
 * Returns a formatted markdown response with page content, metadata, and version history.
 *
 * @param {GetPageToolArgsType} args - Tool arguments containing the page ID
 * @param {RequestHandlerExtra} _extra - Extra request handler information (unused)
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with formatted page details
 * @throws Will return error message if page retrieval fails
 */
async function getPage(args: GetPageToolArgsType, _extra: RequestHandlerExtra) {
	const logPrefix = '[src/tools/atlassian.pages.tool.ts@getPage]';

	logger.debug(
		`${logPrefix} Retrieving page details for ID: ${args.entityId}`,
	);

	try {
		const message = await atlassianPagesController.get(
			{ id: args.entityId },
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
		`List Confluence pages with optional filtering by space and status.

PURPOSE: Finds pages within Confluence spaces with their IDs, titles, and locations to help you discover available content.

WHEN TO USE:
- When you need to find pages within a specific space
- When you want to list the most recently updated content
- When you need to browse available pages before accessing specific content
- When you need page IDs for use with other Confluence tools
- When looking for pages with specific statuses (current, draft, trashed)

WHEN NOT TO USE:
- When you already know the specific page ID (use get-page instead)
- When you need the actual content of a page (use get-page instead)
- When you need to search across multiple spaces (use search instead)
- When you need to find spaces rather than pages (use list-spaces instead)

RETURNS: Formatted list of pages with IDs, titles, space information, and URLs, plus pagination info.

EXAMPLES:
- Pages in a space: {parentId: "DEV"}
- With status filter: {parentId: "DEV", status: "current"}
- With pagination: {parentId: "DEV", limit: 10, cursor: "next-page-token"}

ERRORS:
- Space not found: Verify the space ID is correct
- Authentication failures: Check your Confluence credentials
- No pages found: The space might be empty or you lack permissions
- Rate limiting: Use pagination and reduce query frequency`,
		ListPagesToolArgs.shape,
		listPages,
	);

	// Register the get page details tool
	server.tool(
		'get-page',
		`Get detailed information and content of a specific Confluence page by ID.

PURPOSE: Retrieves the full content of a page in Markdown format along with comprehensive metadata.

WHEN TO USE:
- When you need to read the actual content of a page
- When you need detailed page metadata (author, dates, versions)
- When you need to extract specific information from a page
- After using list-pages or search to identify relevant page IDs

WHEN NOT TO USE:
- When you don't know which page to look for (use list-pages or search first)
- When you only need basic page information without content (use list-pages instead)
- When you need to find content across multiple pages (use search instead)

RETURNS: Complete page content in Markdown format with metadata including title, author, version, space, and creation/modification dates.

EXAMPLES:
- By ID: {entityId: "123456"}

ERRORS:
- Page not found: Verify the page ID is correct
- Permission errors: Ensure you have access to the requested page
- Rate limiting: Cache page content when possible for frequently accessed pages`,
		GetPageToolArgs.shape,
		getPage,
	);

	logger.debug(`${logPrefix} Successfully registered Atlassian Pages tools`);
}

export default { register };
