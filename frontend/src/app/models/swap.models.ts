import { userSkillDTO } from "./userSkillDTO.model";
import { UserLocation } from "./user.models";
import { UserSkills } from "./skills.models";

export interface Swap {
  id: string;
  requestedUserId: string;
  skill: string;
  interest: string;
  status: 'ACCEPTED' | 'STANDBY' | 'DENIED';
  isRequester: boolean;
}

export interface NextSwap {
  username?: string; 
  userAvatar: string;
  skillTitle: string;
  skillImage?: string;
  skillIcon?: string;
  distance: string;
  rating: number;
  isMatch: boolean;
}

export interface SwapProfileData {
  title: string;
  imgToTeach: string;
  profilePhotoUrl: string;
  location: UserLocation;
  username: string;
  rating: number;
  skills: UserSkills[];
}

export interface SwapDTO {
  requestedUsername: string;
  skill: string;
  interest: string;
}


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

  userSkills?: userSkillDTO[];
  interests?: userSkillDTO[];
}