import { greet } from './index';

describe('greet function', () => {
	let consoleSpy: jest.SpyInstance;

	beforeEach(() => {
		// Mock console.log
		consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		// Restore console.log
		consoleSpy.mockRestore();
	});

	it('should print "Hello World" to the console', () => {
		// Call the function
		greet();

		// Verify that console.log was called with "Hello World"
		expect(consoleSpy).toHaveBeenCalledWith('Hello World');
	});
});
