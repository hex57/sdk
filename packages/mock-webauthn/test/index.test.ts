import {test} from "vitest";
import * as mockWebauthn from "../src/index.js";
import {KeyType} from "../src/index.js";
import {verifyRegistrationResponse} from "@simplewebauthn/server";

test("EC2 Attestation E2E", async ({ expect }) => {
    const ec2keys = await mockWebauthn.EC2SigningKey.generate().then(ec2 => ec2.export());
    expect(ec2keys).toBeDefined();
    expect(ec2keys.privateKey).toBeDefined();
    expect(ec2keys.publicKey).toBeDefined();

    const key = new mockWebauthn.Key(KeyType.KeyTypeEC2, ec2keys);
    expect(key).toBeDefined();
    expect(key.type).toBe(KeyType.KeyTypeEC2);

    const cred = mockWebauthn.Credential.create(key);
    expect(cred).toBeDefined();
    expect(cred.id.byteLength).toBe(32);
    expect(cred.key).toBe(key);

    const rp: mockWebauthn.RelyingParty = {
        id: "localhost",
        name: "localhost",
        origin: "http://localhost:3000",
    }
    const userHandle: ArrayBuffer = new TextEncoder().encode("leah@0x57.dev");
    const auth = mockWebauthn.Authenticator.create({
        userHandle,
        userNotPresent: false,
        userNotVerified: false,
    });
    expect(auth.aaguid.byteLength).toBe(16);

    const challengeEnc = new TextEncoder().encode("thisisaverytoughchallenge");
    const attestationResponse = await mockWebauthn.createAttestationResponse(rp, auth, cred, {
        userID: "0123456789abcdef",
        userName: "leah@0x57.dev",
        userDisplayName: "Leah",
        challenge: challengeEnc,
        excludeCredentials: [],
    });
    expect(attestationResponse).toBeDefined();
    expect(attestationResponse.length).toBeGreaterThan(0);

    const verification = await verifyRegistrationResponse({
        response: JSON.parse(attestationResponse) as any,
        expectedChallenge: mockWebauthn.base64.encodeUrlSafe(challengeEnc),
        requireUserVerification: false,
        expectedRPID: rp.id,
        expectedOrigin: rp.origin,
        supportedAlgorithmIDs: [-7, -257],
    });

    expect(verification.verified).toBe(true);
    expect(verification.registrationInfo).toBeDefined();
    expect(verification.registrationInfo!.rpID).toBe(rp.id);
});
