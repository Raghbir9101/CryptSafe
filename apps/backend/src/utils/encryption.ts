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
      const key = CryptoJS.enc.Utf8.parse(process.env.GOOGLE_API);
      let iv = CryptoJS.enc.Utf8.parse(process.env.GOOGLE_API)
      return CryptoJS.AES.encrypt(String(obj), key, {iv:iv}).toString();
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
      const bytes = CryptoJS.AES.decrypt(obj, secretKey);
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