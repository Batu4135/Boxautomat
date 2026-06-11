export type Gender = "female" | "male";

export type ParticipantRow = {
  id: string;
  name: string;
  gender: Gender;
  phone: string | null;
  approved: boolean;
  score: number | null;
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
