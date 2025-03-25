function getURL(link) {
    const parsedURL = new URL(link);

    // Get the protocol and hostname to create the base URL
    const baseURL = `${parsedURL.protocol}//${parsedURL.hostname}`;

    return baseURL;
}


const currentURL = window.location.href;
// let apiLink = `${getURL(currentURL)}/`;
export const API_URL = `${getURL(currentURL)}/api/`;