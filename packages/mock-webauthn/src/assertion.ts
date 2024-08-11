import type {RelyingParty} from "./rp.js";
import type {Authenticator} from "./authenticator.js";
import type {Credential} from "./credential.js";
import * as base64 from "./base64.js";
import webcrypto from "./crypto.js";

export interface AssertionOptions {
    challenge?: ArrayBuffer;
    allowCredentials: string[];
    relyingPartyID: string;
}

export async function createAssertionResponse(rp: RelyingParty, auth: Authenticator, cred: Credential, options: AssertionOptions): Promise<string> {
    if (!options.challenge) {
        throw new Error("challenge is required");
    }

    const clientData = {
        type: "webauthn.get",
        challenge: base64.encodeUrlSafe(options.challenge),
        origin: rp.origin,
    }

    const clientDataJSON = JSON.stringify(clientData);
    const clientDataJSONEncoded = base64.encodeUrlSafe(base64.stringToArrayBuffer(clientDataJSON));

    const rpIdHash = await webcrypto.subtle.digest("SHA-256", base64.stringToArrayBuffer(rp.id));
    const flags = base64.authenticatorDataFlags(!auth.options.userNotPresent, !auth.options.userNotVerified, true, false);

    const publicKeyData = await cred.key.attestationData();

    const credDataArr = [];
    credDataArr.push(...new Uint8Array(auth.aaguid));
    credDataArr.push(...base64.bigEndianBytes(cred.id.byteLength, 2));
    credDataArr.push(...new Uint8Array(cred.id));
    credDataArr.push(...new Uint8Array(publicKeyData));
    const credData = new Uint8Array(credDataArr);

    const authDataArr = [];
    authDataArr.push(...new Uint8Array(rpIdHash));
    authDataArr.push(flags);
    authDataArr.push(...base64.bigEndianBytes(cred.counter ?? 0, 4));
    authDataArr.push(...credData);
    const authData = new Uint8Array(authDataArr).buffer;
    const authDataEncoded = base64.encodeUrlSafe(authData);

    const clientDataJSONHashed = await webcrypto.subtle.digest("SHA-256", base64.stringToArrayBuffer(clientDataJSON));

    const verifyDataArr = [...authDataArr];
    verifyDataArr.push(...new Uint8Array(clientDataJSONHashed));
    const verifyData = new Uint8Array(verifyDataArr).buffer;
    console.log("verifyData", verifyData);
    const verifyDigest = await webcrypto.subtle.digest("SHA-256", verifyData);

    const signature = await cred.key.sign(verifyDigest);
    const credIDEncoded = base64.encodeUrlSafe(cred.id);

    const assertionResponse: AssertionResponse = {
        authenticatorData: authDataEncoded,
        clientDataJSON: clientDataJSONEncoded,
        signature: base64.encodeUrlSafe(signature),
        userHandle: base64.encodeUrlSafe(auth.options.userHandle),
    }

    const assertionResult: AssertionResult = {
        type: "public-key",
        id: credIDEncoded,
        rawId: credIDEncoded,
        response: assertionResponse,
    }

    return JSON.stringify(assertionResult);
}

interface AssertionResponse {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle?: string;
}

export interface AssertionResult {
    type: string;
    id: string;
    rawId: string;
    response: AssertionResponse;
}