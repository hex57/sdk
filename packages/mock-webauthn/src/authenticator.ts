import type { AssertionOptions } from "./assertion.js";
import type { Credential } from "./credential.js";
import webcrypto from "./crypto.js";

export interface AuthenticatorOptions {
  userHandle: ArrayBuffer;
  userNotPresent: boolean;
  userNotVerified: boolean;
  backupEligible: boolean;
  backupState: boolean;
}

export class Authenticator {
  static create(options: AuthenticatorOptions): Authenticator {
    const aaguid = webcrypto.getRandomValues(new Uint8Array(16)).buffer;
    return new Authenticator(options, aaguid);
  }

  constructor(
    public options: AuthenticatorOptions,
    public aaguid: ArrayBuffer,
    public credentials: Credential[] = []
  ) {}

  addCredential(credential: Credential) {
    this.credentials.push(credential);
  }

  findAllowedCredential(options: AssertionOptions): Credential | undefined {
    const allowedCredentials = this.credentials.filter((cred) =>
      cred.isAllowedForAssertion(options)
    );
    if (allowedCredentials.length === 0) {
      return undefined;
    }

    return allowedCredentials[0];
  }
}
