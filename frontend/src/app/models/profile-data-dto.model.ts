import { UserSkills } from './user-skills.model';
export interface ProfileDataDTO {
  name: string;
  surname : string;
  username: string;
  location: string;
  description: string;
  interests: Array<UserSkills>
  skills: Array<UserSkills>;
  profilePhotoUrl: string;
}
