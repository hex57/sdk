import {SigningKey} from "./key.js";
import webcrypto from "./crypto.js";
import cbor from 'cbor-web';
import * as base64 from "./base64.js";
import {encodeUrlSafe} from "./base64.js";

const EC2_TYPE = 2;
const EC2_P256_CURVE = 1;
const EC2_SHA256_ALGO = -7;

export class EC2SigningKey implements SigningKey {
    constructor (private sk: CryptoKey, public readonly attestationData: ArrayBuffer) {}

    static async generate() {
        const k = await webcrypto.subtle.generateKey({
            name: "ECDSA",
            namedCurve: "P-256",
        }, true, ["sign"]);
        // const keyData = await subtle.exportKey("pkcs8", k.privateKey);
        const attestationData = await getAttestationData(k.privateKey);
        return new EC2SigningKey(k.privateKey, attestationData);
    }

    static async import(data: ArrayBuffer) {
        const key = await webcrypto.subtle.importKey("pkcs8", data, {
            name: "ECDSA",
            namedCurve: "P-256",
        }, true, ["sign"]);
        const attestationData = await getAttestationData(key);
        return new EC2SigningKey(key, attestationData);
    }

    async export() {
        return webcrypto.subtle.exportKey("pkcs8", this.sk);
    }

    async sign(data: ArrayBuffer) {
        const sig = await webcrypto.subtle.sign({
            name: "ECDSA",
            hash: "SHA-256",
        }, this.sk, data);
        return new Uint8Array(sig);
    }
}

function getAttestationData(key: CryptoKey) {
    return webcrypto.subtle.exportKey('jwk', key)
        .then(jwk => ({
            type: EC2_TYPE,
            algo: EC2_SHA256_ALGO,
            curve: EC2_P256_CURVE,
            x: base64.decodeUrlSafe(jwk.x!),
            y: base64.decodeUrlSafe(jwk.y!)
        }))
        .then(info => cbor.encode(info));
}

interface EC2KeyInfo {
    type: typeof EC2_TYPE;
    algo: typeof EC2_SHA256_ALGO;
    curve: typeof EC2_P256_CURVE;
    x: ArrayBuffer;
    y: ArrayBuffer;
}