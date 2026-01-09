import { userSkillDTO } from "./userSkillDTO.model";
import { UserLocation } from "./user.models";

export interface Swap {
  id: string;
  requestedUserId: string;
  skill: string;
  interest: string;
  status: 'ACCEPTED' | 'STANDBY' | 'DENIED';
  isRequester: boolean;
}

export interface NextSwap {
  // userId?: string;
  username?: string; //per la ruta /user/:username
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

  // lista opcional de skills que viene del back
  userSkills?: userSkillDTO[];
  interests?: userSkillDTO[];
}