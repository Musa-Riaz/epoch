import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { authApi } from '@/lib/api';
import { IUserResponse, SignupRequest } from '@/interfaces/api';
import { getErrorMessage } from '@/utils/helpers.utils';


interface AuthState {
    user: IUserResponse | null;
    users: IUserResponse[];
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthActions {
    login: (email: string, password: string) => Promise<void>;
    signup: (userData: SignupRequest) => Promise<void>;
    logout: () => void;
    setUser: (user: IUserResponse) => void;
    getUserById: (id: string) => Promise<IUserResponse | null>;
    getAllUsers: () => Promise<IUserResponse[]>;
    getManagerAnalytics: (id: string) => Promise<{ totalProjects: number; totalMembers: number } | null>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
    devtools(
        persist((set) => ({
            user: null,
            users: [],
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email: string, password: string) => {
                set({isLoading: true, error: null});
                try{ 
                    const res = await authApi.login(email, password);
                    const {user, accessToken} = res.data.data
                    set({user, token: accessToken, isAuthenticated: true, isLoading: false});
                }
                catch(err : unknown){
                    set({ isLoading: false, error: getErrorMessage(err) })
                    throw err;
                }
            }
,
            signup: async (userData: SignupRequest) => {
                set({isLoading: true, error: null});
                try {
                         await authApi.signup(
                        userData.firstName,
                        userData.lastName,
                        userData.email,
                        userData.password,
                        userData.role,
                        userData.profilePicture

                    )
                }
                catch(err: unknown) {
                    set({ isLoading: false, error: getErrorMessage(err) })
                    throw err;
                }
            },

            updateProfile: async (userId: string, profileData: Partial<IUserResponse>)=> {
                set({ isLoading: true, error: null});
                try {
                    const res = (await authApi.updateProfile(userId, profileData)).data.data;
                    set({user: res, isLoading: false });
                    return res;
                }
                catch(err){
                    set({ isLoading: false, error: getErrorMessage(err) });
                    throw err;
                }
            }
,
            getAllUsers: async () => {
                set({ isLoading: true, error: null});
                try{
                    const response = (await authApi.getAllUsers()).data.data;
                    set({users: response, isLoading: false})
                    return response;
                }
                catch(err){
                    set({
                        error: getErrorMessage(err),
                        isLoading: false
                    });
                    return null;
                }
            },

            getUserById: async (id: string) => {
                set({ isLoading: true, error: null});
                try {
                    const res = (await authApi.getUserById(id)).data.data;
                    set({user: res, isLoading: false });
                    return res;
                }
                catch ( err ) {
                    set({
                        error: getErrorMessage(err),
                        isLoading: false
                    })
                    return null;
                }
            },

            logout: () => {
                set({
                    user: null,
                    users: [],
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null
                });
                // Clear localStorage
                localStorage.removeItem('auth-storage');
            },
            getManagerAnalytics: async (id: string) => {
                set({ isLoading: true, error: null});
                try {
                    const res = (await authApi.getManagerAnalytics(id)).data.data;
                    set({isLoading: false });
                    return {totalProjects: res.totalProjects, totalMembers: res.totalMembers};
                }
                catch (err) {
                    set({
                        error: getErrorMessage(err),
                        isLoading: false
                    });
                    return null;
                }
            }

        }),
        {
            name: 'auth-storage',
            partialize: ({user, token, isAuthenticated}) => ({user, token, isAuthenticated}),
        }
    )

    )
)