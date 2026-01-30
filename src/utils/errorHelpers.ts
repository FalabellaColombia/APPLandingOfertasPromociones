// Checks if a given error object is a Postgres error by verifying it has a `code` property of type string.
// Useful for distinguishing database errors from other types of errors in type-safe way.
export function isPostgresError(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
  );
}
