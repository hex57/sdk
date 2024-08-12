import { EC2SigningKey } from "./ec2.js";

export enum KeyType {
  EC2 = "ec2",
  RSA = "rsa",
}

export const KeyAlgos = {
  [KeyType.EC2]: -7,
  [KeyType.RSA]: -257,
};

export class Key {
  constructor(
    public readonly type: KeyType,
    public readonly data: SerializedSigningKey,
    public signingKey?: SigningKey,
  ) {}

  async ensureSigningKey() {
    if (this.signingKey) {
      return;
    }

    switch (this.type) {
      case KeyType.EC2:
        this.signingKey = await EC2SigningKey.import(this.data);
        break;
      case KeyType.RSA:
        throw new Error("RSA signing keys are not yet supported");
      // this.signingKey = new RSASigningKey(this.data);

      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      default:
        throw new Error(`Unsupported key type`);
    }

    if (!this.signingKey) {
      throw new Error("Failed to create signing key");
    }
  }

  async attestationData(): Promise<ArrayBuffer> {
    if (!this.signingKey) {
      await this.ensureSigningKey();
    }

    return this.signingKey!.attestationData;
  }

  async sign(digest: ArrayBuffer): Promise<ArrayBuffer> {
    if (!this.signingKey) {
      await this.ensureSigningKey();
    }

    return this.signingKey!.sign(digest);
  }
}

export interface SerializedSigningKey {
  privateKey: JsonWebKey;
  publicKey: JsonWebKey;
}

export interface SigningKey {
  readonly attestationData: ArrayBuffer;
  sign(digest: ArrayBuffer): Promise<ArrayBuffer>;
}
