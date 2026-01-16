import { SkillDisplay, UserSkills } from "./skills.models";
import { UserLocation } from "./user-location.model";

export interface UserSwapDTO {
  username: string;
  profilePhotoUrl: string;

  skill: SkillDisplay;

  isSwapMatch: boolean;
  rating: number;
  distance: string;
}
