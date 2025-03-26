import atlassianSpacesService from '../services/vendor.atlassian.spaces.service.js';
import atlassianPagesController from './atlassian.pages.controller.js';
import { logger } from '../utils/logger.util.js';
import { createApiError } from '../utils/error.util.js';
import { handleControllerError } from '../utils/error-handler.util.js';
import {
	extractPaginationInfo,
	PaginationType,
} from '../utils/pagination.util.js';
import {
	SpaceStatus,
	SpaceType,
} from '../services/vendor.atlassian.spaces.types.js';
import { ControllerResponse } from '../types/common.types.js';
import { ListSpacesOptions, SpaceIdentifier } from './atlassian.spaces.type.js';
import {
	formatSpacesList,
	formatSpaceDetails,
} from './atlassian.spaces.formatter.js';

/**
 * Controller for managing Confluence spaces.
 * Provides functionality for listing spaces and retrieving space details.
 */

/**
 * List Confluence spaces with optional filtering
 * @param options - Optional filter options for the spaces list
 * @param options.type - Filter by space type (global, personal, etc.)
 * @param options.status - Filter by space status (current, archived)
 * @param options.limit - Maximum number of spaces to return
 * @param options.cursor - Pagination cursor for retrieving the next set of results
 * @returns Promise with formatted space list content and pagination information
 */
async function list(
	options: ListSpacesOptions = {},
): Promise<ControllerResponse> {
	const source = `[src/controllers/atlassian.spaces.controller.ts@list]`;
	logger.debug(`${source} Listing Confluence spaces...`, options);

	try {
		// Set default filters and hardcoded values
		const filters = {
			// Optional filters with defaults
			type: options.type || ('global' as SpaceType),
			status: options.status || ('current' as SpaceStatus),
			limit: options.limit,
			cursor: options.cursor,
			// Hardcoded values for content format
			descriptionFormat: 'view' as const,
			includeIcon: false,
		};

		logger.debug(`${source} Using filters:`, filters);

		const spacesData = await atlassianSpacesService.list(filters);
		// Log only the count of spaces returned instead of the entire response
		logger.debug(
			`${source} Retrieved ${spacesData.results?.length || 0} spaces`,
		);

		// Extract pagination information using the utility
		const pagination = extractPaginationInfo(
			spacesData,
			PaginationType.CURSOR,
			source,
		);

		// Format the spaces data for display using the formatter
		const formattedSpaces = formatSpacesList(
			spacesData,
			pagination.nextCursor,
		);

		return {
			content: formattedSpaces,
			pagination,
		};
	} catch (error) {
		// Use the standardized error handler
		handleControllerError(error, {
			entityType: 'Spaces',
			operation: 'listing',
			source: 'src/controllers/atlassian.spaces.controller.ts@list',
			additionalInfo: { options },
		});
	}
}

/**
 * Get details of a specific Confluence space
 * @param identifier - Object containing the ID or key of the space to retrieve
 * @param identifier.idOrKey - The ID or key of the space
 * @returns Promise with formatted space details content
 * @throws Error if space retrieval fails
 */
async function get(identifier: SpaceIdentifier): Promise<ControllerResponse> {
	const { idOrKey } = identifier;

	logger.debug(
		`[src/controllers/atlassian.spaces.controller.ts@get] Getting Confluence space with ID or Key: ${idOrKey}...`,
	);

	try {
		// Determine if the input is a numeric ID or a space key
		const isNumericId = /^\d+$/.test(idOrKey);

		// Hardcoded parameters for the service call
		const params = {
			// Content format
			descriptionFormat: 'view' as const,
			// Include additional data
			includeIcon: false,
			includeLabels: true,
			includeOperations: false,
			includePermissions: false,
			includeRoleAssignments: false,
		};

		logger.debug(
			`[src/controllers/atlassian.spaces.controller.ts@get] Using params:`,
			params,
		);

		let spaceData;

		if (isNumericId) {
			// If it's a numeric ID, use the get method directly
			logger.debug(
				`[src/controllers/atlassian.spaces.controller.ts@get] Treating input as numeric space ID`,
			);
			spaceData = await atlassianSpacesService.get(idOrKey, params);
		} else {
			// If it's a space key, use the list method with keys filter
			logger.debug(
				`[src/controllers/atlassian.spaces.controller.ts@get] Treating input as space key, using list method with keys filter`,
			);

			const spacesResponse = await atlassianSpacesService.list({
				keys: [idOrKey],
				limit: 1,
				...params,
			});

			// Check if space was found
			if (
				!spacesResponse.results ||
				spacesResponse.results.length === 0
			) {
				throw createApiError(
					`Space not found with key: ${idOrKey}. Verify the space key is correct and that you have access to this space.`,
					404,
				);
			}

			// Get the first space from the results
			const spaceId = spacesResponse.results[0].id;

			// Get full space details using the ID
			spaceData = await atlassianSpacesService.get(spaceId, params);
		}

		// Log only key information instead of the entire response
		logger.debug(
			`[src/controllers/atlassian.spaces.controller.ts@get] Retrieved space: ${spaceData.name} (${spaceData.id})`,
		);

		// Get homepage content if available
		let homepageContent = '';
		if (spaceData.homepageId) {
			try {
				logger.debug(
					`[src/controllers/atlassian.spaces.controller.ts@get] Fetching homepage content for ID: ${spaceData.homepageId}`,
				);
				const homepageResult = await atlassianPagesController.get({
					id: spaceData.homepageId,
				});

				// Extract content from the homepage result
				const content = homepageResult.content;
				// Look for the Content section or any main content
				const contentMatch =
					content.match(/## Content\n([\s\S]*?)(?=\n## |$)/) ||
					content.match(/# .*?\n([\s\S]*?)(?=\n# |$)/);

				if (contentMatch && contentMatch[1]) {
					homepageContent = contentMatch[1].trim();
					logger.debug(
						`[src/controllers/atlassian.spaces.controller.ts@get] Successfully extracted homepage content section`,
					);
				} else {
					// If no specific content section found, use everything after the title
					const titleMatch = content.match(/# .*?\n([\s\S]*)/);
					if (titleMatch && titleMatch[1]) {
						homepageContent = titleMatch[1].trim();
						logger.debug(
							`[src/controllers/atlassian.spaces.controller.ts@get] Extracted homepage content from title section`,
						);
					} else {
						logger.debug(
							`[src/controllers/atlassian.spaces.controller.ts@get] No content sections found in homepage`,
						);
					}
				}
			} catch (error) {
				logger.warn(
					`[src/controllers/atlassian.spaces.controller.ts@get] Failed to fetch homepage content: ${error instanceof Error ? error.message : String(error)}`,
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
		handleControllerError(error, {
			entityType: 'Space',
			entityId: identifier,
			operation: 'retrieving',
			source: 'src/controllers/atlassian.spaces.controller.ts@get',
		});
	}
}

export default { list, get };
