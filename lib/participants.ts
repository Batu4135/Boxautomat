import "server-only";

import { getSql } from "@/lib/db";
import { ensureAccountSchema } from "@/lib/accounts";
import type {
  Gender,
  LeaderboardParticipant,
  ParticipantRow,
  ParticipantViewStatus,
  TrendDirection
} from "@/lib/types";

const globalForParticipants = globalThis as typeof globalThis & {
  participantSchemaReady?: Promise<void>;
};

async function ensureParticipantSchema() {
  if (!globalForParticipants.participantSchemaReady) {
    const sql = getSql();

    globalForParticipants.participantSchemaReady = (async () => {
      await ensureAccountSchema();
      await sql`alter table participants add column if not exists owner_token text`;
      await sql`alter table participants add column if not exists recovery_code text`;
      await sql`create index if not exists participants_owner_token_idx on participants(owner_token)`;
      await sql`create index if not exists participants_recovery_code_idx on participants(recovery_code)`;
    })();
  }

  await globalForParticipants.participantSchemaReady;
}

function normalizeParticipantKey(name: string, gender: Gender) {
  return `${gender}:${name.trim().toLocaleLowerCase("de-DE")}`;
}

function normalizeRecoveryCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function toTrend(rank: number, total: number): TrendDirection {
  if (total <= 2) {
    return rank === 1 ? "up" : "down";
  }

  if (rank <= Math.max(1, Math.ceil(total / 3))) {
    return "up";
  }

  if (rank > Math.floor((total * 2) / 3)) {
    return "down";
  }

  return "steady";
}

function buildLeaderboard(rows: ParticipantRow[]) {
  const sortedRows = [...rows].sort((left, right) => {
    const scoreDelta = (right.score ?? 0) - (left.score ?? 0);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
  });

  return sortedRows.map((participant, index, list): LeaderboardParticipant => {
    const nextParticipant = list[index + 1];

    return {
      ...participant,
      rank: index + 1,
      trend: toTrend(index + 1, list.length),
      gapToNext:
        nextParticipant && participant.score !== null && nextParticipant.score !== null
          ? participant.score - nextParticipant.score
          : null
    };
  });
}

function buildProjectedLeaderboard(
  approvedParticipants: LeaderboardParticipant[],
  participant: ParticipantRow
) {
  const boardRows: ParticipantRow[] = approvedParticipants.map((entry) => ({
    id: entry.id,
    name: entry.name,
    gender: entry.gender,
    phone: entry.phone,
    approved: entry.approved,
    score: entry.score,
    photo_content_type: entry.photo_content_type,
    photo_filename: entry.photo_filename,
    account_id: entry.account_id ?? null,
    owner_token: entry.owner_token ?? null,
    recovery_code: entry.recovery_code ?? null,
    created_at: entry.created_at
  }));

  boardRows.push(participant);

  return buildLeaderboard(boardRows);
}

export function getParticipantPerspectiveLeaderboard(
  leaderboard: Awaited<ReturnType<typeof getLeaderboardParticipants>>,
  participantStatus: ParticipantViewStatus | null
) {
  if (
    !participantStatus ||
    participantStatus.state !== "pending" ||
    !participantStatus.leaderboardEntry
  ) {
    return leaderboard;
  }

  const relevantBoard =
    participantStatus.participant.gender === "female" ? leaderboard.female : leaderboard.male;
  const projectedBoard = buildProjectedLeaderboard(relevantBoard, participantStatus.participant);

  return {
    ...leaderboard,
    female: participantStatus.participant.gender === "female" ? projectedBoard : leaderboard.female,
    male: participantStatus.participant.gender === "male" ? projectedBoard : leaderboard.male,
    all: [
      ...(participantStatus.participant.gender === "female" ? projectedBoard : leaderboard.female),
      ...(participantStatus.participant.gender === "male" ? projectedBoard : leaderboard.male)
    ].sort((left, right) => {
      const scoreDelta = (right.score ?? 0) - (left.score ?? 0);

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
    })
  };
}

async function queryParticipants(whereClause?: Gender) {
  await ensureParticipantSchema();
  const sql = getSql();

  if (whereClause) {
    return sql<ParticipantRow[]>`
      select id, name, gender, phone, approved, score, photo_content_type, photo_filename, account_id, owner_token, recovery_code, created_at
      from participants
      where gender = ${whereClause}
      order by approved asc, created_at desc
    `;
  }

  return sql<ParticipantRow[]>`
    select id, name, gender, phone, approved, score, photo_content_type, photo_filename, account_id, owner_token, recovery_code, created_at
    from participants
    order by approved asc, created_at desc
  `;
}

export async function getLeaderboardParticipants() {
  await ensureParticipantSchema();
  const sql = getSql();
  const rows = await sql<ParticipantRow[]>`
    select id, name, gender, phone, approved, score, photo_content_type, photo_filename, account_id, owner_token, recovery_code, created_at
    from participants
    where approved = true and score is not null
    order by score desc, created_at asc
  `;

  const female = buildLeaderboard(rows.filter((participant) => participant.gender === "female"));
  const male = buildLeaderboard(rows.filter((participant) => participant.gender === "male"));

  return {
    female,
    male,
    all: [...female, ...male].sort((left, right) => {
      const scoreDelta = (right.score ?? 0) - (left.score ?? 0);

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
    })
  };
}

export async function getParticipantSummary() {
  await ensureParticipantSchema();
  const sql = getSql();
  const rows = await sql<Array<{ name: string; gender: Gender }>>`
    select name, gender
    from participants
  `;

  const uniqueParticipants = new Set(
    rows.map((participant) => normalizeParticipantKey(participant.name, participant.gender))
  );

  return {
    participantCount: uniqueParticipants.size,
    entryCount: rows.length
  };
}

export async function getAdminParticipants(filter: Gender | "all" = "all") {
  return filter === "all" ? queryParticipants() : queryParticipants(filter);
}

export async function createParticipant(input: {
  name: string;
  gender: Gender;
  phone?: string;
  score: number;
  photoData: Buffer;
  photoContentType: string;
  photoFileName: string;
  accountId?: string;
  ownerToken?: string;
  recoveryCode?: string;
}) {
  await ensureParticipantSchema();
  const sql = getSql();
  const rows = await sql<ParticipantRow[]>`
    insert into participants (
      name,
      gender,
      phone,
      approved,
      score,
      photo_data,
      photo_content_type,
      photo_filename,
      account_id,
      owner_token,
      recovery_code
    )
    values (
      ${input.name},
      ${input.gender},
      ${input.phone || null},
      ${true},
      ${input.score},
      ${input.photoData},
      ${input.photoContentType},
      ${input.photoFileName},
      ${input.accountId || null},
      ${input.ownerToken || null},
      ${input.recoveryCode ? normalizeRecoveryCode(input.recoveryCode) : null}
    )
    returning id, name, gender, phone, approved, score, photo_content_type, photo_filename, account_id, owner_token, recovery_code, created_at
  `;

  const participant = rows[0];

  if (!participant) {
    throw new Error("Teilnehmer konnte nicht erstellt werden.");
  }

  return participant;
}

export async function updateParticipantSubmission(input: {
  id: string;
  name: string;
  gender: Gender;
  phone?: string;
  score: number;
  photoData?: Buffer;
  photoContentType?: string;
  photoFileName?: string;
  accountId?: string;
  ownerToken?: string;
  recoveryCode?: string;
}) {
  await ensureParticipantSchema();
  const sql = getSql();

  const rows = input.photoData
    ? await sql<ParticipantRow[]>`
        update participants
        set
          name = ${input.name},
          gender = ${input.gender},
          phone = ${input.phone || null},
          score = ${input.score},
          approved = true,
          photo_data = ${input.photoData},
          photo_content_type = ${input.photoContentType || null},
          photo_filename = ${input.photoFileName || null},
          account_id = coalesce(${input.accountId || null}, account_id),
          owner_token = coalesce(${input.ownerToken || null}, owner_token),
          recovery_code = coalesce(${input.recoveryCode ? normalizeRecoveryCode(input.recoveryCode) : null}, recovery_code)
        where id = ${input.id}
        returning id, name, gender, phone, approved, score, photo_content_type, photo_filename, account_id, owner_token, recovery_code, created_at
      `
    : await sql<ParticipantRow[]>`
        update participants
        set
          name = ${input.name},
          gender = ${input.gender},
          phone = ${input.phone || null},
          score = ${input.score},
          approved = true,
          account_id = coalesce(${input.accountId || null}, account_id),
          owner_token = coalesce(${input.ownerToken || null}, owner_token),
          recovery_code = coalesce(${input.recoveryCode ? normalizeRecoveryCode(input.recoveryCode) : null}, recovery_code)
        where id = ${input.id}
        returning id, name, gender, phone, approved, score, photo_content_type, photo_filename, account_id, owner_token, recovery_code, created_at
      `;

  const participant = rows[0];

  if (!participant) {
    throw new Error("Teilnehmer konnte nicht aktualisiert werden.");
  }

  return participant;
}

export async function approveParticipant(id: string) {
  await ensureParticipantSchema();
  const sql = getSql();
  await sql`
    update participants
    set approved = true
    where id = ${id}
  `;
}

export async function updateParticipantScore(id: string, nextScore: number) {
  await ensureParticipantSchema();
  const sql = getSql();
  await sql`
    update participants
    set approved = true, score = ${nextScore}
    where id = ${id}
  `;
}

export async function deleteParticipant(id: string) {
  await ensureParticipantSchema();
  const sql = getSql();
  await sql`
    delete from participants
    where id = ${id}
  `;
}

export async function getParticipantsByIds(ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  await ensureParticipantSchema();
  const sql = getSql();
  const rows = await sql<ParticipantRow[]>`
    select id, name, gender, phone, approved, score, photo_content_type, photo_filename, account_id, owner_token, recovery_code, created_at
    from participants
    where id in ${sql(ids)}
    order by created_at desc
  `;

  return rows;
}

export async function getParticipantsByAccountId(accountId: string) {
  if (!accountId.trim()) {
    return [];
  }

  await ensureParticipantSchema();
  const sql = getSql();
  const rows = await sql<ParticipantRow[]>`
    select id, name, gender, phone, approved, score, photo_content_type, photo_filename, account_id, owner_token, recovery_code, created_at
    from participants
    where account_id = ${accountId.trim()}
    order by created_at desc
  `;

  return rows;
}

export async function getParticipantsByOwnerToken(ownerToken: string) {
  if (!ownerToken.trim()) {
    return [];
  }

  await ensureParticipantSchema();
  const sql = getSql();
  const rows = await sql<ParticipantRow[]>`
    select id, name, gender, phone, approved, score, photo_content_type, photo_filename, account_id, owner_token, recovery_code, created_at
    from participants
    where owner_token = ${ownerToken.trim()}
    order by created_at desc
  `;

  return rows;
}

export async function assignOwnershipToParticipants(
  participantIds: string[],
  ownerToken: string,
  recoveryCode?: string
) {
  if (participantIds.length === 0 || !ownerToken.trim()) {
    return;
  }

  await ensureParticipantSchema();
  const sql = getSql();

  await sql`
    update participants
    set
      owner_token = ${ownerToken.trim()},
      recovery_code = coalesce(${recoveryCode ? normalizeRecoveryCode(recoveryCode) : null}, recovery_code)
    where id in ${sql(participantIds)}
  `;
}

export async function assignAccountToParticipants(participantIds: string[], accountId: string) {
  if (participantIds.length === 0 || !accountId.trim()) {
    return;
  }

  await ensureParticipantSchema();
  const sql = getSql();

  await sql`
    update participants
    set account_id = ${accountId.trim()}
    where id in ${sql(participantIds)}
  `;
}

export async function getParticipantsByRecoveryCode(recoveryCode: string) {
  const normalizedCode = normalizeRecoveryCode(recoveryCode);

  if (!normalizedCode) {
    return [];
  }

  await ensureParticipantSchema();
  const sql = getSql();
  const rows = await sql<ParticipantRow[]>`
    select id, name, gender, phone, approved, score, photo_content_type, photo_filename, account_id, owner_token, recovery_code, created_at
    from participants
    where recovery_code = ${normalizedCode}
    order by created_at desc
  `;

  return rows;
}

export async function getParticipantById(id: string) {
  await ensureParticipantSchema();
  const sql = getSql();
  const rows = await sql<ParticipantRow[]>`
    select id, name, gender, phone, approved, score, photo_content_type, photo_filename, account_id, owner_token, recovery_code, created_at
    from participants
    where id = ${id}
    limit 1
  `;

  return rows[0] ?? null;
}

export async function getParticipantPhotoById(id: string) {
  await ensureParticipantSchema();
  const sql = getSql();
  const rows = await sql<Array<{ photo_data: Buffer | null; photo_content_type: string | null }>>`
    select photo_data, photo_content_type
    from participants
    where id = ${id}
    limit 1
  `;

  const photo = rows[0];

  if (!photo?.photo_data || !photo.photo_content_type) {
    return null;
  }

  return {
    photo_data: photo.photo_data,
    photo_content_type: photo.photo_content_type
  };
}

export async function getParticipantStatus(id: string) {
  const participant = await getParticipantById(id);

  if (!participant) {
    return null;
  }

  if (!participant.approved) {
    const leaderboard = await getLeaderboardParticipants();
    const relevantBoard = participant.gender === "female" ? leaderboard.female : leaderboard.male;
    const projectedBoard =
      participant.score !== null ? buildProjectedLeaderboard(relevantBoard, participant) : [];
    const participantKey = normalizeParticipantKey(participant.name, participant.gender);
    const leaderboardEntry =
      participant.score !== null
        ? projectedBoard.find(
            (entry) => normalizeParticipantKey(entry.name, entry.gender) === participantKey
          ) ?? null
        : null;

    return {
      state: "pending",
      participant,
      leaderboardEntry,
      total: projectedBoard.length
    } satisfies ParticipantViewStatus;
  }

  if (participant.score === null) {
    return {
      state: "approved",
      participant
    } satisfies ParticipantViewStatus;
  }

  const leaderboard = await getLeaderboardParticipants();
  const relevantBoard = participant.gender === "female" ? leaderboard.female : leaderboard.male;
  const participantKey = normalizeParticipantKey(participant.name, participant.gender);
  const leaderboardEntry = relevantBoard.find(
    (entry) => normalizeParticipantKey(entry.name, entry.gender) === participantKey
  );

  if (!leaderboardEntry) {
    return {
      state: "approved",
      participant
    } satisfies ParticipantViewStatus;
  }

  return {
    state: "ranked",
    participant,
    leaderboardEntry,
    total: relevantBoard.length
  } satisfies ParticipantViewStatus;
}
