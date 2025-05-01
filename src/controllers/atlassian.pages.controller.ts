import { Logger } from '../utils/logger.util.js';
import { handleControllerError } from '../utils/error-handler.util.js';
import { createApiError, ensureMcpError } from '../utils/error.util.js';
import { ControllerResponse } from '../types/common.types.js';
import { ListPagesOptions } from './atlassian.pages.types.js';
import {
	formatPageDetails,
	formatPagesList,
} from './atlassian.pages.formatter.js';
import atlassianPagesService from '../services/vendor.atlassian.pages.service.js';
import atlassianSpacesService from '../services/vendor.atlassian.spaces.service.js';
import {
	DEFAULT_PAGE_SIZE,
	PAGE_DEFAULTS,
	applyDefaults,
} from '../utils/defaults.util.js';
import {
	ListPagesParams,
	GetPageByIdParams,
	BodyFormat,
} from '../services/vendor.atlassian.pages.types.js';
import {
	extractPaginationInfo,
	PaginationType,
} from '../utils/pagination.util.js';

/**
 * Controller for managing Confluence pages.
 * Provides functionality for listing pages and retrieving page details.
 */

// Create a contextualized logger for this file
const controllerLogger = Logger.forContext(
	'controllers/atlassian.pages.controller.ts',
);

// Log controller initialization
controllerLogger.debug('Confluence pages controller initialized');

// Simple in-memory cache for space key to ID mapping
const spaceKeyCache: Record<string, { id: string; timestamp: number }> = {};
const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * List pages from Confluence with filtering options
 * @param options - Options for filtering pages
 * @param options.spaceId - Filter by space ID(s)
 * @param options.spaceKey - Filter by space key(s) - user-friendly alternative to spaceId
 * @param options.query - Filter by text in title, content or labels
 * @param options.status - Filter by page status
 * @param options.sort - Sort order for results
 * @param options.limit - Maximum number of pages to return
 * @param options.cursor - Pagination cursor for subsequent requests
 * @returns Promise with formatted pages list content
 * @throws Error if page listing fails
 */
async function list(
	options: ListPagesOptions = {},
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/atlassian.pages.controller.ts',
		'list',
	);
	methodLogger.debug('Listing Confluence pages with options:', options);

	try {
		const defaults: Partial<ListPagesOptions> = {
			limit: DEFAULT_PAGE_SIZE,
			sort: '-modified-date',
			status: ['current'],
		};
		const mergedOptions = applyDefaults<ListPagesOptions>(
			options,
			defaults,
		);

		let resolvedSpaceIds = mergedOptions.spaceId || []; // Start with explicitly provided IDs

		// Handle space key resolution if provided
		if (mergedOptions.spaceKey && mergedOptions.spaceKey.length > 0) {
			methodLogger.debug(
				`Resolving ${mergedOptions.spaceKey.length} space keys to IDs`,
			);

			const currentTime = Date.now();
			const keysToResolve: string[] = [];
			const currentResolvedIds: string[] = []; // IDs resolved in this specific call

			// Check cache first
			mergedOptions.spaceKey.forEach((key) => {
				const cached = spaceKeyCache[key];
				if (cached && currentTime - cached.timestamp < CACHE_TTL) {
					methodLogger.debug(
						`Using cached ID for space key "${key}": ${cached.id}`,
					);
					currentResolvedIds.push(cached.id);
				} else {
					keysToResolve.push(key);
				}
			});

			if (keysToResolve.length > 10) {
				methodLogger.warn(
					`Resolving ${keysToResolve.length} space keys - this may impact performance`,
				);
			}

			if (keysToResolve.length > 0) {
				try {
					const spacesResponse = await atlassianSpacesService.list({
						keys: keysToResolve,
						limit: 100,
					});

					if (
						spacesResponse.results &&
						spacesResponse.results.length > 0
					) {
						spacesResponse.results.forEach((space) => {
							spaceKeyCache[space.key] = {
								id: space.id,
								timestamp: currentTime,
							};
							currentResolvedIds.push(space.id);
						});

						const resolvedKeys = spacesResponse.results.map(
							(space) => space.key,
						);
						const failedKeys = keysToResolve.filter(
							(key) => !resolvedKeys.includes(key),
						);
						if (failedKeys.length > 0) {
							methodLogger.warn(
								`Could not resolve space keys: ${failedKeys.join(', ')}`,
							);
						}
					}
				} catch (resolveError: unknown) {
					// Type error explicitly
					const error = ensureMcpError(resolveError); // Ensure it's an McpError
					methodLogger.error(
						'Failed to resolve space keys',
						error.message,
					);
					if (
						resolvedSpaceIds.length === 0 &&
						currentResolvedIds.length === 0
					) {
						// Throw only if no direct IDs and no keys resolved successfully
						throw createApiError(
							`Failed to resolve any provided space keys: ${error.message}`,
							400,
							error, // Pass the original error
						);
					}
					// Otherwise log warning and continue
					methodLogger.warn(
						'Proceeding with directly provided IDs and any cached/resolved keys, despite resolution error.',
					);
				}
			}

			// Combine resolved IDs (from this call) with any directly provided IDs
			resolvedSpaceIds = [
				...new Set([...resolvedSpaceIds, ...currentResolvedIds]),
			];
		}

		// Final check: If keys/IDs were provided but none resolved, return empty.
		if (
			(mergedOptions.spaceKey || mergedOptions.spaceId) &&
			resolvedSpaceIds.length === 0
		) {
			methodLogger.warn(
				'No valid space IDs found to query. Returning empty.',
			);
			return {
				content:
					'No pages found. Specified space keys/IDs are invalid or inaccessible.',
				pagination: { hasMore: false, count: 0 },
			};
		}

		// Map controller options to service parameters
		const params: ListPagesParams = {
			...(resolvedSpaceIds.length > 0 && { spaceId: resolvedSpaceIds }),
			...(mergedOptions.query && { query: mergedOptions.query }),
			...(mergedOptions.status && { status: mergedOptions.status }),
			...(mergedOptions.sort && { sort: mergedOptions.sort }),
			limit: mergedOptions.limit,
			cursor: mergedOptions.cursor,
			bodyFormat: 'storage', // Keep storage format for now
		};

		methodLogger.debug('Using service params:', params);

		const pagesData = await atlassianPagesService.list(params);

		methodLogger.debug(
			`Retrieved ${pagesData.results.length} pages. Has more: ${pagesData._links?.next ? 'yes' : 'no'}`,
		);

		const pagination = extractPaginationInfo(
			pagesData,
			PaginationType.CURSOR,
		);
		const formattedPages = formatPagesList(pagesData.results);

		return {
			content: formattedPages,
			pagination,
		};
	} catch (error) {
		return handleControllerError(error, {
			entityType: 'Pages',
			operation: 'listing',
			source: 'controllers/atlassian.pages.controller.ts@list',
		});
	}
}

/**
 * Get details of a specific Confluence page
 * @param args - Object containing the ID of the page to retrieve
 * @param args.pageId - The ID of the page
 * @returns Promise with formatted page details content
 * @throws Error if page retrieval fails
 */
async function get(args: { pageId: string }): Promise<ControllerResponse> {
	const { pageId } = args;
	const methodLogger = Logger.forContext(
		'controllers/atlassian.pages.controller.ts',
		'get',
	);
	methodLogger.debug(`Getting Confluence page with ID: ${pageId}...`);

	try {
		// Map controller options to service parameters
		const params: GetPageByIdParams = {
			bodyFormat: PAGE_DEFAULTS.BODY_FORMAT as BodyFormat,
			includeLabels: PAGE_DEFAULTS.INCLUDE_LABELS,
			includeProperties: PAGE_DEFAULTS.INCLUDE_PROPERTIES,
			includeWebresources: PAGE_DEFAULTS.INCLUDE_WEBRESOURCES,
			includeCollaborators: PAGE_DEFAULTS.INCLUDE_COLLABORATORS,
			includeVersion: PAGE_DEFAULTS.INCLUDE_VERSION,
		};

		methodLogger.debug('Using service params:', params);

		// Get page data from the API
		const pageData = await atlassianPagesService.get(pageId, params);

		// Log only key information instead of the entire response
		methodLogger.debug(
			`Retrieved page: ${pageData.title} (${pageData.id})`,
		);

		// Format the page data for display
		const formattedPage = formatPageDetails(pageData);

		return {
			content: formattedPage,
		};
	} catch (error) {
		return handleControllerError(error, {
			entityType: 'Page',
			entityId: pageId,
			operation: 'retrieving',
			source: 'controllers/atlassian.pages.controller.ts@get',
		});
	}
}

export default { list, get };
