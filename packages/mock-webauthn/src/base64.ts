export function encode(data: ArrayBuffer): string {
  // eslint-disable-next-line no-restricted-globals
  return btoa(String.fromCharCode(...new Uint8Array(data)));
}

export function decode(data: string): ArrayBuffer {
  // eslint-disable-next-line no-restricted-globals
  return Uint8Array.from(atob(data), (c) => c.charCodeAt(0)).buffer;
}

export function encodeUrlSafe(data: ArrayBuffer): string {
  return encode(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function decodeUrlSafe(data: string): ArrayBuffer {
  return decode(data.replace(/-/g, "+").replace(/_/g, "/").replace(/=/g, ""));
}

export function stringToArrayBuffer(data: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(data).buffer;
}

export function arrayBufferToString(data: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(data);
}

export function bigEndianBytes(
  value: Uint32Array[0],
  length: number,
): Uint8Array {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    const shift = (length - i - 1) * 8;
    bytes[i] = (value >> shift) & 0xff;
  }

  return bytes;
}

export function authenticatorDataFlags(
  userPresent: boolean,
  userVerified: boolean,
  backupEligible: boolean,
  backupState: boolean,
  attestation: boolean,
  extensions: boolean,
): number {
  // https://www.w3.org/TR/webauthn/#flags
  let flags = 0;
  if (userPresent) {
    flags |= 1 << 0;
  }

  if (userVerified) {
    flags |= 1 << 2;
  }

  if (backupEligible) {
    flags |= 1 << 3;
  }

  if (backupState) {
    flags |= 1 << 4;
  }

  if (attestation) {
    flags |= 1 << 6;
  }

  if (extensions) {
    // extensions not supported yet
    flags |= 1 << 7;
  }

  return flags;
}
