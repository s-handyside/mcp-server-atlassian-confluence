import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.util.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { formatErrorForMcpTool } from '../utils/error.util.js';
import {
	SearchToolArgsType,
	SearchToolArgs,
} from './atlassian.search.types.js';

import atlassianSearchController from '../controllers/atlassian.search.controller.js';

/**
 * MCP Tool: Search Confluence
 *
 * Searches Confluence content using CQL (Confluence Query Language).
 * Returns a formatted markdown response with search results.
 *
 * @param {SearchToolArgsType} args - Tool arguments for the search query
 * @param {RequestHandlerExtra} _extra - Extra request handler information (unused)
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with formatted search results
 * @throws Will return error message if search fails
 */
async function search(args: SearchToolArgsType, _extra: RequestHandlerExtra) {
	const logPrefix = '[src/tools/atlassian.search.tool.ts@search]';
	logger.debug(`${logPrefix} Searching Confluence with query:`, args);

	try {
		// Pass the search parameters to the controller
		const message = await atlassianSearchController.search({
			cql: args.filter,
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
		};
	} catch (error) {
		logger.error(`${logPrefix} Failed to search Confluence`, error);
		return formatErrorForMcpTool(error);
	}
}

/**
 * Register Atlassian Search MCP Tools
 *
 * Registers the search tool with the MCP server.
 * The tool is registered with its schema, description, and handler function.
 *
 * @param {McpServer} server - The MCP server instance to register tools with
 */
function register(server: McpServer) {
	const logPrefix = '[src/tools/atlassian.search.tool.ts@register]';
	logger.debug(`${logPrefix} Registering Atlassian Search tools...`);

	// Register the search tool
	server.tool(
		'search',
		`Search Confluence content using Confluence Query Language (CQL).

PURPOSE: Allows you to find content across spaces, pages, blogs, and attachments using powerful search syntax.

WHEN TO USE:
- When you need to find content across multiple spaces
- When searching for specific keywords, phrases, or content types
- When you need to find content by author, labels, or metadata
- When you don't know exactly where content is located
- When you need the most relevant content rather than browsing hierarchically

WHEN NOT TO USE:
- When you already know the specific page ID (use get-page instead)
- When you only want to browse content within a specific space (use list-pages instead)
- When looking for spaces rather than content (use list-spaces instead)
- When you need very large result sets (CQL searches have performance limitations)

RETURNS: Formatted list of search results with content IDs, titles, spaces, types, and URLs that match your query.

EXAMPLES:
- Search by keyword: {filter: "text ~ 'project plan'"}
- Content type filter: {filter: "type = 'page' AND space = 'DEV'"}
- Created date filter: {filter: "created >= '2023-01-01'"}
- With pagination: {filter: "space = 'DEV'", limit: 10, cursor: "next-page-token"}

ERRORS:
- Invalid CQL: Check your CQL syntax (refer to Confluence documentation)
- Authentication failures: Check your Confluence credentials
- No results: Try broadening your search terms or filters
- Rate limiting: Use pagination and optimize query frequency`,
		SearchToolArgs.shape,
		search,
	);

	logger.debug(`${logPrefix} Successfully registered Atlassian Search tools`);
}

export default { register };
