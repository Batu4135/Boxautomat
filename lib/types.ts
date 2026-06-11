export type Gender = "female" | "male";

export type ParticipantRow = {
  id: string;
  name: string;
  gender: Gender;
  phone: string | null;
  approved: boolean;
  score: number | null;
  photo_content_type: string | null;
  photo_filename: string | null;
  owner_token?: string | null;
  recovery_code?: string | null;
  created_at: string;
};

export type TrendDirection = "up" | "steady" | "down";

export type LeaderboardParticipant = ParticipantRow & {
  rank: number;
  trend: TrendDirection;
  gapToNext: number | null;
};

export type ParticipantViewStatus =
  | {
      state: "pending";
      participant: ParticipantRow;
      leaderboardEntry: LeaderboardParticipant | null;
      total: number;
    }
  | {
      state: "approved";
      participant: ParticipantRow;
    }
  | {
      state: "ranked";
      participant: ParticipantRow;
      leaderboardEntry: LeaderboardParticipant;
      total: number;
    };
