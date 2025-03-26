import { format } from 'date-fns';

/**
 * Format a date with standard formatting
 * @param date - The date to format
 * @param formatStr - Optional custom format string
 * @returns Formatted date string
 */
export function formatDate(
	date: Date,
	formatStr: string = 'yyyy-MM-dd HH:mm:ss',
): string {
	return format(date, formatStr);
}

export default {
	formatDate,
};
