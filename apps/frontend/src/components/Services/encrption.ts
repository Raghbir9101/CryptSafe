import CryptoJS from "crypto-js";

// Encrypts a JS object using AES and a secret key
// export function encryptData(data: any, secretKey: string): string {
//   const json = JSON.stringify(data);
//   return CryptoJS.AES.encrypt(json, secretKey).toString();
// }
const skipKeys = ["unique", "required", "hidden", "options","tablePermissions","enabled","fieldPermission","isBlocked","workingTimeAccess","restrictNetwork","restrictWorkingTime","_id","createdAt","updatedAt"];
export function encryptObjectValues(obj: any, secretKey: string): any {
    if (Array.isArray(obj)) {
      return obj.map(item => encryptObjectValues(item, secretKey));
    } else if (obj !== null && typeof obj === "object") {
      const encryptedObj: any = {};
      for (const key in obj) {
        if(skipKeys.includes(key)){
          encryptedObj[key] = obj[key];
        }else{
          encryptedObj[key] = encryptObjectValues(obj[key], secretKey);
        }
      }
      return encryptedObj;
    } else {
      // Encrypt only primitive values (string, number, boolean)
      // console.log("xhvajhabdadciajwdfihasdf-alskdjbfasdfb-adsfaskdjflvc")
      const key = CryptoJS.enc.Utf8.parse("xhvajhabdadciajwdfihasdf-alskdjbfasdfb-adsfaskdjflvc");
      let iv = CryptoJS.enc.Utf8.parse("xhvajhabdadciajwdfihasdf-alskdjbfasdfb-adsfaskdjflvc")
      return CryptoJS.AES.encrypt(String(obj), key, {iv:iv}).toString();
      // return CryptoJS.AES.encrypt(String(obj), secretKey).toString();
    }
  }
  


export function decryptObjectValues(obj: any, secretKey: string): any {
  if (Array.isArray(obj)) {
    return obj.map(item => decryptObjectValues(item, secretKey));
  } else if (obj !== null && typeof obj === "object") {
    const decryptedObj: any = {};
    for (const key in obj) {
      if (skipKeys.includes(key)) {
        decryptedObj[key] = obj[key];
      } else {
        decryptedObj[key] = decryptObjectValues(obj[key], secretKey);
      }
    }
    return decryptedObj;
  } else if (typeof obj === "string") {
    try {
      const key = CryptoJS.enc.Utf8.parse("xhvajhabdadciajwdfihasdf-alskdjbfasdfb-adsfaskdjflvc");
      let iv = CryptoJS.enc.Utf8.parse("xhvajhabdadciajwdfihasdf-alskdjbfasdfb-adsfaskdjflvc")
      const bytes = CryptoJS.AES.decrypt(obj, key,{
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      // If decryption fails, decrypted will be empty string
      return decrypted ? decrypted : obj;
    } catch {
      return obj;
    }
  } else {
    return obj;
  }
}