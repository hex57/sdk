export type { SigningKey, SerializedSigningKey } from "./key.ts";
export type { RelyingParty } from "./rp.js";
export type { AttestationOptions, AttestationResult } from "./attestation.js";

export { Key, KeyType, KeyAlgos } from "./key.js";
export { EC2SigningKey } from "./ec2.js";
export { Credential } from "./credential.js";
export { Authenticator } from "./authenticator.js";
export { createAttestationResponse } from "./attestation.js";
export { createAssertionResponse } from "./assertion.js";

export * as subtle from "./crypto.js";
export * as base64 from "./base64.js";
export * as asn1 from "./asn1.js";
