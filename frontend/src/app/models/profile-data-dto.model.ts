import { UserSkills } from './user-skills.model';
import { UserLocation } from './user-location.model';
export interface ProfileDataDTO {
  name: string;
  surname : string;
  username: string;
  location: UserLocation;
  description: string;
  interests: Array<UserSkills>
  skills: Array<UserSkills>;
  profilePhotoUrl: string;
}
