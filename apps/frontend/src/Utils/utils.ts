import axios from "axios"

const apiURL = "http://localhost/api"
export const api = axios.create({
    baseURL: apiURL, // Update with your server URL
});