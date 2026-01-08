import { UserLocation } from "./user-location.model";
import { UserSkills } from "./user-skills.model";
export interface SwapProfileData {
  title: string;
  imgToTeach: string;
  profilePhotoUrl: string;
  location: UserLocation;
  username: string;
  rating: number;
  skills: UserSkills[];
}
