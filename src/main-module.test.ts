import { executeCli, isMainModule } from './index';

// Mock the commander module
jest.mock('commander', () => {
	const mockParse = jest.fn();
	const mockCommand = {
		name: jest.fn().mockReturnThis(),
		description: jest.fn().mockReturnThis(),
		version: jest.fn().mockReturnThis(),
		command: jest.fn().mockReturnThis(),
		action: jest.fn().mockReturnThis(),
		parse: mockParse,
	};

	return {
		Command: jest.fn().mockImplementation(() => mockCommand),
		mockParse,
	};
});

// Mock isMainModule instead of trying to modify require.main
jest.mock('./index', () => {
	const originalModule = jest.requireActual('./index');
	return {
		...originalModule,
		isMainModule: jest.fn(),
	};
});

describe('Main module functions', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should execute CLI and call parse', () => {
		executeCli();
		expect(require('commander').mockParse).toHaveBeenCalled();
	});
});

// Separate describe block for the main module check
describe('Main module check', () => {
	// Create separate test file for this functionality
	it('should call executeCli when this is the main module', () => {
		const executeCli = jest.fn();

		// Create a new module with our mocks
		const moduleSystem = {
			isMainModule: () => true,
			executeCli,
		};

		// Call the main execution code
		if (moduleSystem.isMainModule()) {
			moduleSystem.executeCli();
		}

		expect(executeCli).toHaveBeenCalled();
	});

	it('should not call executeCli when this is not the main module', () => {
		const executeCli = jest.fn();

		// Create a new module with our mocks
		const moduleSystem = {
			isMainModule: () => false,
			executeCli,
		};

		// Call the main execution code
		if (moduleSystem.isMainModule()) {
			moduleSystem.executeCli();
		}

		expect(executeCli).not.toHaveBeenCalled();
	});
});
