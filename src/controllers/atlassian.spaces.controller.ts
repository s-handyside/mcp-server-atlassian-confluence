import { Logger } from '../utils/logger.util.js';
import { ListSpacesOptions } from './atlassian.spaces.types.js';
import { createApiError } from '../utils/error.util.js';
import { handleControllerError } from '../utils/error-handler.util.js';
import atlassianSpacesService from '../services/vendor.atlassian.spaces.service.js';
import {
	formatSpacesList,
	formatSpaceDetails,
} from '../controllers/atlassian.spaces.formatter.js';
import { ControllerResponse } from '../types/common.types.js';
import atlassianPagesController from './atlassian.pages.controller.js';
import {
	DEFAULT_PAGE_SIZE,
	SPACE_DEFAULTS,
	applyDefaults,
} from '../utils/defaults.util.js';
import { ListSpacesParams } from '../services/vendor.atlassian.spaces.types.js';

/**
 * Controller for managing Confluence spaces.
 * Provides functionality for listing spaces and retrieving space details.
 */

/**
 * List Confluence spaces with optional filtering
 * @param options - Options for filtering spaces
 * @param options.type - Filter by space type (global, personal, etc.)
 * @param options.status - Filter by space status (current, archived)
 * @param options.limit - Maximum number of spaces to return
 * @param options.cursor - Pagination cursor for subsequent requests
 * @returns Promise with formatted spaces list content and pagination info
 * @throws Error if space listing fails
 */
async function list(
	options: ListSpacesOptions = {},
): Promise<ControllerResponse> {
	const controllerLogger = Logger.forContext(
		'controllers/atlassian.spaces.controller.ts',
		'list',
	);
	controllerLogger.debug('Listing Confluence spaces with options:', options);

	try {
		// Create defaults object with proper typing
		const defaults: Partial<ListSpacesOptions> = {
			limit: DEFAULT_PAGE_SIZE,
			sort: '-name',
		};

		// Apply defaults
		const mergedOptions = applyDefaults<ListSpacesOptions>(
			options,
			defaults,
		);

		// Map controller options to service parameters
		const params: ListSpacesParams = {
			type: mergedOptions.type,
			status: mergedOptions.status,
			limit: mergedOptions.limit,
			cursor: mergedOptions.cursor,
			// Additional parameters
			sort: mergedOptions.sort, // Already typed correctly through ListSpacesParams
			descriptionFormat: 'view',
			includeIcon: true, // Include space icons in response
		};

		controllerLogger.debug('Using params:', params);

		const spacesData = await atlassianSpacesService.list(params);

		// Log only summary information instead of the entire response
		controllerLogger.debug(
			`Retrieved ${spacesData.results.length} spaces. Has more: ${spacesData._links?.next ? 'yes' : 'no'}`,
		);

		// The formatSpacesList function expects a spacesData parameter
		// Extract the nextCursor from the links
		const nextCursor = spacesData._links?.next?.split('cursor=')[1] || '';
		const formattedSpaces = formatSpacesList(spacesData);

		return {
			content: formattedSpaces,
			pagination: {
				count: spacesData.results.length,
				hasMore: !!spacesData._links?.next,
				nextCursor: nextCursor,
			},
		};
	} catch (error) {
		// Use the standardized error handler
		return handleControllerError(error, {
			entityType: 'Spaces',
			operation: 'listing',
			source: 'controllers/atlassian.spaces.controller.ts@list',
		});
	}
}

/**
 * Get details of a specific Confluence space
 * @param args - Object containing the key of the space to retrieve
 * @param args.spaceKey - The key of the space
 * @returns Promise with formatted space details content
 * @throws Error if space retrieval fails
 */
async function get(args: { spaceKey: string }): Promise<ControllerResponse> {
	const { spaceKey } = args;
	const controllerLogger = Logger.forContext(
		'controllers/atlassian.spaces.controller.ts',
		'get',
	);
	controllerLogger.debug(`Getting Confluence space with key: ${spaceKey}...`);

	try {
		// Create defaults object with proper typing for space details
		const defaults = {
			descriptionFormat: 'view' as const,
			includeIcon: false,
			includeLabels: true,
			includeOperations: false,
			includePermissions: SPACE_DEFAULTS.INCLUDE_PERMISSIONS,
			includeRoleAssignments: false,
		};

		// Hardcoded parameters for the service call - use defaults
		const params = defaults;

		controllerLogger.debug('Using params:', params);

		// The Confluence API v2 doesn't provide a direct endpoint to get full space details by key.
		// It only allows retrieving spaces by ID for detailed information. Therefore, we must:
		// 1. Use the list endpoint with keys filter to find the space ID first
		// 2. Use the get endpoint with the ID to retrieve complete space details
		// This two-step lookup is necessary due to API constraints.
		controllerLogger.debug('Searching for space by key');

		const spacesResponse = await atlassianSpacesService.list({
			keys: [spaceKey],
			limit: 1,
			...params,
		});

		// Check if space was found
		if (!spacesResponse.results || spacesResponse.results.length === 0) {
			throw createApiError(
				`Space not found with key: ${spaceKey}. Verify the space key is correct and that you have access to this space.`,
				404,
			);
		}

		// Get the space from the results
		const spaceId = spacesResponse.results[0].id;

		// Get full space details using the ID
		const spaceData = await atlassianSpacesService.get(spaceId, params);

		// Log only key information instead of the entire response
		controllerLogger.debug(
			`Retrieved space: ${spaceData.name} (${spaceData.id})`,
		);

		// Get homepage content if available
		let homepageContent = '';
		if (spaceData.homepageId) {
			try {
				controllerLogger.debug(
					`Fetching homepage content for ID: ${spaceData.homepageId}`,
				);
				const homepageResult = await atlassianPagesController.get({
					pageId: spaceData.homepageId,
				});

				// Extract content from the homepage result
				const content = homepageResult.content;
				// Look for the Content section or any main content
				const contentMatch =
					content.match(/## Content\n([\s\S]*?)(?=\n## |$)/) ||
					content.match(/# .*?\n([\s\S]*?)(?=\n# |$)/);

				if (contentMatch && contentMatch[1]) {
					homepageContent = contentMatch[1].trim();
					controllerLogger.debug(
						'Successfully extracted homepage content section',
					);
				} else {
					// If no specific content section found, use everything after the title
					const titleMatch = content.match(/# .*?\n([\s\S]*)/);
					if (titleMatch && titleMatch[1]) {
						homepageContent = titleMatch[1].trim();
						controllerLogger.debug(
							'Extracted homepage content from title section',
						);
					} else {
						controllerLogger.debug(
							'No content sections found in homepage',
						);
					}
				}
			} catch (error) {
				controllerLogger.warn(
					`Failed to fetch homepage content: ${error instanceof Error ? error.message : String(error)}`,
				);
				homepageContent =
					'*Failed to retrieve homepage content. The page may be inaccessible or deleted.*';
			}
		}

		// Format the space data for display with homepage content using the formatter
		const formattedSpace = formatSpaceDetails(spaceData, homepageContent);

		return {
			content: formattedSpace,
		};
	} catch (error) {
		// Use the standardized error handler
		return handleControllerError(error, {
			entityType: 'Space',
			entityId: spaceKey,
			operation: 'retrieving',
			source: 'controllers/atlassian.spaces.controller.ts@get',
		});
	}
}

export default { list, get };
