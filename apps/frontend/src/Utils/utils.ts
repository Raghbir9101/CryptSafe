import axios from "axios"

// const apiURL = "https://cryptsafe.onrender.com/api"
// const apiURL = "/api"
// const apiURL = "http://localhost/api"
let apiKey = "xhvajhabdadciajwdfihasdf-alskdjbfasdfb-adsfaskdjflvc"
let apiURL = "http://localhost/api";
  if (document.location.href.includes("localhost")) {
    apiURL = "http://localhost/api";
  }  else {
    apiURL = "/api";
  }
export const api = axios.create({
    baseURL: apiURL, // Update with your server URL
});

// Add request interceptor to automatically add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const configuration = {
  name:"Rorsica"
}