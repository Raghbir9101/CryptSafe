import { computed, signal } from "@preact/signals-react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "@/utils/API_URL";
import { api } from "@/utils/interceptor";
import { UsersInterface } from "./UserService";


interface AuthInterface {
    loginUser: UsersInterface | null;
    token: string;
    loading: boolean
}


const Auth = signal<AuthInterface>({
    loginUser: null,
    token: localStorage.getItem("token") || "",
    loading: false
});

const isLoggedIn = computed(() => {
    return !!Auth.value.token
});


/**
 * Fetches user data using the stored token and updates the Auth signal.
 * 
 * This function sends a request to fetch user data with the token stored in the Auth signal.
 * If a token is present, the function sets the loading state to true, sends a GET request to 
 * the server, and updates the loginUser field with the response data upon success. If an 
 * error occurs during the request, it logs the error to the console.
 * 
 * Note: The function has no effect if the token is not present.
 */
const getUserDataWithToken = async () => {
    if (!Auth.value.token) return;
    if (Auth.value.loginUser) return;
    try {
        Auth.value = { ...Auth.value, loading: true };
        const res = await axios.get(`${API_URL}users/getUserWithToken`, {
            headers: {
                Authorization: `Bearer ${Auth.value.token}`
            }
        });
        Auth.value = { ...Auth.value, loginUser: res.data, loading: false };
    } catch (err) {
        if (err?.response?.data?.message == "Invalid or expired token") {
            handleLogout()
            window.location.href = "/login";
        }
        console.log(err?.response?.data?.message);
    }
}

/**
 * Processes the Google login by handling the OAuth callback.
 * 
 * This function extracts the authorization code from the URL, sends it to the server to get
 * the authentication token and user data, and updates the Auth signal accordingly. It also
 * stores the token in the local storage for persistent login state.
 * 
 * @param {function} callback - A function to be called with the updated AuthInterface object
 *                              once the login process is complete.
 * 
 * If the code is missing from the URL, the function returns early. In case of an error
 * response from the server, it shows an error toast message and stops the loading state.
 */
const processGoogleLogin = (callback: (auth: AuthInterface) => void): void => {
    if (Auth.value.token) return;
    try {

        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get("code");
        if (code == null) {
            return
        }
        Auth.value = {
            ...Auth.value,
            loading: true
        }
        axios.get(`${API_URL}/auth/google/callback?code=` + code)
            .then(({ data: res }) => {
                if (res.error) {
                    toast.error(res.error);
                    Auth.value = {
                        ...Auth.value,
                        loading: false
                    }
                    return;
                }
                Auth.value = {
                    token: res.token,
                    loginUser: res.body,
                    loading: false
                }
                localStorage.setItem("token", res.token);
                callback(Auth.value);
            });
    } catch (err) {
        Auth.value = {
            ...Auth.value,
            loading: true
        }
        console.log(err.message);
    }
}

/**
 * Updates the Auth signal and stores the token in localStorage
 * @param {string} token - The token returned by the server
 * @param {object} user - The user object returned by the server
 */

const handleLogin = (token: string, user: UsersInterface): void => {
    Auth.value = {
        loginUser: user,
        token,
        loading: false
    }
    localStorage.setItem("token", token);
}

/**
 * Clears the Auth signal and removes the token from localStorage
 * @return {void}
 */
const handleLogout = (): void => {
    Auth.value = {
        loginUser: null,
        token: "",
        loading: false
    }
    localStorage.setItem("token", "");
}

const registerUser = async (data) => {
    Auth.value = {
        ...Auth.value,
        loading: true
    }
    try {
        const { data: response } = await api.value.post("/auth/register", data);
        if (response.token) {
            handleLogin(response.token, response.body);
        }
        return response;
    } catch (error) {
        Auth.value = {
            ...Auth.value,
            loading: false
        }
        return {
            error: error.response.data.error
        }
    }
}

const loginUser = async (data) => {
    Auth.value = {
        ...Auth.value,
        loading: true
    }
    try {
        const { data: response } = await api.value.post("/auth/login", data);
        if (response.token) {
            handleLogin(response.token, response.body);
        }
        return response;
    } catch (error) {
        Auth.value = {
            ...Auth.value,
            loading: false
        }
        return {
            error: error.response.data.error
        }
    }
}

const updateProfile = async ({ userName, phone, photo }: { userName?: string; phone?: string; photo?: string; }) => {
    try {
        const { data: response } = await api.value.patch(`/users/profile/${Auth.value?.loginUser?._id}`, {
            userName,
            phone,
            photo
        });
        Auth.value = {
            ...Auth.value,
            loading: false,
            loginUser: {
                ...Auth.value.loginUser,
                ...response
            }
        }
        return response;
    } catch (error) {
        Auth.value = {
            ...Auth.value,
            loading: false
        }
        return {
            error: error.response.data.error
        }
    }
}



export { Auth, handleLogin, handleLogout, processGoogleLogin, getUserDataWithToken, registerUser, loginUser, isLoggedIn, updateProfile };