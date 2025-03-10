/**
 * Logs debug information to the console with formatted output.
 *
 * Handles promises, arrays, objects, sets, maps, and primitive types.
 * Detects circular references to prevent infinite recursion.
 * Limits recursion depth to avoid performance issues.
 *
 * @param name - A string label for the debug log.
 * @param data - The data to log.
 * @param maxDepth - Maximum recursion depth (default: 5).
 */
export function DEBUG(name: string, data: any, maxDepth = 5): void {
  const seen = new WeakSet();

  const format = (item: any, depth: number): string => {
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
            `${format(key, depth + 1)} => ${format(value, depth + 1)}`
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

  console.debug(`[${name}] - ${format(data, 0)}`);

  // Handle async Promise resolution
  if (data instanceof Promise) {
    data
      .then((resolved) =>
        console.debug(`[${name}] - [Promise Resolved]: ${format(resolved, 0)}`)
      )
      .catch((err) =>
        console.debug(`[${name}] - [Promise Rejected]: ${format(err, 0)}`)
      );
  }
}
