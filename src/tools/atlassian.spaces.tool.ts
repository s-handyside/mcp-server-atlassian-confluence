import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.util.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { formatErrorForMcpTool } from '../utils/error.util.js';
import {
	ListSpacesToolArgsType,
	GetSpaceToolArgsType,
	ListSpacesToolArgs,
	GetSpaceToolArgs,
} from './atlassian.spaces.types.js';

import atlassianSpacesController from '../controllers/atlassian.spaces.controller.js';

/**
 * MCP Tool: List Confluence Spaces
 *
 * Lists Confluence spaces with optional filtering by type and name.
 * Returns a formatted markdown response with space details and pagination info.
 *
 * @param {ListSpacesToolArgsType} args - Tool arguments for filtering spaces
 * @param {RequestHandlerExtra} _extra - Extra request handler information (unused)
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with formatted spaces list
 * @throws Will return error message if space listing fails
 */
async function listSpaces(
	args: ListSpacesToolArgsType,
	_extra: RequestHandlerExtra,
) {
	const logPrefix = '[src/tools/atlassian.spaces.tool.ts@listSpaces]';
	logger.debug(`${logPrefix} Listing Confluence spaces with filters:`, args);

	try {
		// Pass the filter options to the controller
		const message = await atlassianSpacesController.list({
			type: args.type === 'archived' ? 'global' : args.type,
			query: args.filter,
			status: args.status,
			limit: args.limit,
			cursor: args.cursor,
		});

		logger.debug(
			`${logPrefix} Successfully retrieved spaces from controller`,
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
		logger.error(`${logPrefix} Failed to list spaces`, error);
		return formatErrorForMcpTool(error);
	}
}

/**
 * MCP Tool: Get Confluence Space Details
 *
 * Retrieves detailed information about a specific Confluence space.
 * Returns a formatted markdown response with space metadata.
 *
 * @param {GetSpaceToolArgsType} args - Tool arguments containing the space key or ID
 * @param {RequestHandlerExtra} _extra - Extra request handler information (unused)
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with formatted space details
 * @throws Will return error message if space retrieval fails
 */
async function getSpace(
	args: GetSpaceToolArgsType,
	_extra: RequestHandlerExtra,
) {
	const logPrefix = '[src/tools/atlassian.spaces.tool.ts@getSpace]';

	logger.debug(
		`${logPrefix} Retrieving space details for key: ${args.entityId}`,
	);

	try {
		const message = await atlassianSpacesController.get({
			key: args.entityId,
		});
		logger.debug(
			`${logPrefix} Successfully retrieved space details from controller`,
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
		logger.error(`${logPrefix} Failed to get space details`, error);
		return formatErrorForMcpTool(error);
	}
}

/**
 * Register Atlassian Spaces MCP Tools
 *
 * Registers the list-spaces and get-space tools with the MCP server.
 * Each tool is registered with its schema, description, and handler function.
 *
 * @param {McpServer} server - The MCP server instance to register tools with
 */
function register(server: McpServer) {
	const logPrefix = '[src/tools/atlassian.spaces.tool.ts@register]';
	logger.debug(`${logPrefix} Registering Atlassian Spaces tools...`);

	// Register the list spaces tool
	server.tool(
		'list-spaces',
		`List Confluence spaces with optional filtering by type, status, and name.

PURPOSE: Helps you discover available spaces in your Confluence instance with their keys, names, and descriptions.

WHEN TO USE:
- When you need to find available spaces for content exploration
- When you need space keys for use with other Confluence tools
- When you want to browse spaces before accessing specific content
- When you need to filter spaces by type (personal, team, etc.)
- When you need to find spaces matching specific keywords

WHEN NOT TO USE:
- When you already know the specific space key (use get-space instead)
- When you need detailed information about a single space (use get-space instead)
- When looking for pages rather than spaces (use list-pages instead)
- When you need to search content across spaces (use search instead)

RETURNS: Formatted list of spaces with keys, names, types, descriptions, and homepage links.

EXAMPLES:
- List all spaces: {}
- Filter by type: {type: "global"}
- Filter by keyword: {filter: "documentation"}
- With pagination: {limit: 10, cursor: "next-page-token"}

ERRORS:
- Authentication failures: Check your Confluence credentials
- No spaces found: You may not have permission to view any spaces
- Rate limiting: Use pagination and reduce query frequency`,
		ListSpacesToolArgs.shape,
		listSpaces,
	);

	// Register the get space details tool
	server.tool(
		'get-space',
		`Get detailed information about a specific Confluence space by key.

PURPOSE: Retrieves comprehensive information about a space including description, categories, permissions, and homepage details.

WHEN TO USE:
- When you need detailed information about a specific space
- When you need to verify space existence or accessibility
- When you need to find the homepage of a space
- After using list-spaces to identify the space key you're interested in
- When you need information about space categories or permissions

WHEN NOT TO USE:
- When you don't know which space to look for (use list-spaces first)
- When you need to list pages within a space (use list-pages instead)
- When you need to search content within a space (use search instead)

RETURNS: Detailed space information including key, name, description, type, status, homepage link, and created/updated dates.

EXAMPLES:
- By key: {entityId: "DEV"}

ERRORS:
- Space not found: Verify the space key is correct
- Permission errors: Ensure you have access to the requested space
- Rate limiting: Cache space information when possible for frequently referenced spaces`,
		GetSpaceToolArgs.shape,
		getSpace,
	);

	logger.debug(`${logPrefix} Successfully registered Atlassian Spaces tools`);
}

export default { register };
