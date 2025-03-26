import { signal } from '@preact/signals-react';
import { UserInterface } from '@repo/types';
import { api } from '../../Utils/utils';


interface AuthState {
    loggedInUser: UserInterface | null,
    status: 'idle' | 'loading' | 'error' | 'success',
}

export const Auth = signal<AuthState>({
    loggedInUser: null,
    status: 'idle',
})

export const login = async (email: string, password: string) => {
    Auth.value = {...Auth.value, status: 'loading'}
    try {
        const response = await api.post('/auth/login', { email, password });
        Auth.value = {...Auth.value, loggedInUser: response.data, status: 'success'}
        return response.data
    } catch (error) {
        Auth.value = {...Auth.value, status: 'error'}
        return error
    }
}

export const register = async (email: string, password: string, userName: string) => {
    Auth.value = {...Auth.value, status: 'loading'}
    try {
        const response = await api.post('/auth/register', { email, password, userName });
        Auth.value = {...Auth.value, loggedInUser: response.data, status: 'success'}    
        return response.data
    } catch (error) {
        Auth.value = {...Auth.value, status: 'error'}
        return error
    }
}


