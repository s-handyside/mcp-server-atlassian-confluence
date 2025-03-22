import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.util.js';
import { formatErrorForMcpResource } from '../utils/error.util.js';

import ipAddressController from '../controllers/ipaddress.controller.js';

/**
 * Register IP lookup resources with the MCP server
 * @param server The MCP server instance
 */
function register(server: McpServer) {
	logger.debug(
		`[src/resources/iplookup.resource.ts@register] Registering IP lookup resources...`,
	);
	server.resource(
		'Current Device IP',
		'ip://current',
		{
			description: 'Details about your current IP address',
		},
		async (_uri, _extra) => {
			try {
				const resourceContent = await ipAddressController.get();
				return {
					contents: [
						{
							uri: 'ip://current',
							text: resourceContent.content,
							mimeType: 'text/plain',
							description:
								'Details about your current IP address',
						},
					],
				};
			} catch (error) {
				logger.error(
					`[src/resources/ipaddress.resource.ts] Error getting IP details`,
					error,
				);
				return formatErrorForMcpResource(error, 'ip://current');
			}
		},
	);
}

export default { register };
