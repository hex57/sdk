export function encodeASN1SignatureP256(r: Uint8Array, s: Uint8Array) {
    const encodeInteger = (integer: Uint8Array): Uint8Array => {
        // Remove leading zeros
        let cleanInteger = integer;
        while (cleanInteger.length > 1 && cleanInteger[0] === 0) {
            cleanInteger = cleanInteger.slice(1);
        }

        if (!cleanInteger[0]) {
            throw new Error("Invalid integer");
        }

        if (cleanInteger[0] & 0x80) {
            return new Uint8Array([0x02, cleanInteger.length + 1, 0, ...cleanInteger]);
        }

        return new Uint8Array([0x02, cleanInteger.length, ...cleanInteger]);
    };

    const encodedR = encodeInteger(r);
    const encodedS = encodeInteger(s);

    const sequenceLength = encodedR.length + encodedS.length;
    const header = new Uint8Array([0x30, sequenceLength]);

    return new Uint8Array([...header, ...encodedR, ...encodedS]);
}