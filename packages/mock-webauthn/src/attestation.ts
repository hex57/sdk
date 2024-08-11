import cbor from "cbor-web";
import type { Authenticator } from "./authenticator.js";
import * as base64 from "./base64.js";
import type { Credential } from "./credential.js";
import webcrypto from "./crypto.js";
import { KeyAlgos } from "./key.js";
import type { RelyingParty } from "./rp.js";

export interface AttestationOptions {
  challenge: ArrayBuffer;
  excludeCredentials: string[];
  userID: string;
  userName: string;
  userDisplayName: string;
}

export async function createAttestationResponse(
  rp: RelyingParty,
  auth: Authenticator,
  cred: Credential,
  options: AttestationOptions
): Promise<string> {
  const clientData = {
    type: "webauthn.create",
    challenge: base64.encodeUrlSafe(options.challenge),
    origin: rp.origin,
  };

  const clientDataJSON = JSON.stringify(clientData);
  const clientDataJSONEncoded = base64.encodeUrlSafe(
    base64.stringToArrayBuffer(clientDataJSON)
  );

  const publicKeyData = await cred.key.attestationData();

  const credDataArr = [];
  credDataArr.push(...new Uint8Array(auth.aaguid));
  credDataArr.push(...base64.bigEndianBytes(cred.id.byteLength, 2));
  credDataArr.push(...new Uint8Array(cred.id));
  credDataArr.push(...new Uint8Array(publicKeyData));

  const rpIdHash = await webcrypto.subtle.digest(
    "SHA-256",
    base64.stringToArrayBuffer(rp.id)
  );

  const flags = base64.authenticatorDataFlags(
    !auth.options.userNotPresent,
    !auth.options.userNotVerified,
    auth.options.backupEligible,
    auth.options.backupState,
    true,
    false
  );

  const authDataArr = [];
  authDataArr.push(...new Uint8Array(rpIdHash));
  authDataArr.push(flags);
  authDataArr.push(...base64.bigEndianBytes(cred.counter ?? 0, 4));
  authDataArr.push(...credDataArr);
  const authData = new Uint8Array(authDataArr).buffer;

  const clientDataJSONHashed = await webcrypto.subtle.digest(
    "SHA-256",
    base64.stringToArrayBuffer(clientDataJSON)
  );

  const verifyDataArr = [...authDataArr];
  verifyDataArr.push(...new Uint8Array(clientDataJSONHashed));
  const verifyData = new Uint8Array(verifyDataArr).buffer;

  const verifyDigest = await webcrypto.subtle.digest("SHA-256", verifyData);

  const signature = await cred.key.sign(new Uint8Array(verifyDataArr).buffer);

  const keyAlgo = KeyAlgos[cred.key.type];

  const attestationObject: AttestationObject = {
    fmt: "packed",
    authData,
    attStmt: {
      alg: keyAlgo,
      sig: signature,
    },
  };
  const attestationObjectBytes = cbor.encode(attestationObject);
  const attestationObjectEncoded = base64.encodeUrlSafe(attestationObjectBytes);

  const credIDEncoded = base64.encodeUrlSafe(cred.id);

  const attestationResponse: AttestationResponse = {
    attestationObject: attestationObjectEncoded,
    clientDataJSON: clientDataJSONEncoded,
  };

  const attestationResult: AttestationResult = {
    type: "public-key",
    id: credIDEncoded,
    rawId: credIDEncoded,
    response: attestationResponse,
  };

  return JSON.stringify(attestationResult);
}

interface AttestationStatement {
  alg: number;
  sig: ArrayBuffer;
}

interface AttestationObject {
  fmt: string;
  attStmt: AttestationStatement;
  authData: ArrayBuffer;
}

interface AttestationResponse {
  attestationObject: string;
  clientDataJSON: string;
}

export interface AttestationResult {
  type: string;
  id: string;
  rawId: string;
  response: AttestationResponse;
}
