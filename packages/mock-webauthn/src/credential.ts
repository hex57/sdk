import {Key, KeyType} from "./key.js";
import webcrypto from "./crypto.js";
import {AttestationOptions} from "./attestation.js";
import * as base64 from "./base64.js";
import {AssertionOptions} from "./assertion.js";

export class Credential {
    constructor(
        public id: ArrayBuffer,
        public key: Key,
        public counter?: number
    ) {
    }

    static create(key: Key): Credential {
        const id = webcrypto.getRandomValues(new Uint8Array(32)).buffer;
        return new Credential(id, key);
    }

    static import(keyType: KeyType, keyData: ArrayBuffer): Credential {
        const key = new Key(keyType, keyData);
        return Credential.create(key);
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