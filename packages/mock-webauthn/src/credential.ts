import type {KeyType, SerializedSigningKey} from "./key.js";
import type {AttestationOptions} from "./attestation.js";
import type {AssertionOptions} from "./assertion.js";
import {Key} from "./key.js";
import webcrypto from "./crypto.js";
import * as base64 from "./base64.js";

export class Credential {
    static create(key: Key): Credential {
        const id = webcrypto.getRandomValues(new Uint8Array(32)).buffer;
        return new Credential(id, key);
    }

    static import(keyType: KeyType, keyData: SerializedSigningKey): Credential {
        const key = new Key(keyType, keyData);
        return Credential.create(key);
    }

    constructor(
        public id: ArrayBuffer,
        public key: Key,
        public counter?: number
    ) {
    }

    isExcludedForAttestation(options: AttestationOptions): boolean {
        const encodedId = base64.encodeUrlSafe(this.id);
        return !options.excludeCredentials.some(cred => cred === encodedId)
    }

    isAllowedForAssertion(options: AssertionOptions): boolean {
        const encodedId = base64.encodeUrlSafe(this.id);
        return options.allowCredentials.some(cred => cred === encodedId)
    }
}