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
    withCredentials: true,
});
export const configuration = {
  name:"Rorsica"
}