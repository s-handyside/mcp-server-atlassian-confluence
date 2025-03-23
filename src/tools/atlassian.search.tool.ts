import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.util.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { formatErrorForMcpTool } from '../utils/error.util.js';
import { SearchToolArgs, SearchToolArgsType } from './atlassian.search.type.js';

import atlassianSearchController from '../controllers/atlassian.search.controller.js';

/**
 * MCP Tool: Search Confluence Content
 *
 * Searches Confluence content using Confluence Query Language (CQL).
 * Returns a formatted markdown response with search results and pagination info.
 *
 * @param {SearchToolArgsType} args - Tool arguments for the search query
 * @param {RequestHandlerExtra} _extra - Extra request handler information (unused)
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with formatted search results
 * @throws Will return error message if search fails
 */
async function searchContent(
	args: SearchToolArgsType,
	_extra: RequestHandlerExtra,
) {
	const logPrefix = '[src/tools/atlassian.search.tool.ts@searchContent]';
	logger.debug(`${logPrefix} Searching Confluence with CQL:`, args);

	try {
		// Pass the search options to the controller
		const message = await atlassianSearchController.search({
			cql: args.cql,
			limit: args.limit,
			cursor: args.cursor,
		});

		logger.debug(
			`${logPrefix} Successfully retrieved search results from controller`,
			message,
		);

		return {
			content: [
				{
					type: 'text' as const,
					text: message.content,
				},
			],
			pagination: message.pagination,
		};
	} catch (error) {
		logger.error(`${logPrefix} Failed to search Confluence`, error);
		return formatErrorForMcpTool(error);
	}
}

/**
 * Register Atlassian Search MCP Tool
 *
 * Registers the search tool with the MCP server.
 * The tool is registered with its schema, description, and handler function.
 *
 * @param {McpServer} server - The MCP server instance to register tools with
 */
function register(server: McpServer) {
	const logPrefix = '[src/tools/atlassian.search.tool.ts@register]';
	logger.debug(`${logPrefix} Registering Atlassian Search tool...`);

	// Register the search tool
	server.tool(
		'search',
		'Search for content in Confluence using Confluence Query Language (CQL). Returns search results with their IDs, titles, excerpts with highlighted matching text, URLs, and space information. This tool is useful for finding specific content across your Confluence instance. CQL is a powerful query language that allows you to search by content type, space, title, text, labels, and more. Examples: "type=page AND space=DEV", "title~Project AND text~API", "label=documentation". Results include pagination information for retrieving additional results.',
		SearchToolArgs.shape,
		searchContent,
	);

	logger.debug(`${logPrefix} Successfully registered Atlassian Search tool`);
}

export default { register };
