import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Logger } from '../utils/logger.util.js';
import { formatErrorForMcpTool } from '../utils/error.util.js';
import {
	SearchToolArgsType,
	SearchToolArgs,
} from './atlassian.search.types.js';
import { SearchOptions } from '../controllers/atlassian.search.types.js';
import atlassianSearchController from '../controllers/atlassian.search.controller.js';

/**
 * MCP Tool: Search Confluence
 *
 * Searches Confluence content using CQL (Confluence Query Language).
 * Returns a formatted markdown response with search results.
 *
 * @param {SearchToolArgsType} args - Tool arguments for the search query
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }>, pagination?: { total: number; start: number; limit: number }; metadata?: any }>} MCP response with formatted search results
 * @throws Will return error message if search fails
 */
async function search(args: SearchToolArgsType) {
	const toolLogger = Logger.forContext(
		'tools/atlassian.search.tool.ts',
		'search',
	);
	toolLogger.debug('Searching Confluence with filters:', args);

	try {
		// Map tool args to controller options
		const controllerOptions: SearchOptions = {
			...(args.cql && { cql: args.cql }),
			...(args.title && { title: args.title }),
			...(args.spaceKey && { spaceKey: args.spaceKey }),
			...(args.labels && { labels: args.labels }),
			...(args.contentType && { contentType: args.contentType }),
			...(args.limit && { limit: args.limit }),
			...(args.cursor && { cursor: args.cursor }),
		};

		const message =
			await atlassianSearchController.search(controllerOptions);

		toolLogger.debug(
			'Successfully retrieved search results from controller',
		);

		// Construct response, including metadata if present
		const response = {
			content: [
				{
					type: 'text' as const,
					text: message.content,
				},
			],
			...(message.pagination && { pagination: message.pagination }),
			...(message.metadata && { metadata: message.metadata }),
		};

		return response;
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

	server.tool(
		'conf_search',
		`Searches Confluence content (pages, blog posts) using flexible criteria. Supports specific filters like \`title\`, \`spaceKey\`, \`label\`, and \`contentType\` (page or blogpost) or advanced filtering with \`cql\` for Confluence Query Language. All filters are combined with AND logic. **When using \`cql\` directly, ensure values that are also CQL keywords (like IN, OR, AND, etc.) are enclosed in double quotes (e.g., \`space = "IN"\`).** Supports pagination via \`limit\` and \`cursor\`. Returns a formatted Markdown list of search results including type, title, excerpt, space information, URL, and content ID.`,
		SearchToolArgs.shape,
		search,
	);

	toolLogger.debug('Successfully registered Atlassian Search tools');
}

export default { registerTools };
