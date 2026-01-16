import { UserSkills } from './skills.models';
import { UserLocation } from './user.models';
export interface ProfileDataDTO {
    name: string;
    surname: string;
    username: string;
    location: UserLocation;
    description: string;
    interests: Array<UserSkills>
    skills: Array<UserSkills>;
    profilePhotoUrl: string;
}

export interface PrivateProfileData {
    fullName: string;
    username: string;
    location: UserLocation;
    description: string;
    profilePhotoUrl: string;
    rating: number;
}

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

export interface DropdownMenuData {
    fullName: string;
    username: string;
    profilePhotoUrl: string;
    rating: number;
}

export interface SkillData {
    interests: { id: string, level: number }[];
    skills?: { id: string, level: number }[];
}

export interface RecoveryData {
    id?: string;
    code?: string;
    email?: string;
}

export interface AllUserData {
    name: string;
    surname: string;
    birthDate: Date;
    gender: string;
    location: UserLocation;
    phone: number;
}