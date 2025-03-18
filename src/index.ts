#!/usr/bin/env node

export function greet(): void {
	console.log('Hello World');
}

// Run the function when script is executed directly
if (require.main === module) {
	greet();
}
