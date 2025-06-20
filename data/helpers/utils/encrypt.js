import crypto from "crypto-js";

export const encrypt = (payload) => {
  try {
    if (typeof payload !== "string") {
      throw Error("Encryption payload must be a string");
    }
    const encryptedPayload = crypto.AES.encrypt(
      payload,
      process.env.ENC_KEY
    ).toString();
    return encryptedPayload;
  } catch (error) {
    console.error("Error while encrypting payload");
    throw error;
  }
};
