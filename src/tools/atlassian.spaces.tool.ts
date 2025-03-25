import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.util.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { formatErrorForMcpTool } from '../utils/error.util.js';
import {
	ListSpacesToolArgs,
	ListSpacesToolArgsType,
	GetSpaceToolArgs,
	GetSpaceToolArgsType,
} from './atlassian.spaces.type.js';

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
		'List Confluence spaces with optional filtering. Returns spaces with their IDs, keys, types, and URLs. Use this tool to discover available Confluence spaces before accessing specific content. You can filter by type (global, personal, etc.), status (current, archived), and limit the number of results.',
		ListSpacesToolArgs.shape,
		listSpaces,
	);

	// Register the get space details tool
	server.tool(
		'get-space',
		'Get detailed information about a specific Confluence space by ID. Returns comprehensive metadata including description, labels, and access links. Use this tool when you need in-depth information about a particular space, such as its purpose, creation date, or associated metadata.',
		GetSpaceToolArgs.shape,
		getSpace,
	);

	logger.debug(`${logPrefix} Successfully registered Atlassian Spaces tools`);
}

export default { register };
