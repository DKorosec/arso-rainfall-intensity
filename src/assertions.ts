export function assertNotNull<T>(test: T, message: string): asserts test is NonNullable<T> {
    if (test === null) {
        throw new Error(message);
    }
}