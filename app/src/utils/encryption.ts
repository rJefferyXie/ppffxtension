import CryptoJS from "crypto-js";

// Encrypt data with a password
export const encryptData = (data: string, password: string): string => {
  return CryptoJS.AES.encrypt(data, password).toString();
};

// Decrypt data with a password
export const decryptData = (cipherText: string, password: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed. Invalid password or corrupted data.");
    return null;
  }
};