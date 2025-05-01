import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Logger } from '../utils/logger.util.js';
import { formatErrorForMcpTool } from '../utils/error.util.js';
import atlassianPagesController from '../controllers/atlassian.pages.controller.js';
import { ListPagesOptions } from '../controllers/atlassian.pages.types.js';
import {
	ListPagesToolArgsType,
	ListPagesToolArgs,
	GetPageToolArgsType,
	GetPageToolArgs,
} from './atlassian.pages.types.js';

/**
 * MCP Tool: List Confluence Pages
 *
 * Lists Confluence pages with optional filtering by space, status, and limit.
 * Returns a formatted markdown response with page details and pagination info.
 *
 * @param {ListPagesToolArgsType} args - Tool arguments for filtering pages
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with formatted pages list
 * @throws Will return error message if page listing fails
 */
async function listPages(args: ListPagesToolArgsType) {
	const methodLogger = Logger.forContext(
		'tools/atlassian.pages.tool.ts',
		'listPages',
	);
	methodLogger.debug('Tool called with args:', args);

	try {
		// Map the tool args to controller options
		const options: ListPagesOptions = {};

		if (args.spaceIds) {
			options.spaceIds = args.spaceIds;
		}
		if (args.spaceKeys) {
			options.spaceKeys = args.spaceKeys;
		}
		if (args.query) {
			options.query = args.query;
		}
		if (args.status) {
			options.status = args.status;
		}
		if (args.limit) {
			options.limit = args.limit;
		}
		if (args.cursor) {
			options.cursor = args.cursor;
		}
		if (args.sort) {
			options.sort = args.sort;
		}

		methodLogger.debug('Calling controller with options:', options);

		const result = await atlassianPagesController.list(options);

		methodLogger.debug('Successfully retrieved pages list');

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
		methodLogger.error('Error listing pages:', error);
		return formatErrorForMcpTool(error);
	}
}

/**
 * MCP Tool: Get Confluence Page Details
 *
 * Retrieves detailed information about a specific Confluence page.
 * Returns a formatted markdown response with page content and metadata.
 *
 * @param {GetPageToolArgsType} args - Tool arguments containing the page ID
 * @returns {Promise<{ content: Array<{ type: 'text', text: string }> }>} MCP response with formatted page details
 * @throws Will return error message if page retrieval fails
 */
async function getPage(args: GetPageToolArgsType) {
	const methodLogger = Logger.forContext(
		'tools/atlassian.pages.tool.ts',
		'getPage',
	);
	methodLogger.debug('Tool called with args:', args);

	try {
		// Call the controller to get page details
		const result = await atlassianPagesController.get({
			pageId: args.pageId,
		});

		methodLogger.debug('Successfully retrieved page details');

		// Convert the string content to an MCP text resource with the correct type
		return {
			content: [
				{
					type: 'text' as const,
					text: result.content,
				},
			],
		};
	} catch (error) {
		methodLogger.error('Error retrieving page details:', error);
		// Format the error for MCP tools
		return formatErrorForMcpTool(error);
	}
}

/**
 * Register Atlassian Pages MCP Tools
 *
 * Registers the list-pages and get-page tools with the MCP server.
 * Each tool is registered with its schema, description, and handler function.
 *
 * @param {McpServer} server - The MCP server instance to register tools with
 */
function registerTools(server: McpServer) {
	const toolLogger = Logger.forContext(
		'tools/atlassian.pages.tool.ts',
		'registerTools',
	);
	toolLogger.debug('Registering Atlassian Pages tools...');

	// Register the list pages tool
	server.tool(
		'conf_ls_pages',
		`Lists Confluence pages, optionally filtering by space key(s) (\`spaceKey\`), space ID(s) (\`spaceId\`), status (\`status\`), title/label query (\`query\`), or sorting (\`sort\`).\n- Use this to discover pages within spaces and find page IDs needed for \`confluence_get_page\`.\n- Simple text search (\`query\`) matches titles/labels, not full content. Use \`confluence_search\` for full content search.\n- Supports pagination via \`limit\` and \`cursor\`.\nReturns a formatted list of pages including ID, title, space ID, status, author, and dates.\n**Note:** You can use \`spaceKey\` (e.g., "DEV", "HR") which is more user-friendly than numeric \`spaceId\`. Default sort is by last modified date.`,
		ListPagesToolArgs.shape,
		listPages,
	);

	// Register the get page details tool
	server.tool(
		'conf_get_page',
		`Retrieves the full content (converted to Markdown) and metadata for a specific Confluence page using its numeric ID (\`pageId\`).\n- Includes complete page body, title, space info, author, version, labels, and URL.\nUse this after finding a page ID via \`confluence_list_pages\` or \`confluence_search\` to get its full content.\nReturns comprehensive page details formatted as Markdown.`,
		GetPageToolArgs.shape,
		getPage,
	);

	toolLogger.debug('Successfully registered Atlassian Pages tools');
}

export default { registerTools };
