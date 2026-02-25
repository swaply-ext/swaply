import { UserLocation } from "./user-location.model";
import { userSkillDTO } from "./userSkillDTO.model";

export interface UserSwapDTO {
  userId: string;
  name: string;
  username: string;
  profilePhotoUrl: string;
  location: string;
  //ESTO TIENE QUE SER UserLocation MAS ADELANTE, HAY QUE CAMBIAR EN BACKEND
  isPremium?: boolean;

  skillName: string;
  skillIcon: string;
  skillLevel: number;
  skillCategory: string;

  isSwapMatch: boolean;
  rating: number;
  distance: string;

  // lista opcional de skills que viene del back
  userSkills?: userSkillDTO[];
  interests?: userSkillDTO[];
}