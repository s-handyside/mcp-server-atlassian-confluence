import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Logger } from '../utils/logger.util.js';
import { formatErrorForMcpTool } from '../utils/error.util.js';
import atlassianSearchController from '../controllers/atlassian.search.controller.js';
import {
	SearchToolArgsType,
	SearchToolArgs,
} from './atlassian.search.types.js';

/**
 * MCP Tool: Search Confluence Content
 *
 * Searches Confluence content using CQL (Confluence Query Language).
 * Returns a formatted markdown response with search results.
 *
 * @param {SearchToolArgsType} args - Tool arguments for filtering search results
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with formatted search results
 * @throws Will return error message if search fails
 */
async function searchContent(args: SearchToolArgsType) {
	const methodLogger = Logger.forContext(
		'tools/atlassian.search.tool.ts',
		'searchContent',
	);
	methodLogger.debug('Tool called with args:', args);

	try {
		// Call the controller to search content
		const result = await atlassianSearchController.search(args);

		methodLogger.debug('Successfully searched Confluence content');

		// Convert the string content to an MCP text resource with the correct type
		const response = {
			content: [
				{
					type: 'text' as const,
					text: result.content,
				},
			],
			...(result.pagination && { pagination: result.pagination }),
			...(result.metadata && { metadata: result.metadata }),
		};

		return response;
	} catch (error) {
		methodLogger.error('Error searching Confluence content:', error);
		// Format the error for MCP tools
		return formatErrorForMcpTool(error);
	}
}

/**
 * Register Atlassian Search MCP Tool
 *
 * Registers the search-content tool with the MCP server.
 *
 * @param {McpServer} server - The MCP server instance to register tools with
 */
function registerTools(server: McpServer) {
	const toolLogger = Logger.forContext(
		'tools/atlassian.search.tool.ts',
		'registerTools',
	);
	toolLogger.debug('Registering Atlassian Search tools...');

	// Register the search content tool
	server.tool(
		'conf_search',
		`Searches Confluence content. Supports multiple filter options: \`cql\` (for providing a complete custom Confluence Query Language string), \`title\` (text in title), \`spaceKey\`, \`labels\`, and \`contentType\` (page/blogpost). A general \`query\` parameter performs a basic text search (equivalent to CQL: text ~ "your query").\nIMPORTANT for \`cql\` users: Ensure your CQL syntax is correct, especially quoting terms in text searches (e.g., \`text ~ "search phrase"\`). Invalid CQL will result in an error. Refer to official Confluence CQL documentation. Filters are generally combined with AND logic.\nSupports pagination (\`limit\`, \`cursor\`). Returns Markdown formatted results with snippets and metadata. Requires Confluence credentials.`,
		SearchToolArgs.shape,
		searchContent,
	);

	toolLogger.debug('Successfully registered Atlassian Search tools');
}

export default { registerTools };
