import { createCli } from './index';
import { Command } from 'commander';

jest.mock('commander', () => {
	const mockCommand = {
		name: jest.fn().mockReturnThis(),
		description: jest.fn().mockReturnThis(),
		version: jest.fn().mockReturnThis(),
		command: jest.fn().mockReturnThis(),
		action: jest.fn().mockReturnThis(),
		parse: jest.fn(),
	};

	return {
		Command: jest.fn().mockImplementation(() => mockCommand),
	};
});

describe('CLI', () => {
	it('should create a CLI program', () => {
		const program = createCli();
		expect(program).toBeDefined();
		expect(program.name).toBeDefined();
		expect(program.description).toBeDefined();
		expect(program.version).toBeDefined();
		expect(program.command).toBeDefined();
		expect(program.action).toBeDefined();
	});
});
