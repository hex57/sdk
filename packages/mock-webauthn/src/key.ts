import {EC2SigningKey} from "./ec2.js";

export enum KeyType {
    KeyTypeEC2 = "ec2",
    KeyTypeRSA = "rsa",
}

export const KeyAlgos = {
    [KeyType.KeyTypeEC2]: -7,
    [KeyType.KeyTypeRSA]: -257,
}

export class Key {
    constructor(
        public readonly type: KeyType,
        public readonly data: ArrayBuffer,
        public signingKey?: SigningKey
    ) {}

    async ensureSigningKey() {
        switch (this.type) {
            case KeyType.KeyTypeEC2:
                this.signingKey = await EC2SigningKey.import(this.data);
                break;
            case KeyType.KeyTypeRSA:
                // this.signingKey = new RSASigningKey(this.data);
                break;
            default:
                throw new Error("Unsupported key type");
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

export interface SigningKey {
    readonly attestationData: ArrayBuffer;
    sign(digest: ArrayBuffer): Promise<ArrayBuffer>;
}