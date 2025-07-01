export type WorkStatus = "looking" | "passive" | "not_looking";

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  workStatus: WorkStatus;
}

export const AVAILABILITY_MESSAGE_TYPE = 'AVAILABILITY_MESSAGE_TYPE';