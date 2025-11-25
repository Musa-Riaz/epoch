export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'user' | 'admin' | 'manager';
    profilePicture?: string;
    createdAt: string;
    updatedAt: string;
}

// export interface Project {
//     id: string;
//     name: string;
//     description?: string;
//     ownerId: string;
//     createdAt: string;
//     updatedAt: string;
//     members: User[];

// }

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string; 
  
  details?: any; 
  message?: string;
}