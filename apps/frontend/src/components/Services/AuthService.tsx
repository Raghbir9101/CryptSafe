import { computed, signal } from '@preact/signals-react';
import { UserInterface } from '@repo/types';
import { api } from '../../Utils/utils';
import Cookies from "js-cookie"

interface AuthState {
    loggedInUser: UserInterface | null,
    status: 'idle' | 'loading' | 'error' | 'success',
}

export const Auth = signal<AuthState>({
    loggedInUser: null,
    status: 'idle',
})

export const isAuthenticated = computed(() => {
    return Auth.value.loggedInUser !== null
})

export const login = async (email: string, password: string) => {
    Auth.value = { ...Auth.value, status: 'loading' }
    try {
        const response = await api.post('/auth/login', { email, password }, { withCredentials: true });
        Auth.value = { ...Auth.value, loggedInUser: response.data.user, status: 'success' }
        return response.data
    } catch (error) {
        Auth.value = { ...Auth.value, status: 'error' }
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
        Auth.value = { ...Auth.value, loggedInUser: response.data }
    } catch (error) {
        Auth.value = { ...Auth.value, loggedInUser: null }
    }
}

export const logout = async () => {
    try {
        Auth.value = { ...Auth.value, loggedInUser: null }
        Cookies.set('authorization', '')
    } catch (error) {
        return error
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