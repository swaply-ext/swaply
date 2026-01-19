import { SkillDisplay } from "./skills.models";

export interface RecommendationDTO {
  username: string;
  profilePhotoUrl: string;

  skill: SkillDisplay;

  isSwapMatch: boolean;
  rating: number;
  distance: string;
}
