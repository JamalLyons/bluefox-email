/**
 * Logs debug information to the console with formatted output.
 *
 * Handles promises, arrays, objects, sets, maps, and primitive types.
 * Detects circular references to prevent infinite recursion.
 * Limits recursion depth to avoid performance issues.
 *
 * @example
 * ```typescript
 * // Basic usage
 * DEBUG('UserData', { id: 1, name: 'John' });
 *
 * // Promise handling
 * DEBUG('AsyncOperation', Promise.resolve({ status: 'success' }));
 *
 * // Complex objects
 * DEBUG('ComplexState', new Map([['key', new Set([1, 2, 3])]]));
 * ```
 *
 * @param name - A string label for the debug log.
 * @param data - The data to log. Can be any type including Promise, Map, Set, etc.
 * @param maxDepth - Maximum recursion depth for nested objects (default: 5).
 */
declare function DEBUG(name: string, data: any, maxDepth?: number): void;
/**
 * Logs error information to the console with enhanced formatting and stack traces.
 *
 * Provides special handling for Error objects to display name, message, and stack trace.
 * For non-Error objects, uses the same advanced formatting as DEBUG function.
 *
 * @example
 * ```typescript
 * // Error object handling
 * try {
 *   throw new Error('Something went wrong');
 * } catch (err) {
 *   ERROR('ProcessFailed', err);
 * }
 *
 * // Custom error object
 * ERROR('ValidationError', {
 *   code: 'INVALID_INPUT',
 *   fields: ['email', 'password']
 * });
 * ```
 *
 * @param name - A string label for the error log.
 * @param error - The error to log. Can be an Error instance or any other type.
 */
declare function ERROR(name: string, error: Error | unknown): void;

export { DEBUG, ERROR };
