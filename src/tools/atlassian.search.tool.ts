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
		`Search for content across Confluence using Confluence Query Language (CQL).

PURPOSE: Finds content matching specific criteria with excerpts showing matches, helping you discover relevant information across spaces.

WHEN TO USE:
- When you need to find specific content across multiple spaces
- When you want to search by various criteria (text, title, labels, content type)
- When you need to gather information scattered across different pages
- When you're unfamiliar with the structure of Confluence and need discovery
- When looking for content with specific labels or within specific date ranges

WHEN NOT TO USE:
- When you already know the exact space and page (use get-page instead)
- When you want to list all spaces or pages systematically (use list-spaces/list-pages)
- When performing many rapid, consecutive searches (consider rate limits)
- When you need to retrieve complete page content (use get-page after search)

RETURNS: Search results with titles, excerpts showing matches, content types, spaces, and URLs, plus pagination info.

EXAMPLES:
- Simple text search: {cql: "text~documentation"}
- Space-specific search: {cql: "space=DEV AND text~API"}
- Title search: {cql: "title~Project Plan"}
- Content type filter: {cql: "type=page AND label=important"}
- With pagination: {cql: "text~API", limit: 10, cursor: "next-page-token"}

ERRORS:
- Invalid CQL syntax: Check CQL syntax (example: "type=page AND space=DEV")
- No results: Try broader search terms or check different spaces
- Authentication failures: Check your Confluence credentials
- Rate limiting: Use more specific queries and pagination`,
		SearchToolArgs.shape,
		searchContent,
	);

	logger.debug(`${logPrefix} Successfully registered Atlassian Search tool`);
}

export default { register };
