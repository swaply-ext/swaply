import { UserLocation } from "./user-location.model";
export interface ProfileData {
  fullName: string;
  username: string;
  location: UserLocation;
  description: string;
  profilePhotoUrl: string;
  rating: number;
}