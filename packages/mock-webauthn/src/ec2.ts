import cbor from "cbor-web";
import { encodeASN1SignatureP256 } from "./asn1.js";
import * as base64 from "./base64.js";
import webcrypto from "./crypto.js";
import type { SerializedSigningKey, SigningKey } from "./key.js";

const EC2_TYPE = 2;
const EC2_P256_CURVE = 1;
const EC2_SHA256_ALGO = -7;

const CBOR_TYPE_KEY = 1;
const CBOR_ALGO_KEY = 3;
const CBOR_CURVE_KEY = -1;
const CBOR_X_KEY = -2;
const CBOR_Y_KEY = -3;

export class EC2SigningKey implements SigningKey {
  static async generate() {
    const k = await webcrypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["sign", "verify"]
    );
    const attestationData = await getAttestationData(k.publicKey);
    return new EC2SigningKey(k.privateKey, k.publicKey, attestationData);
  }

  static async import(data: SerializedSigningKey) {
    const privateKey = await webcrypto.subtle.importKey(
      "jwk",
      data.privateKey,
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["sign"]
    );
    const publicKey = await webcrypto.subtle.importKey(
      "jwk",
      data.publicKey,
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["verify"]
    );
    const attestationData = await getAttestationData(publicKey);
    return new EC2SigningKey(privateKey, publicKey, attestationData);
  }

  constructor(
    private readonly sk: CryptoKey,
    private readonly pk: CryptoKey,
    public readonly attestationData: ArrayBuffer
  ) {}

  async export() {
    return {
      privateKey: await webcrypto.subtle.exportKey("jwk", this.sk),
      publicKey: await webcrypto.subtle.exportKey("jwk", this.pk),
    };
  }

  async sign(data: ArrayBuffer) {
    const sig = await webcrypto.subtle.sign(
      {
        name: "ECDSA",
        hash: "SHA-256",
      },
      this.sk,
      data
    );

    const rawBytes = new Uint8Array(sig);
    const r = rawBytes.slice(0, 32);
    const s = rawBytes.slice(32);

    const asn1Signature = encodeASN1SignatureP256(
      new Uint8Array(r),
      new Uint8Array(s)
    );

    return asn1Signature.buffer;
  }
}

async function getAttestationData(key: CryptoKey) {
  return webcrypto.subtle
    .exportKey("jwk", key)
    .then((jwk) => {
      const map = new Map<number, any>();
      map.set(CBOR_TYPE_KEY, EC2_TYPE);
      map.set(CBOR_ALGO_KEY, EC2_SHA256_ALGO);
      map.set(CBOR_CURVE_KEY, EC2_P256_CURVE);
      map.set(CBOR_X_KEY, base64.decodeUrlSafe(jwk.x!));
      map.set(CBOR_Y_KEY, base64.decodeUrlSafe(jwk.y!));
      return map;
    })
    .then((cose) => cbor.encode(cose));
}
