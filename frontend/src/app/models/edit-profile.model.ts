import { UserLocation } from './user-location.model';
import { UserSkills } from './user-skills.model';

export interface EditProfileData {
  name: string;
  surname: string;
  username: string;
  description: string;
  birthDate: string;
  location: UserLocation | string;
  gender: string;
  email: string;
  profilePhotoUrl: string;
  interests: UserSkills[];
  skills: UserSkills[];
}