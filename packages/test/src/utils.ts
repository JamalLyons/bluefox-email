import "dotenv/config";

const env = {
  API_KEY: process.env.BLUEFOX_API_KEY,
  SUBSCRIBER_LIST: process.env.SUBSCRIBER_LIST,
  EMAIL_ADDRESS: process.env.EMAIL_ADDRESS,
  TRANSACTIONAL_ID: process.env.TRANSACTIONAL_ID,
} as const;

type Env = typeof env;

export function getEnv(key: keyof Env): string {
  validateEnvVariables(env);
  const value = env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set.`);
  }
  return value;
}

/**
 * Validates that all environment variables in the provided object are set and not null or undefined.
 *
 * @param obj - An object containing environment variables to validate.
 * @throws Error if any environment variable is missing (null or undefined).
 */
function validateEnvVariables(obj: Record<string, any>): void {
  const missingKeys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    throw new Error(`Missing values for keys: ${missingKeys.join(", ")}`);
  }
}
