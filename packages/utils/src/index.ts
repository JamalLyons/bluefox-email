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
export function DEBUG(name: string, data: any, maxDepth = 5): void {
  const format = (item: any, depth: number, maxDepth = 5): string => {
    const seen = new WeakSet();

    if (depth > maxDepth) return "[Truncated]"; // Prevents excessive recursion

    if (item && typeof item === "object") {
      if (seen.has(item)) return "[Circular]";
      seen.add(item);
    }

    if (item === null) return "null";
    if (item === undefined) return "undefined";
    if (typeof item === "bigint") return `BigInt(${item.toString()}n)`;
    if (typeof item === "symbol") return `Symbol(${item.toString()})`;

    if (typeof item === "function") {
      return `Function(${item.name || "anonymous"}) { ${item.toString().split("\n")[0]} ... }`;
    }

    if (Array.isArray(item)) {
      return `Array(${item.length}) [${item.map((el) => format(el, depth + 1)).join(", ")}]`;
    }

    if (item instanceof Set) {
      return `Set(${item.size}) {${[...item].map((el) => format(el, depth + 1)).join(", ")}}`;
    }

    if (item instanceof Map) {
      return `Map(${item.size}) {${[...item.entries()]
        .map(
          ([key, value]) =>
            `${format(key, depth + 1)} => ${format(value, depth + 1)}`,
        )
        .join(", ")}}`;
    }

    if (item instanceof ArrayBuffer) {
      return `ArrayBuffer(${item.byteLength}) [${new Uint8Array(item).join(", ")}]`;
    }

    if (ArrayBuffer.isView(item)) {
      if (item instanceof DataView) {
        return `DataView(${item.byteLength})`;
      }
      if ("length" in item) {
        return `${item.constructor.name}(${item.length}) [${Array.from(item as any).join(", ")}]`;
      }
    }

    if (item instanceof Blob) {
      return `Blob(${item.size} bytes, type: ${item.type})`;
    }

    if (item instanceof Error) {
      return `Error(${item.name}): ${item.message}`;
    }

    if (item instanceof Promise) {
      return "[Promise] (resolving...)"; // Log resolved value asynchronously
    }

    if (typeof item === "object") {
      return `Object {${Object.entries(item)
        .map(([key, value]) => `${key}: ${format(value, depth + 1)}`)
        .join(", ")}}`;
    }

    return String(item);
  };

  if (data instanceof Promise) {
    data
      .then((resolved) => {
        console.debug(
          `[${name}] - [Promise Resolved]: ${format(resolved, 0, maxDepth)}`,
        );
      })
      .catch((err) => {
        console.debug(
          `[${name}] - [Promise Rejected]: ${format(err, 0, maxDepth)}`,
        );
      });
    return;
  }

  console.debug(`[${name}] - ${format(data, 0, maxDepth)}`);
}

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
export function ERROR(name: string, error: Error | unknown): void {
  const format = (item: any, depth: number, maxDepth = 5): string => {
    const seen = new WeakSet();

    if (depth > maxDepth) return "[Truncated]"; // Prevents excessive recursion

    if (item && typeof item === "object") {
      if (seen.has(item)) return "[Circular]";
      seen.add(item);
    }

    if (item === null) return "null";
    if (item === undefined) return "undefined";
    if (typeof item === "bigint") return `BigInt(${item.toString()}n)`;
    if (typeof item === "symbol") return `Symbol(${item.toString()})`;

    if (typeof item === "function") {
      return `Function(${item.name || "anonymous"}) { ${item.toString().split("\n")[0]} ... }`;
    }

    if (Array.isArray(item)) {
      return `Array(${item.length}) [${item.map((el) => format(el, depth + 1)).join(", ")}]`;
    }

    if (item instanceof Set) {
      return `Set(${item.size}) {${[...item].map((el) => format(el, depth + 1)).join(", ")}}`;
    }

    if (item instanceof Map) {
      return `Map(${item.size}) {${[...item.entries()]
        .map(
          ([key, value]) =>
            `${format(key, depth + 1)} => ${format(value, depth + 1)}`,
        )
        .join(", ")}}`;
    }

    if (item instanceof ArrayBuffer) {
      return `ArrayBuffer(${item.byteLength}) [${new Uint8Array(item).join(", ")}]`;
    }

    if (ArrayBuffer.isView(item)) {
      if (item instanceof DataView) {
        return `DataView(${item.byteLength})`;
      }
      if ("length" in item) {
        return `${item.constructor.name}(${item.length}) [${Array.from(item as any).join(", ")}]`;
      }
    }

    if (item instanceof Blob) {
      return `Blob(${item.size} bytes, type: ${item.type})`;
    }

    if (item instanceof Error) {
      return `Error(${item.name}): ${item.message}`;
    }

    if (item instanceof Promise) {
      return "[Promise] (resolving...)"; // Log resolved value asynchronously
    }

    if (typeof item === "object") {
      return `Object {${Object.entries(item)
        .map(([key, value]) => `${key}: ${format(value, depth + 1)}`)
        .join(", ")}}`;
    }

    return String(item);
  };

  if (error instanceof Error) {
    console.error(`[${name}] - ${error.name}: ${error.message}`);
    if (error.stack) {
      console.error(`[${name}] - Stack: ${error.stack}`);
    }
  } else {
    console.error(`[${name}] - ${format(error, 0)}`);
  }
}
