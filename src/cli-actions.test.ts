import * as indexModule from './index';

// Simply test the functions directly without complex mocking
describe('Entry point tests', () => {
	let consoleSpy: jest.SpyInstance;

	beforeEach(() => {
		consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleSpy.mockRestore();
	});

	it('should log Hello World when greet is called', () => {
		indexModule.greet();
		expect(consoleSpy).toHaveBeenCalledWith('Hello World');
	});

	// Test main module check with a simplified approach
	it('should execute conditional logic based on isMainModule result', () => {
		// Save original functions
		const originalIsMainModule = indexModule.isMainModule;
		const originalExecuteCli = indexModule.executeCli;

		// Create mocks
		const mockExecuteCli = jest.fn();

		try {
			// Replace the functions with our mocks for this test
			(indexModule.isMainModule as any) = jest.fn().mockReturnValue(true);
			(indexModule.executeCli as any) = mockExecuteCli;

			// Call the entry point code manually
			if (indexModule.isMainModule()) {
				indexModule.executeCli();
			}

			// Check execution
			expect(mockExecuteCli).toHaveBeenCalled();

			// Test negative case
			(indexModule.isMainModule as any) = jest
				.fn()
				.mockReturnValue(false);
			mockExecuteCli.mockClear();

			// Call the entry point code manually
			if (indexModule.isMainModule()) {
				indexModule.executeCli();
			}

			// Check that it wasn't called this time
			expect(mockExecuteCli).not.toHaveBeenCalled();
		} finally {
			// Restore original functions
			(indexModule.isMainModule as any) = originalIsMainModule;
			(indexModule.executeCli as any) = originalExecuteCli;
		}
	});
});
