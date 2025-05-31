import axios from "axios"

// const apiURL = "https://cryptsafe.onrender.com/api"
const apiURL = "/api"
// const apiURL = "http://localhost/api"
export const api = axios.create({
    baseURL: apiURL, // Update with your server URL
    withCredentials: true,
});