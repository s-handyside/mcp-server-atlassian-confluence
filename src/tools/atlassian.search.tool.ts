import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Logger } from '../utils/logger.util.js';
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
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with formatted search results
 * @throws Will return error message if search fails
 */
async function search(args: SearchToolArgsType) {
	const toolLogger = Logger.forContext(
		'tools/atlassian.search.tool.ts',
		'search',
	);
	toolLogger.debug('Searching Confluence with filters:', args);

	try {
		// Pass the search options to the controller
		const message = await atlassianSearchController.search({
			cql: args.cql,
			limit: args.limit,
			cursor: args.cursor,
		});

		toolLogger.debug(
			'Successfully retrieved search results from controller',
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
		toolLogger.error('Failed to search Confluence', error);
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
function registerTools(server: McpServer) {
	const toolLogger = Logger.forContext(
		'tools/atlassian.search.tool.ts',
		'registerTools',
	);
	toolLogger.debug('Registering Atlassian Search tools');

	// Register the search tool
	server.tool(
		'conf_search',
		`Searches Confluence content (pages, blog posts, attachments, etc.) using a CQL query (\`cql\`), with pagination (\`limit\`, \`cursor\`).\n- Performs advanced search across full content, not just titles/labels like \`confluence_list_pages\`.\n- Supports complex criteria (text, space, type, dates, labels, users) and logical operators.\n- Use this to find content based on keywords or complex filters, then use \`confluence_get_page\` with the returned ID.\nReturns a formatted list of search results including type, title, excerpt, space info, URL, and content ID.\n**Note:** Requires valid CQL syntax. See Confluence documentation for CQL details.`,
		SearchToolArgs.shape,
		search,
	);

	toolLogger.debug('Successfully registered Atlassian Search tools');
}

export default { registerTools };
