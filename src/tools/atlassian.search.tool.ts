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
		// Construct base CQL if specific filters are provided
		const baseCqlParts: string[] = [];
		if (args.title) {
			baseCqlParts.push(`title ~ "${args.title.replace(/"/g, '\\"')}"`); // Escape quotes in title
		}
		if (args.spaceKey) {
			baseCqlParts.push(`space = "${args.spaceKey}"`); // Space keys usually don't need escaping, but quote for safety
		}
		if (args.labels && args.labels.length > 0) {
			args.labels.forEach((label) => {
				// Labels containing spaces or special chars need quoting
				baseCqlParts.push(`label = "${label.replace(/"/g, '\\"')}"`);
			});
		}
		if (args.contentType) {
			baseCqlParts.push(`type = ${args.contentType}`); // page or blogpost don't need quotes
		}

		// Handle query vs cql precedence
		let finalCql = args.cql; // Prioritize explicit cql
		if (!finalCql && args.query) {
			// If no explicit cql, but query is present, construct text search CQL
			const textQueryCql = `text ~ "${args.query.replace(/"/g, '\\"')}"`; // Escape quotes
			baseCqlParts.push(textQueryCql);
		}

		// Combine base filter CQL parts if they exist
		const baseFilterCql = baseCqlParts.join(' AND ');

		// Combine explicit CQL (if provided) with base filter CQL
		if (finalCql && baseFilterCql) {
			finalCql = `(${finalCql}) AND (${baseFilterCql})`;
		} else if (baseFilterCql) {
			finalCql = baseFilterCql; // Only base filters (potentially including query)
		}
		// If only explicit cql was provided, finalCql remains as is.
		// If nothing was provided (neither cql, query, nor filters), finalCql remains undefined (search all)

		// Map tool args to controller options
		const controllerOptions: SearchOptions = {
			// Only pass finalCql to the controller
			...(finalCql && { cql: finalCql }),
			// Pass pagination args directly
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
		`Searches Confluence content (pages, blog posts) using flexible criteria. Supports specific filters like \`title\`, \`spaceKey\`, \`label\`, and \`contentType\` (page or blogpost), a simple text search via \`query\`, or advanced filtering with \`cql\` for Confluence Query Language.
- All specific filters (title, spaceKey, label, contentType) are combined with AND logic.
- The \`query\` parameter searches text in title, body, and comments (equivalent to \`text ~ "<query>"\`).
- If \`cql\` is provided, it takes precedence over \`query\`. Explicit \`cql\` is combined with specific filters (title, spaceKey, etc.) using AND.
- If only \`query\` and specific filters are provided, the \`query\` (as \`text ~ "<query>"\`) is combined with the filters using AND.
- Use the \`contentType\` filter (e.g., \`contentType='page'\`) to limit results to specific types, especially when using general filters like \`spaceKey\` without \`cql\` or \`query\`.
- **When using \`cql\` directly, ensure values that are also CQL keywords (like IN, OR, AND, etc.) are enclosed in double quotes (e.g., \`space = "IN"\`).**
- Supports pagination via \`limit\` and \`cursor\`.
- Returns a formatted Markdown list of search results including type, title, excerpt, space information, URL, and content ID.`,
		SearchToolArgs.shape,
		search,
	);

	toolLogger.debug('Successfully registered Atlassian Search tools');
}

export default { registerTools };
