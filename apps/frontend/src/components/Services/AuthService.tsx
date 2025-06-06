import { computed, signal } from '@preact/signals-react';
import { UserInterface } from '@repo/types';
import { api } from '../../Utils/utils';
import Cookies from "js-cookie"

interface AuthState {
    loggedInUser: UserInterface | null,
    status: 'idle' | 'loading' | 'error' | 'success',
    isInitialized: boolean,
    showPasswordResetModal: boolean,
    passwordResetUserId: string | null
}

export const Auth = signal<AuthState>({
    loggedInUser: null,
    status: 'idle',
    isInitialized: false,
    showPasswordResetModal: false,
    passwordResetUserId: null
})

export const isAuthenticated = computed(() => {
    return Auth.value.loggedInUser !== null && Auth.value.isInitialized
})

export const isInitialized = computed(() => {
    return Auth.value.isInitialized
})

export const getUser = () => {
    return Auth.value.loggedInUser;
}

export const login = async (email: string, password: string) => {
    Auth.value = { ...Auth.value, status: 'loading' }
    try {
        const response = await api.post('/auth/login', { email, password }, { withCredentials: true });
        const user = response.data.user;
        
        // Check if password reset is needed
        if (user && !user.passwordReset) {
            Auth.value = { 
                ...Auth.value, 
                loggedInUser: user, 
                status: 'success', 
                isInitialized: true,
                showPasswordResetModal: true,
                passwordResetUserId: user._id
            }
        } else {
            Auth.value = { 
                ...Auth.value, 
                loggedInUser: user, 
                status: 'success', 
                isInitialized: true,
                showPasswordResetModal: false,
                passwordResetUserId: null
            }
        }
        return response.data
    } catch (error) {
        Auth.value = { ...Auth.value, status: 'error', isInitialized: true }
        throw error
    }
}

export const register = async (email: string, password: string, userName: string) => {
    try {
        const response = await api.post('/auth/register', { email, password, userName }, { withCredentials: true });
        return response.data
    } catch (error) {
        return error
    }
}

export const getUserAfterRefresh = async () => {
    try {
        const response = await api.get('/users/getUser', { withCredentials: true });
        Auth.value = { ...Auth.value, loggedInUser: response.data, isInitialized: true }
    } catch (error) {
        Auth.value = { 
            ...Auth.value, 
            loggedInUser: null, 
            isInitialized: true,
            showPasswordResetModal: false,
            passwordResetUserId: null
        }
    }
}

export const getAdminsUsers = async()=>{
    try {
        const response = await api.get('/admin/getUsers', {withCredentials:true})
        return response
    } catch (error) {
        return error
    }
}

export const logout = async () => {
    try {
        await api.get('/auth/logout');
        // Clear the auth state
        Auth.value = { 
            loggedInUser: null, 
            status: 'idle', 
            isInitialized: true,
            showPasswordResetModal: false,
            passwordResetUserId: null
        };
        // Clear any cookies
        Cookies.remove('authorization');
        return { success: true };
    } catch (error) {
        // Even if the API call fails, clear the local state
        Auth.value = { 
            loggedInUser: null, 
            status: 'idle', 
            isInitialized: true,
            showPasswordResetModal: false,
            passwordResetUserId: null
        };
        Cookies.remove('authorization');
        return { success: false, error };
    }
}

export const loginWithGoogle = async (token: string): Promise<any> => {
    try {
        const response = await api.post('/auth/google', { token });
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || 'Google login failed'
        };
    }
};

// Add function to close password reset modal
export const closePasswordResetModal = () => {
    Auth.value = {
        ...Auth.value,
        showPasswordResetModal: false,
        passwordResetUserId: null
    }
}

export const initialPasswordReset = async (userId: string, newPassword: string, confirmPassword: string) => {
    try {
        const response = await api.post('/auth/initial-reset-password', {
            userId,
            newPassword,
            confirmPassword
        });
        
        // Update the auth state with the updated user data
        if (response.data.user) {
            Auth.value = {
                ...Auth.value,
                loggedInUser: response.data.user,
                showPasswordResetModal: false,
                passwordResetUserId: null
            };
        }
        
        return response.data;
    } catch (error) {
        throw error;
    }
}; 