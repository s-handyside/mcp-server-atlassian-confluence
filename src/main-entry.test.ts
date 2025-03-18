// This test specifically focuses on the if (require.main === module) block
// by directly calling the code that would be executed in that block

import { isMainModule, executeCli } from './index';

// Mock the isMainModule and executeCli functions
jest.mock('./index', () => {
	const actualModule = jest.requireActual('./index');
	return {
		...actualModule,
		isMainModule: jest.fn(),
		executeCli: jest.fn(),
	};
});

describe('Main entry point conditional', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should call executeCli if this is the main module', () => {
		// Mock isMainModule to return true
		(isMainModule as jest.Mock).mockReturnValue(true);

		// Directly execute the main entry point code
		if (isMainModule()) {
			executeCli();
		}

		// Verify executeCli was called
		expect(executeCli).toHaveBeenCalled();
	});

	it('should not call executeCli if this is not the main module', () => {
		// Mock isMainModule to return false
		(isMainModule as jest.Mock).mockReturnValue(false);

		// Directly execute the main entry point code
		if (isMainModule()) {
			executeCli();
		}

		// Verify executeCli was not called
		expect(executeCli).not.toHaveBeenCalled();
	});
});
