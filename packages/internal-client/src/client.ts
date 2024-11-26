import { RESTClient, RequestMethod, RestClientOptions } from "@0x57/client";
import { webauthn } from "@0x57/schemas";

import * as v from "valibot";
import { AuthenticationResponse } from "./schema.js";

export class Client extends RESTClient {
	constructor(
		key: string,
		{
			apiBase = "https://www.0x57.dev/api",
			fetch = globalThis.fetch,
		}: RestClientOptions,
	) {
		super(key, {
			apiBase,
			fetch,
			apiVersion: "dashboard" as any,
		});
	}

	async getLoginChallenge() {
		const response = await this.request(RequestMethod.GET, "/login");

		const json = (await response.json()) as unknown;

		return v.parse(
			v.object({
				options: webauthn.PublicKeyCredentialRequestOptionsSchema,
				token: v.string(),
			}),
			json,
		);
	}

	async login({
		credential,
		challenge,
	}: {
		credential: v.InferOutput<
			typeof webauthn.PublicKeyCredentialWithAssertionSchema
		>;
		challenge: string;
	}) {
		const response = await this.request(RequestMethod.POST, "/login", {
			credential,
			challenge,
		});

		const json = (await response.json()) as unknown;

		return v.parse(AuthenticationResponse, json);
	}

	async getRegistrationChallenge() {
		const response = await this.request(RequestMethod.GET, "/register");

		const json = (await response.json()) as unknown;

		return v.parse(
			v.object({
				options: webauthn.PublicKeyCredentialCreationOptionsSchema,
				token: v.string(),
			}),
			json,
		);
	}

	async register({
		email,
		username,
		credential,
		challenge,
	}: {
		email?: string;
		username?: string;
		credential: v.InferOutput<
			typeof webauthn.PublicKeyCredentialWithAssertionSchema
		>;
		challenge: string;
	}) {
		const response = await this.request(RequestMethod.POST, "/register", {
			email,
			username,
			credential,
			challenge,
		});

		const json = (await response.json()) as unknown;

		return v.parse(AuthenticationResponse, json);
	}
}
