export type SessionType = {
  sid: string;
  email: string;
};

export type RecordType = {
  id: string;
  user_email: string;
  title: string;
  priority: "low" | "medium" | "high";
  created_at: string;
};
