import { interests } from "./interests.model";
import { UserLocation } from "./user-location.model";
import { userSkillDTO } from "./userSkillDTO.model";

export interface UserSwapDTO {
  userId: string;
  name: string;
  username: string;
  profilePhotoUrl: string;
  location: UserLocation;

  skillName: string;
  skillIcon: string;
  skillLevel: number;
  skillCategory: string;

  isSwapMatch: boolean;
  rating: number;
  distance: string;

  // lista opcional de skills que viene del back
  userSkills?: userSkillDTO[];
  interests?: interests[];
}