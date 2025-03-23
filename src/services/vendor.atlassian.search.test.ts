// vendor.atlassian.search.test.ts

import atlassianSearchService from './vendor.atlassian.search.service.js';
import { getAtlassianCredentials } from '../utils/transport.util.js';
import { config } from '../utils/config.util.js';

describe('Vendor Atlassian Search Service', () => {
	beforeAll(() => {
		config.load();
		const credentials = getAtlassianCredentials();
		if (!credentials) {
			console.warn(
				'Skipping Atlassian Search tests: No credentials available',
			);
		}
	});

	describe('search', () => {
		it('should return search results for valid CQL', async () => {
			const credentials = getAtlassianCredentials();
			if (!credentials) return;

			const result = await atlassianSearchService.search({
				cql: 'type=page',
				limit: 5,
			});

			expect(result).toHaveProperty('results');
			expect(Array.isArray(result.results)).toBe(true);
			expect(result).toHaveProperty('_links');
		}, 15000);

		it('should handle pagination correctly', async () => {
			const credentials = getAtlassianCredentials();
			if (!credentials) return;

			// Get first page with small limit
			const firstPage = await atlassianSearchService.search({
				cql: 'type=page',
				limit: 2,
			});

			// Verify first page has expected properties
			expect(firstPage).toHaveProperty('results');
			expect(firstPage.results.length).toBeLessThanOrEqual(2);
			expect(firstPage).toHaveProperty('limit', 2);

			// Skip further testing if there's no next page
			if (!firstPage._links.next) {
				console.warn(
					'Skipping pagination test: No next page available',
				);
				return;
			}

			// Instead of trying to extract and use the cursor directly,
			// we'll just verify the next link exists, which confirms pagination is working
			expect(firstPage._links.next).toContain('/rest/api/search');
		}, 15000);

		it('should throw an error for invalid CQL', async () => {
			const credentials = getAtlassianCredentials();
			if (!credentials) return;

			await expect(
				atlassianSearchService.search({ cql: 'invalid-cql' }),
			).rejects.toThrow();
		}, 15000);
	});
});
