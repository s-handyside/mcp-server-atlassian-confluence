import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Logger } from '../utils/logger.util.js';
import { formatErrorForMcpTool } from '../utils/error.util.js';
import {
	ListSpacesToolArgs,
	ListSpacesToolArgsType,
	GetSpaceToolArgsType,
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
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with formatted spaces list
 * @throws Will return error message if space listing fails
 */
async function listSpaces(args: ListSpacesToolArgsType) {
	const toolLogger = Logger.forContext(
		'tools/atlassian.spaces.tool.ts',
		'listSpaces',
	);
	toolLogger.debug('Listing Confluence spaces with filters:', args);

	try {
		// Pass the filter options to the controller
		const message = await atlassianSpacesController.list({
			type: args.type === 'archived' ? 'global' : args.type,
			query: args.query,
			status: args.status,
			limit: args.limit,
			cursor: args.cursor,
		});

		toolLogger.debug(
			'Successfully retrieved spaces from controller',
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
		toolLogger.error('Failed to list spaces', error);
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
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with formatted space details
 * @throws Will return error message if space retrieval fails
 */
async function getSpace(args: GetSpaceToolArgsType) {
	const methodLogger = Logger.forContext(
		'tools/atlassian.spaces.tool.ts',
		'getSpace',
	);
	methodLogger.debug('Tool called with args:', args);

	try {
		// Call the controller to get space details
		const result = await atlassianSpacesController.get({
			spaceKey: args.spaceKey,
		});

		methodLogger.debug('Successfully retrieved space details');

		// Convert the string content to an MCP text resource
		return {
			content: [
				{
					type: 'text' as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error('Error retrieving space details:', error);
		// Format the error for MCP tools
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
function registerTools(server: McpServer) {
	const toolLogger = Logger.forContext(
		'tools/atlassian.spaces.tool.ts',
		'registerTools',
	);
	toolLogger.debug('Registering Atlassian Spaces tools...');

	// Register the list spaces tool
	server.tool(
		'conf_ls_spaces',
		`Lists Confluence spaces accessible to the user, with optional filtering by \`type\` (global, personal), \`status\` (current, archived), or name \`query\`. Use this to discover spaces and find their keys needed for other tools. Supports pagination via \`limit\` and \`cursor\`. Returns a formatted list of spaces including ID, key, name, type, status, and URL. Default sort is by name descending.`,
		ListSpacesToolArgs.shape,
		listSpaces,
	);

	// Register the get space details tool
	server.tool(
		'conf_get_space',
		`Retrieves comprehensive details for a specific Confluence space identified by \`spaceKey\`. Returns the space's description, homepage ID, type, status, theme, permissions, and other metadata as formatted Markdown. Use this after finding a space key via \`conf_ls_spaces\` to get the full space context.`,
		GetSpaceToolArgs.shape,
		getSpace,
	);

	toolLogger.debug('Successfully registered Atlassian Spaces tools');
}

export default { registerTools };
