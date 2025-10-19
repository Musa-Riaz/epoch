export interface IUserResponse {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'member' | 'admin' | 'manager';
    profilePictureUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LoginResponse {
    message: string;
    user: IUserResponse;
    accessToken: string;
}

export interface SignupResponse {
    message: string;
    user: IUserResponse;
    accessToken?: string;

}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  profilePicture?: string | null;
}
