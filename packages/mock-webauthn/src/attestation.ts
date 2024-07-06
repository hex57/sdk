import {RelyingParty} from "./rp.js";
import {Authenticator} from "./authenticator.js";
import {Credential} from "./credential.js";
import * as base64 from "./base64.js";
import webcrypto from "./crypto.js";
import {authenticatorDataFlags} from "./base64.js";
import {KeyAlgos} from "./key.js";
import cbor from "cbor-web";

export interface AttestationOptions {
    challenge: ArrayBuffer;
    excludeCredentials: string[];
    relyingPartyID: string;
    relyingPartyName: string;
    userID: string;
    userName: string;
    userDisplayName: string;
}

export async function createAttestationResponse(rp: RelyingParty, auth: Authenticator, cred: Credential, options: AttestationOptions): Promise<string> {
    const clientData = {
        type: "webauthn.create",
        challenge: base64.encodeUrlSafe(options.challenge),
        origin: rp.origin,
    }

    const clientDataJSON = JSON.stringify(clientData);
    const clientDataJSONEncoded = base64.encodeUrlSafe(base64.stringToArrayBuffer(clientDataJSON));

    const publicKeyData = await cred.key.attestationData();

    const credDataArr = [];
    credDataArr.push(...new Uint8Array(auth.aaguid));
    credDataArr.push(...base64.bigEndianBytes(cred.id.byteLength, 2));
    credDataArr.push(...new Uint8Array(cred.id));
    credDataArr.push(...new Uint8Array(publicKeyData));
    const credData = new Uint8Array(credDataArr);

    const rpIdHash = await webcrypto.subtle.digest("SHA-256", base64.stringToArrayBuffer((rp.id)));

    const flags = base64.authenticatorDataFlags(!auth.options.userNotPresent, !auth.options.userNotVerified, true, false);

    const authDataArr = [];
    authDataArr.push(...new Uint8Array(rpIdHash));
    authDataArr.push(flags);
    authDataArr.push(...base64.bigEndianBytes(cred.counter ?? 0, 4));
    authDataArr.push(...new Uint8Array(credData));
    const authData = new Uint8Array(authDataArr);

    const clientDataJSONHashed = await webcrypto.subtle.digest("SHA-256", base64.stringToArrayBuffer(clientDataJSONEncoded));

    const verifyDataArr = [...authDataArr];
    verifyDataArr.push(...new Uint8Array(clientDataJSONHashed));
    const verifyData = new Uint8Array(verifyDataArr);

    const verifyDigest = await webcrypto.subtle.digest("SHA-256", verifyData);

    const signature = await cred.key.sign(verifyDigest);

    const keyAlgo = KeyAlgos[cred.key.type];

    const attestationObject: AttestationObject = {
        format: "packed",
        authData: authData,
        statement: {
            algorithm: keyAlgo,
            signature: signature,
        }
    }
    const attestationObjectBytes = cbor.encode(attestationObject);
    const attestationObjectEncoded = base64.encodeUrlSafe(attestationObjectBytes);

    const credIDEncoded = base64.encodeUrlSafe(cred.id);

    const attestationResponse: AttestationResponse = {
        attestationObject: attestationObjectEncoded,
        clientDataJSON: clientDataJSONEncoded,
    }

    const attestationResult: AttestationResult = {
        type: "public-key",
        id: credIDEncoded,
        rawId: credIDEncoded,
        response: attestationResponse,
    }

    return JSON.stringify(attestationResult);
}

interface AttestationOptionsValues {
    challenge: string;
    excludeCredentials: AttestationOptionsExcludeCredential[];
    rp: AttestationOptionsRelyingParty;
    user: AttestationOptionsUser;
    publicKey: ArrayBuffer;
}

interface AttestationOptionsRelyingParty {
    id: string;
    name: string;
}

interface AttestationOptionsUser {
    id: string;
    name: string;
    displayName: string;
}

interface AttestationOptionsExcludeCredential {
    type: string;
    id: string;
}

interface AttestationStatement {
    algorithm: number;
    signature: ArrayBuffer;
}

interface AttestationObject {
    format: string;
    statement: AttestationStatement;
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
