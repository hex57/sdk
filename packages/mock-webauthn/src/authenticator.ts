import {Credential} from "./credential.js";
import webcrypto from "./crypto.js";
import {AssertionOptions} from "./assertion.js";

export interface AuthenticatorOptions {
    userHandle: ArrayBuffer;
    userNotPresent: boolean;
    userNotVerified: boolean;
}

export class Authenticator {
    constructor(
        public options: AuthenticatorOptions,
        public aaguid: ArrayBuffer,
        public credentials: Credential[] = []
    ) {}

    static create(options: AuthenticatorOptions): Authenticator {
        const aaguid = webcrypto.getRandomValues(new Uint8Array(16)).buffer;
        return new Authenticator(options, aaguid);
    }

    addCredential(credential: Credential) {
        this.credentials.push(credential);
    }

    findAllowedCredential(options: AssertionOptions): Credential | undefined {
        const allowedCredentials = this.credentials.filter(cred => cred.isAllowedForAssertion(options));
        if (allowedCredentials.length === 0) {
            return undefined;
        }
        return allowedCredentials[0];
    }
}