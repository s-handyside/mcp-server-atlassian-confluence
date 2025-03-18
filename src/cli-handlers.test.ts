import { createCli } from './index';

// Mock Commander
jest.mock('commander', () => {
	// Store registered actions
	const actions: Record<string, Function> = {};

	// Create a mock command for the subcommands
	const mockSubCommand = {
		description: jest.fn().mockReturnThis(),
		action: jest.fn().mockImplementation((fn) => {
			actions['subCommand'] = fn;
			return mockSubCommand;
		}),
	};

	// Create a mock Command instance
	const mockCommand = {
		name: jest.fn().mockReturnThis(),
		description: jest.fn().mockReturnThis(),
		version: jest.fn().mockReturnThis(),
		command: jest.fn().mockImplementation(() => mockSubCommand),
		action: jest.fn().mockImplementation((fn) => {
			actions['default'] = fn;
			return mockCommand;
		}),
		parse: jest.fn(),
	};

	return {
		Command: jest.fn().mockImplementation(() => mockCommand),
		__actions: actions,
	};
});

// Mock console.log
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('CLI Command Handlers', () => {
	beforeEach(() => {
		consoleSpy.mockClear();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should register action handlers for commands', () => {
		// Create the CLI
		createCli();

		// Get the registered action handlers
		const actions = (require('commander') as any).__actions;

		// Verify that action handlers were registered
		expect(actions).toBeDefined();
		expect(actions.default).toBeDefined();
		expect(actions.subCommand).toBeDefined();
	});

	it('should call greet when subcommand is executed', () => {
		// Create the CLI
		createCli();

		// Get the registered action handlers
		const actions = (require('commander') as any).__actions;

		// Execute the subcommand action
		actions.subCommand();

		// Verify that console.log was called with "Hello World"
		expect(consoleSpy).toHaveBeenCalledWith('Hello World');
	});

	it('should call greet when default command is executed', () => {
		// Create the CLI
		createCli();

		// Get the registered action handlers
		const actions = (require('commander') as any).__actions;

		// Execute the default action
		actions.default();

		// Verify that console.log was called with "Hello World"
		expect(consoleSpy).toHaveBeenCalledWith('Hello World');
	});
});
