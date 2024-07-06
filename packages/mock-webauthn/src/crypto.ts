let _crypto: Crypto;

if (typeof window !== "undefined") {
    _crypto = crypto;
} else {
    try {
        const { default: crypto } = await import("node:crypto");
        _crypto = crypto as Crypto;
    } catch (e) {
        throw new Error("WebCrypto is not available");
    }
}

if (!_crypto || !_crypto.subtle) {
    throw new Error("WebCrypto is not available");
}

export default _crypto;