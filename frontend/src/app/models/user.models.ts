import { SkillDisplay } from "./skills.models";

export interface UserLogin {
    email: string;
    password: string;
}

export interface UserRegister {
    username: string;
    email: string;
    password: string;
    acceptedTerms: boolean;
}

export interface UserRegisterDTO {
  username: string;
  email: string;
  password: string;
}

export interface UserLocation {
    placeId: string;
    lat: number;
    lon: number;
    displayName: string;
}

export interface UserAvatarOption {
    id: number | string;
    type: 'image' | 'upload-action';
    imageUrl?: string;
}

export interface UserSwap {
    username: string;
    skills?: SkillDisplay[];
}

export interface UserSearchItem {
    id: string;
    username: string;
    profilePhotoUrl?: string;
}
