import { describe, it, expect } from "vitest";
import { stripUndefinedKeys } from "@bluefox-email/utils";

describe("stripUndefinedKeys", () => {
    it("should preserve arrays and not convert them to objects", () => {
        const input = {
            emails: ["email1@example.com", "email2@example.com", "email3@example.com"],
            triggeredId: "test-id",
            data: { name: "Test" },
            undefinedField: undefined,
        };

        const result = stripUndefinedKeys(input);

        // Verify the emails array is preserved as an array (not converted to plain object)
        expect(Array.isArray(result.emails)).toBe(true);
        expect(result.emails).toEqual([
            "email1@example.com",
            "email2@example.com",
            "email3@example.com",
        ]);

        // Verify it's an array, not a plain object
        // Arrays have numeric indices, but they're still arrays
        // The key test is that Array.isArray() returns true
        const emails = result.emails as string[];
        expect(Object.prototype.toString.call(emails)).toBe("[object Array]");
        expect(emails instanceof Array).toBe(true);

        // Verify it's not a plain object (plain objects don't have array methods)
        expect(typeof emails.push).toBe("function");
        expect(typeof emails.map).toBe("function");

        // Verify other fields
        expect(result.triggeredId).toBe("test-id");
        expect(result.data).toEqual({ name: "Test" });
        expect(result).not.toHaveProperty("undefinedField");
    });

    it("should handle empty arrays", () => {
        const input = {
            emails: [],
            otherField: "value",
        };

        const result = stripUndefinedKeys(input);

        expect(Array.isArray(result.emails)).toBe(true);
        expect(result.emails).toEqual([]);
        expect(result.otherField).toBe("value");
    });

    it("should handle arrays with mixed types", () => {
        const input = {
            items: [1, "string", { nested: "object" }, null],
            otherField: "value",
        };

        const result = stripUndefinedKeys(input);

        expect(Array.isArray(result.items)).toBe(true);
        expect(result.items).toEqual([1, "string", { nested: "object" }, null]);
    });

    it("should preserve arrays in nested structures", () => {
        const input = {
            data: {
                emails: ["email1@example.com", "email2@example.com"],
                other: "value",
            },
            attachments: [
                { fileName: "test.txt", content: "base64content" },
            ],
        };

        const result = stripUndefinedKeys(input);

        // Note: stripUndefinedKeys only works on the top level
        // Nested objects are preserved as-is
        expect(Array.isArray(result.attachments)).toBe(true);
        expect(Array.isArray((result.data as any).emails)).toBe(true);
    });

    it("should work correctly for normal objects without arrays", () => {
        const input = {
            name: "Alice",
            age: undefined,
            city: "Wonderland",
            country: undefined,
            active: true,
            count: 42,
        };

        const result = stripUndefinedKeys(input);

        expect(result).toEqual({
            name: "Alice",
            city: "Wonderland",
            active: true,
            count: 42,
        });
        expect(result).not.toHaveProperty("age");
        expect(result).not.toHaveProperty("country");
    });

    it("should preserve all value types correctly", () => {
        const input = {
            string: "test",
            number: 123,
            boolean: true,
            nullValue: null,
            array: [1, 2, 3],
            object: { nested: "value" },
            undefinedValue: undefined,
        };

        const result = stripUndefinedKeys(input);

        expect(result.string).toBe("test");
        expect(result.number).toBe(123);
        expect(result.boolean).toBe(true);
        expect(result.nullValue).toBeNull();
        expect(Array.isArray(result.array)).toBe(true);
        expect(result.object).toEqual({ nested: "value" });
        expect(result).not.toHaveProperty("undefinedValue");
    });

    it("should remove undefined values", () => {
        const input = {
            defined: "value",
            undefinedField: undefined,
            nullField: null,
            emptyString: "",
            zero: 0,
            falseValue: false,
        };

        const result = stripUndefinedKeys(input);

        expect(result).toHaveProperty("defined");
        expect(result).not.toHaveProperty("undefinedField");
        expect(result).toHaveProperty("nullField"); // null is not undefined
        expect(result).toHaveProperty("emptyString");
        expect(result).toHaveProperty("zero");
        expect(result).toHaveProperty("falseValue");
    });
});

