// Type definitions for Deno Edge Functions
// These are provided by Deno runtime, TypeScript may show errors but they work at runtime

export { };

declare global {
    const Deno: {
        env: {
            get(key: string): string | undefined;
        };
    };
}
