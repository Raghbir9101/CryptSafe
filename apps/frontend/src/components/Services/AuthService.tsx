import { computed, signal } from '@preact/signals-react';
import { UserInterface } from '@repo/types';
import { api } from '../../Utils/utils';

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
    const token = sessionStorage.getItem('token');
    return Auth.value.loggedInUser !== null && Auth.value.isInitialized && token !== null;
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
        const response = await api.post('/auth/login', { email, password });
        const user = response.data.user;
        const token = response.data.token;
        
        // Store token in sessionStorage (cleared when tab is closed)
        // This is better than cookies for our use case because:
        // 1. sessionStorage is cleared when the tab is closed
        // 2. We can control exactly when to clear it
        // 3. No need to worry about cookie expiration or httpOnly settings
        if (token) {
            sessionStorage.setItem('token', token);
        }
        
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
        const response = await api.post('/auth/register', { email, password, userName });
        return response.data
    } catch (error) {
        return error
    }
}

export const getUserAfterRefresh = async () => {
    // Check if token exists in sessionStorage first
    const token = sessionStorage.getItem('token');
    if (!token) {
        // No token found, clear auth state
        Auth.value = { 
            ...Auth.value, 
            loggedInUser: null, 
            isInitialized: true,
            showPasswordResetModal: false,
            passwordResetUserId: null
        }
        return;
    }

    try {
        const response = await api.get('/users/getUser');
        Auth.value = { ...Auth.value, loggedInUser: response.data, isInitialized: true }
    } catch (error) {
        Auth.value = { 
            ...Auth.value, 
            loggedInUser: null, 
            isInitialized: true,
            showPasswordResetModal: false,
            passwordResetUserId: null
        }
        // Clear token if request fails
        sessionStorage.removeItem('token');
    }
}

export const getAdminsUsers = async()=>{
    try {
        const response = await api.get('/admin/getUsers')
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
        // Clear token from sessionStorage
        sessionStorage.removeItem('token');
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
        sessionStorage.removeItem('token');
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

// Add function to check if user should be logged out
export const checkAuthStatus = () => {
    const token = sessionStorage.getItem('token');
    if (!token && Auth.value.loggedInUser) {
        // Token was cleared but user is still logged in, log them out
        Auth.value = { 
            ...Auth.value, 
            loggedInUser: null, 
            status: 'idle', 
            isInitialized: true,
            showPasswordResetModal: false,
            passwordResetUserId: null
        };
        return false;
    }
    return true;
}

// Add function to handle storage events (for multiple tabs)
export const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'token' && event.newValue === null) {
        // Token was cleared in another tab, log out in this tab too
        checkAuthStatus();
    }
} 