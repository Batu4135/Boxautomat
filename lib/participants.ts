import "server-only";

import { getSql } from "@/lib/db";
import type {
  Gender,
  LeaderboardParticipant,
  ParticipantRow,
  ParticipantViewStatus,
  TrendDirection
} from "@/lib/types";

function normalizeParticipantKey(name: string, gender: Gender) {
  return `${gender}:${name.trim().toLocaleLowerCase("de-DE")}`;
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
  const highestByPerson = new Map<string, ParticipantRow>();

  for (const row of rows) {
    const key = normalizeParticipantKey(row.name, row.gender);
    const existing = highestByPerson.get(key);

    if (!existing) {
      highestByPerson.set(key, row);
      continue;
    }

    const currentScore = row.score ?? 0;
    const existingScore = existing.score ?? 0;

    if (
      currentScore > existingScore ||
      (currentScore === existingScore &&
        new Date(row.created_at).getTime() < new Date(existing.created_at).getTime())
    ) {
      highestByPerson.set(key, row);
    }
  }

  const deduplicatedRows = Array.from(highestByPerson.values()).sort((left, right) => {
    const scoreDelta = (right.score ?? 0) - (left.score ?? 0);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
  });

  return deduplicatedRows.map((participant, index, list): LeaderboardParticipant => {
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
    created_at: entry.created_at
  }));

  boardRows.push(participant);

  return buildLeaderboard(boardRows);
}

export function getParticipantPerspectiveLeaderboard(
  leaderboard: Awaited<ReturnType<typeof getLeaderboardParticipants>>,
  participantStatus: ParticipantViewStatus | null
) {
  if (!participantStatus || participantStatus.state !== "pending" || !participantStatus.leaderboardEntry) {
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
  const sql = getSql();

  if (whereClause) {
    return sql<ParticipantRow[]>`
      select id, name, gender, phone, approved, score, photo_content_type, photo_filename, created_at
      from participants
      where gender = ${whereClause}
      order by approved asc, created_at desc
    `;
  }

  return sql<ParticipantRow[]>`
    select id, name, gender, phone, approved, score, photo_content_type, photo_filename, created_at
    from participants
    order by approved asc, created_at desc
  `;
}

export async function getLeaderboardParticipants() {
  const sql = getSql();
  const rows = await sql<ParticipantRow[]>`
    select id, name, gender, phone, approved, score, photo_content_type, photo_filename, created_at
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
}) {
  const sql = getSql();
  const rows = await sql<ParticipantRow[]>`
    insert into participants (name, gender, phone, score, photo_data, photo_content_type, photo_filename)
    values (
      ${input.name},
      ${input.gender},
      ${input.phone || null},
      ${input.score},
      ${input.photoData},
      ${input.photoContentType},
      ${input.photoFileName}
    )
    returning id, name, gender, phone, approved, score, photo_content_type, photo_filename, created_at
  `;

  const participant = rows[0];

  if (!participant) {
    throw new Error("Teilnehmer konnte nicht erstellt werden.");
  }

  return participant;
}

export async function approveParticipant(id: string) {
  const sql = getSql();
  await sql`
    update participants
    set approved = true
    where id = ${id}
  `;
}

export async function updateParticipantScore(id: string, nextScore: number) {
  const sql = getSql();
  await sql`
    update participants
    set approved = true, score = ${nextScore}
    where id = ${id}
  `;
}

export async function deleteParticipant(id: string) {
  const sql = getSql();
  await sql`
    delete from participants
    where id = ${id}
  `;
}

export async function getParticipantById(id: string) {
  const sql = getSql();
  const rows = await sql<ParticipantRow[]>`
    select id, name, gender, phone, approved, score, photo_content_type, photo_filename, created_at
    from participants
    where id = ${id}
    limit 1
  `;

  return rows[0] ?? null;
}

export async function getParticipantPhotoById(id: string) {
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
