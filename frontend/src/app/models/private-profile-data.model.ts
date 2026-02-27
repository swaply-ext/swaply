import { UserLocation } from "./user-location.model";
export interface PrivateProfileData {
  fullName: string;
  username: string;
  location: UserLocation;
  description: string;
  profilePhotoUrl: string;
  rating: number;
  isPremium?: boolean;
}
