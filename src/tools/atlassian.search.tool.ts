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
	logger.debug(`${logPrefix} Searching Confluence with filters:`, args);

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
		`Search for content in Confluence using Confluence Query Language (CQL).

PURPOSE: Find pages, blog posts, attachments, and other content across spaces using powerful search queries.

WHEN TO USE:
- When you need to find content matching specific keywords
- When you need to search across multiple spaces
- When you want to find content based on labels, authors, or dates
- When you need to find attachments or specific file types
- When you need advanced filtering beyond what list-pages provides

WHEN NOT TO USE:
- When you only need to browse spaces (use list-spaces instead)
- When you know the space and just want to list pages (use list-pages instead)
- When you already know the specific page ID (use get-page instead)

RETURNS: Formatted list of search results with titles, spaces, content snippets, and URLs.

EXAMPLES:
- Basic text search: {cql: "project plan"}
- Search in specific space: {cql: "space = DEV AND text ~ documentation"}
- Search by label: {cql: "label = 'getting-started'"}
- Search by content type: {cql: "type = page AND text ~ API"}
- With pagination: {cql: "project plan", limit: 20, cursor: "next-page-token"}

ERRORS:
- Invalid CQL: Check your CQL syntax
- Authentication failures: Verify credentials
- No results: Try broadening your search terms`,
		SearchToolArgs.shape,
		search,
	);

	logger.debug(`${logPrefix} Successfully registered Atlassian Search tools`);
}

export default { register };
