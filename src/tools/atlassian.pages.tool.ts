import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.util.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { formatErrorForMcpTool } from '../utils/error.util.js';
import {
	ListPagesToolArgs,
	ListPagesToolArgsType,
	GetPageToolArgs,
	GetPageToolArgsType,
} from './atlassian.pages.type.js';

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
		// Pass the filter options to the controller
		const message = await atlassianPagesController.list({
			spaceId: args.spaceId,
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
	logger.debug(`${logPrefix} Retrieving page details for ID: ${args.id}`);

	try {
		const message = await atlassianPagesController.get({ id: args.id });
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
		'List Confluence pages with optional filtering. Returns pages with their IDs, titles, space IDs, and URLs. Use this tool to discover available content within Confluence spaces. You can filter by space ID to focus on specific projects, by status to find drafts or archived content, and limit the number of results for better readability.',
		ListPagesToolArgs.shape,
		listPages,
	);

	// Register the get page details tool
	server.tool(
		'get-page',
		'Get detailed information about a specific Confluence page by ID. Returns the page content in Markdown format along with metadata like creation date, author, and labels. Use this tool when you need to read or analyze the actual content of a Confluence page, such as documentation, meeting notes, or project information.',
		GetPageToolArgs.shape,
		getPage,
	);

	logger.debug(`${logPrefix} Successfully registered Atlassian Pages tools`);
}

export default { register };
