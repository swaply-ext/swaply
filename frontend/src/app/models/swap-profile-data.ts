import { UserLocation } from "./user-location.model";
import { UserSkills } from "./skills.models";
export interface SwapProfileData {
  title: string;
  imgToTeach: string;
  profilePhotoUrl: string;
  location: UserLocation;
  username: string;
  rating: number;
  skills: UserSkills[];
}
