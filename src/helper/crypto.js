import CryptoJS from "crypto-js";
import pako from "pako";

const key = CryptoJS.enc.Utf8.parse(import.meta.env.VITE_ENCRYPTION_KEY);
const iv = CryptoJS.enc.Utf8.parse(import.meta.env.VITE_ENCRYPTION_IV);

const crypto = {
  encrypt: (data) => {
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
    return encryptedData;
  },

  decrypt: (encryptedData) => {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const decryptedData = JSON.parse(
      decryptedBytes.toString(CryptoJS.enc.Utf8)
    );
    return decryptedData;
  },

  encryptForUrl: (data) => {
    // 1️⃣ Compress JSON → Uint8Array
    const compressed = pako.deflate(JSON.stringify(data));

    // 2️⃣ Convert Uint8Array → CryptoJS WordArray
    const wordArray = CryptoJS.lib.WordArray.create(compressed);
    // 3️⃣ Encrypt the WordArray
    const encrypted = CryptoJS.AES.encrypt(wordArray, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();

    // 4️⃣ Base64URL-safe encoding
    return encrypted.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  },

  decryptFromUrl: (encoded) => {
    // 1️⃣ Convert Base64URL → Base64
    const base64 = encoded
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(encoded.length + (4 - (encoded.length % 4)) % 4, "=");

    // 2️⃣ Decrypt → WordArray of compressed bytes
    const decryptedBytes = CryptoJS.AES.decrypt(base64, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // 3️⃣ Convert WordArray → Uint8Array
    const decryptedU8 = new Uint8Array(
      decryptedBytes.words.map((word) => [
        (word >> 24) & 0xff,
        (word >> 16) & 0xff,
        (word >> 8) & 0xff,
        word & 0xff,
      ]).flat()
    ).slice(0, decryptedBytes.sigBytes);

    // 4️⃣ Inflate (decompress) back to string
    const decompressed = pako.inflate(decryptedU8, { to: "string" });

    return JSON.parse(decompressed);
  },
};

export default crypto;
