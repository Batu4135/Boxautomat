import "server-only";

export const REQUIRED_ENV_NAMES = [
  "DATABASE_URL",
  "ADMIN_PASSWORD"
] as const;

type RequiredEnvName = (typeof REQUIRED_ENV_NAMES)[number];

function getEnvValue(name: RequiredEnvName) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getDatabaseUrl() {
  const directUrl = process.env.DATABASE_URL;
  const vercelPostgresUrl = process.env.POSTGRES_URL;

  if (directUrl) {
    return directUrl;
  }

  if (vercelPostgresUrl) {
    return vercelPostgresUrl;
  }

  throw new Error("Missing environment variable: DATABASE_URL");
}

export function getAdminPassword() {
  return getEnvValue("ADMIN_PASSWORD");
}

export function getMissingEnvVars() {
  return REQUIRED_ENV_NAMES.filter((name) => {
    if (name === "DATABASE_URL") {
      return !process.env.DATABASE_URL && !process.env.POSTGRES_URL;
    }

    return !process.env[name];
  });
}

export function hasRequiredEnvVars() {
  return getMissingEnvVars().length === 0;
}
