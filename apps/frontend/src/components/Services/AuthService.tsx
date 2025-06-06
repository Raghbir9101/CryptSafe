import { computed, signal } from '@preact/signals-react';
import { UserInterface } from '@repo/types';
import { api } from '../../Utils/utils';
import Cookies from "js-cookie"

interface AuthState {
    loggedInUser: UserInterface | null,
    status: 'idle' | 'loading' | 'error' | 'success',
    isInitialized: boolean
}

export const Auth = signal<AuthState>({
    loggedInUser: null,
    status: 'idle',
    isInitialized: false
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
        Auth.value = { ...Auth.value, loggedInUser: response.data.user, status: 'success', isInitialized: true }
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
        Auth.value = { ...Auth.value, loggedInUser: null, isInitialized: true }
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
        Auth.value = { loggedInUser: null, status: 'idle', isInitialized: true };
        // Clear any cookies
        Cookies.remove('authorization');
        return { success: true };
    } catch (error) {
        // Even if the API call fails, clear the local state
        Auth.value = { loggedInUser: null, status: 'idle', isInitialized: true };
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