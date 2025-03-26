import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.util.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { formatErrorForMcpTool } from '../utils/error.util.js';
import {
	ListSpacesToolArgs,
	ListSpacesToolArgsType,
	GetSpaceToolArgs,
	GetSpaceToolArgsType,
} from './atlassian.spaces.types.js';

import atlassianSpacesController from '../controllers/atlassian.spaces.controller.js';

/**
 * MCP Tool: List Confluence Spaces
 *
 * Lists Confluence spaces with optional filtering by type, status, and limit.
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
			type: args.type,
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
 * Returns a formatted markdown response with space metadata and properties.
 *
 * @param {GetSpaceToolArgsType} args - Tool arguments containing the space ID
 * @param {RequestHandlerExtra} _extra - Extra request handler information (unused)
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with formatted space details
 * @throws Will return error message if space retrieval fails
 */
async function getSpace(
	args: GetSpaceToolArgsType,
	_extra: RequestHandlerExtra,
) {
	const logPrefix = '[src/tools/atlassian.spaces.tool.ts@getSpace]';
	logger.debug(`${logPrefix} Retrieving space details for ID: ${args.id}`);

	try {
		const message = await atlassianSpacesController.get({
			idOrKey: args.id,
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
		`List Confluence spaces with optional filtering capabilities.

PURPOSE: Discovers available spaces in your Confluence instance with their keys, names, types, and URLs.

WHEN TO USE:
- When you need to discover what spaces exist in your Confluence instance
- When you want to find spaces by type (global, personal, archived)
- When you need to browse available spaces before accessing specific pages
- When you need space keys for use with other Confluence tools

WHEN NOT TO USE:
- When you already know the specific space key/ID (use get-space instead)
- When you need detailed information about a specific space (use get-space instead)
- When you need to find content across multiple spaces (use search instead)
- When you need to list pages within a specific space (use list-pages instead)

RETURNS: Formatted list of spaces with IDs, keys, names, types, and URLs, plus pagination info.

EXAMPLES:
- List all spaces: {}
- Filter by type: {type: "global"}
- With pagination: {limit: 10, cursor: "next-page-token"}

ERRORS:
- Authentication failures: Check your Confluence credentials
- No spaces found: Verify your permissions in Confluence
- Rate limiting: Use pagination and reduce query frequency`,
		ListSpacesToolArgs.shape,
		listSpaces,
	);

	// Register the get space details tool
	server.tool(
		'get-space',
		`Get detailed information about a specific Confluence space by ID or key.

PURPOSE: Retrieves comprehensive space metadata including description, homepage, permissions, and more.

WHEN TO USE:
- When you need detailed information about a specific space
- When you need to find the homepage or key pages within a space
- When you need to verify space permissions or settings
- After using list-spaces to identify the relevant space

WHEN NOT TO USE:
- When you don't know which space to look for (use list-spaces first)
- When you need to browse multiple spaces (use list-spaces instead)
- When you need to find specific content (use search or list-pages instead)

RETURNS: Detailed space information including key, name, description, type, homepage, and metadata.

EXAMPLES:
- By key: {idOrKey: "DEV"}
- By ID: {idOrKey: "123456"}

ERRORS:
- Space not found: Verify the space key or ID is correct
- Permission errors: Ensure you have access to the requested space
- Rate limiting: Cache space information when possible`,
		GetSpaceToolArgs.shape,
		getSpace,
	);

	logger.debug(`${logPrefix} Successfully registered Atlassian Spaces tools`);
}

export default { register };
