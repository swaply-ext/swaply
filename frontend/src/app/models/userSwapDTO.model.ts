import { SkillDisplay } from "./skills.models";
import { UserLocation } from "./user-location.model";

export interface UserSwapDTO {
  userId: string;
  name: string;
  username: string;
  profilePhotoUrl: string;
  location: UserLocation;

  skill: SkillDisplay;

  isSwapMatch: boolean;
  rating: number;
  distance: string;

  // lista opcional de skills que viene del back
  userSkills?: SkillDisplay[];
  interests?: SkillDisplay[];
}
