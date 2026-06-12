import "server-only";

import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

import { getSql } from "@/lib/db";
import type { AccountRow } from "@/lib/types";

const globalForAccounts = globalThis as typeof globalThis & {
  accountSchemaReady?: Promise<void>;
};

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPasswordHash(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const derived = scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, "hex");

  if (derived.length !== stored.length) {
    return false;
  }

  return timingSafeEqual(derived, stored);
}

export async function ensureAccountSchema() {
  if (!globalForAccounts.accountSchemaReady) {
    const sql = getSql();

    globalForAccounts.accountSchemaReady = (async () => {
      await sql`
        create table if not exists accounts (
          id text primary key,
          username text not null unique,
          password_hash text not null,
          created_at timestamptz not null default now()
        )
      `;
      await sql`alter table participants add column if not exists account_id text`;
      await sql`create index if not exists participants_account_id_idx on participants(account_id)`;
    })();
  }

  await globalForAccounts.accountSchemaReady;
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export async function getAccountById(accountId: string) {
  await ensureAccountSchema();
  const sql = getSql();
  const rows = await sql<AccountRow[]>`
    select id, username, password_hash, created_at
    from accounts
    where id = ${accountId}
    limit 1
  `;

  return rows[0] ?? null;
}

export async function getAccountByUsername(username: string) {
  await ensureAccountSchema();
  const sql = getSql();
  const rows = await sql<AccountRow[]>`
    select id, username, password_hash, created_at
    from accounts
    where username = ${normalizeUsername(username)}
    limit 1
  `;

  return rows[0] ?? null;
}

export async function createAccount(input: { username: string; password: string }) {
  await ensureAccountSchema();
  const sql = getSql();
  const normalizedUsername = normalizeUsername(input.username);
  const existingAccount = await getAccountByUsername(normalizedUsername);

  if (existingAccount) {
    throw new Error("Dieser Login-Name ist bereits vergeben.");
  }

  const rows = await sql<AccountRow[]>`
    insert into accounts (id, username, password_hash)
    values (
      ${randomUUID()},
      ${normalizedUsername},
      ${hashPassword(input.password)}
    )
    returning id, username, password_hash, created_at
  `;

  return rows[0] ?? null;
}

export async function authenticateAccount(input: { username: string; password: string }) {
  const account = await getAccountByUsername(input.username);

  if (!account) {
    return null;
  }

  if (!verifyPasswordHash(input.password, account.password_hash)) {
    return null;
  }

  return account;
}
