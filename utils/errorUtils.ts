// Handles GraphQL errors by throwing the first available message
export const handleGraphQLErrors = (errors: { message?: string }[]) => {
  throw new Error(errors?.[0]?.message || "GraphQL Error");
};

// Throws if no data is returned from GraphQL
export const handleNoData = () => {
  throw new Error("No data received from GraphQL endpoint");
};

// Throws if a required parameter is missing
export const throwMissingParamError = (paramName: string): never => {
  throw new Error(`Missing required parameter: ${paramName}`);
};

// Generic error handler for Amplify GraphQL (no Axios)
export const handleAmplifyError = (error: unknown): never => {
  // Amplify GraphQL always throws a normal JS Error
  if (error instanceof Error) {
    throw new Error(error.message || "Unexpected error occurred");
  }

  // GraphQL error arrays (edge case)
  if (Array.isArray(error)) {
    const message = error[0]?.message ?? "GraphQL Error";
    throw new Error(message);
  }

  throw new Error("Unknown error occurred");
};

// Extract readable error message
export const ExtractErrorMessage = (
  error: unknown,
  fallback = "Something went wrong"
): string => {
  if (!error) return fallback;

  if (typeof error === "string") {
    try {
      const parsed = JSON.parse(error);
      return parsed?.message || error;
    } catch {
      return error;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
