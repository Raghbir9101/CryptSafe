import axios from "axios"

const apiURL = "https://cryptsafe.onrender.com"
// const apiURL = "http://localhost/api"
export const api = axios.create({
    baseURL: apiURL, // Update with your server URL
    withCredentials: true,
});