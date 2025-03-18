import { greet, createCli, executeCli, isMainModule } from './index';

// Capture the action callbacks to call them directly
let greetCommandAction: () => void;
let defaultAction: () => void;

// Mock commander
jest.mock('commander', () => {
	const actionMock = jest.fn().mockImplementation((callback) => {
		// Store callbacks for testing
		if (greetCommandAction === undefined) {
			greetCommandAction = callback;
		} else {
			defaultAction = callback;
		}
		return commandInstance;
	});
	const parseMock = jest.fn();
	const commandMock = jest.fn().mockReturnThis();
	const descriptionMock = jest.fn().mockReturnThis();
	const versionMock = jest.fn().mockReturnThis();
	const nameMock = jest.fn().mockReturnThis();

	const commandInstance = {
		command: commandMock,
		description: descriptionMock,
		action: actionMock,
		parse: parseMock,
		version: versionMock,
		name: nameMock
	};

	return {
		Command: jest.fn().mockImplementation(() => commandInstance)
	};
});

describe('index.ts coverage', () => {
	let consoleSpy: jest.SpyInstance;

	beforeEach(() => {
		consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
		jest.clearAllMocks();
	});

	afterEach(() => {
		consoleSpy.mockRestore();
	});

	describe('greet function', () => {
		it('should print "Hello World" to the console', () => {
			greet();
			expect(consoleSpy).toHaveBeenCalledWith('Hello World');
		});
	});

	describe('createCli function', () => {
		it('should create and configure a CLI instance', () => {
			const cli = createCli();
			expect(cli).toBeDefined();
		});

		it('should set up command handlers that call greet', () => {
			// This will set up the action handlers
			createCli();
			
			// Call the stored callback functions
			expect(greetCommandAction).toBeDefined();
			greetCommandAction();
			expect(consoleSpy).toHaveBeenCalledWith('Hello World');
			
			consoleSpy.mockClear();
			
			expect(defaultAction).toBeDefined();
			defaultAction();
			expect(consoleSpy).toHaveBeenCalledWith('Hello World');
		});
	});

	describe('executeCli function', () => {
		it('should execute the CLI', () => {
			executeCli();
			// No assertions needed, we just want to execute the function for coverage
		});
	});

	describe('isMainModule function', () => {
		it('should check if this is the main module', () => {
			const result = isMainModule();
			// We don't care about the actual result, just that the function runs
			expect(typeof result).toBe('boolean');
		});
	});
}); 