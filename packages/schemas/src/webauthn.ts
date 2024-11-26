import * as v from "valibot";

export const AttestationConveyancePreferenceSchema = v.union([
	v.literal("direct"),
	v.literal("enterprise"),
	v.literal("indirect"),
	v.literal("none"),
]);

export const AuthenticatorAttachmentSchema = v.union([
	v.literal("platform"),
	v.literal("cross-platform"),
]);

export const ResidentKeyRequirementSchema = v.union([
	v.literal("discouraged"),
	v.literal("preferred"),
	v.literal("required"),
]);

export const UserVerificationRequirementSchema = v.union([
	v.literal("discouraged"),
	v.literal("preferred"),
	v.literal("required"),
]);

export const AuthenticatorTransportSchema = v.union([
	v.literal("ble"),
	v.literal("hybrid"),
	v.literal("internal"),
	v.literal("nfc"),
	v.literal("usb"),
]);

export const AuthenticatorAssertionResponseSchema = v.object({
	clientDataJSON: v.string(),
	authenticatorData: v.string(),
	signature: v.string(),
	userHandle: v.optional(v.string()),
});

export const AuthenticatorSelectionCriteriaSchema = v.object({
	authenticatorAttachment: v.optional(AuthenticatorAttachmentSchema),
	requireResidentKey: v.optional(v.boolean()),
	residentKey: v.optional(ResidentKeyRequirementSchema),
	userVerification: v.optional(UserVerificationRequirementSchema),
});

export const PublicKeyCredentialDescriptorSchema = v.object({
	type: v.string(),
	id: v.string(),
	transports: v.optional(v.array(AuthenticatorTransportSchema)),
});

export const SimpleWebAuthnExtensionsSchema = v.object({
	appid: v.optional(v.string()),
	appidExclude: v.optional(v.string()),
	credProps: v.optional(v.boolean()),
});

export const PublicKeyCredentialRequestOptionsSchema = v.object({
	challenge: v.string(),
	timeout: v.optional(v.number()),
	rpId: v.optional(v.string()),
	allowCredentials: v.optional(v.array(PublicKeyCredentialDescriptorSchema)),
	userVerification: v.optional(UserVerificationRequirementSchema),
	extensions: v.optional(SimpleWebAuthnExtensionsSchema),
});

export const PublicKeyCredentialWithAssertionSchema = v.object({
	response: AuthenticatorAssertionResponseSchema,
	clientExtensionResults: SimpleWebAuthnExtensionsSchema,
});

export const PublicKeyCredentialRpEntitySchema = v.object({
	id: v.optional(v.string()),
	name: v.string(),
});

export const PublicKeyCredentialUserEntitySchema = v.object({
	id: v.string(),
	displayName: v.optional(v.string()),
	name: v.optional(v.string()),
});

export const PublicKeyCredentialParametersSchema = v.object({
	type: v.string(),
	alg: v.number(),
});

export const PublicKeyCredentialCreationOptionsSchema = v.object({
	rp: PublicKeyCredentialRpEntitySchema,
	user: PublicKeyCredentialUserEntitySchema,
	challenge: v.string(),
	pubKeyCredParams: v.array(PublicKeyCredentialParametersSchema),
	timeout: v.optional(v.number()),
	excludeCredentials: v.optional(v.array(PublicKeyCredentialDescriptorSchema)),
	authenticatorSelection: v.optional(AuthenticatorSelectionCriteriaSchema),
	attestation: v.optional(AttestationConveyancePreferenceSchema),
	extensions: v.optional(SimpleWebAuthnExtensionsSchema),
});
