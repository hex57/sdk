import { RequestMethod, RESTClient, RestClientOptions } from "@0x57/client";
import { webauthn, Workspace as WorkspaceSchema } from "@0x57/schemas";

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

		return v.parse(
			v.object({
				options: webauthn.PublicKeyCredentialRequestOptionsSchema,
			}),
			await response.json(),
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

		return v.parse(AuthenticationResponse, await response.json());
	}

	async getRegistrationChallenge() {
		const response = await this.request(RequestMethod.GET, "/register");

		return v.parse(
			v.object({
				options: webauthn.PublicKeyCredentialCreationOptionsSchema,
			}),
			await response.json(),
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

		return v.parse(AuthenticationResponse, await response.json());
	}

	async getWorkspaces() {
		const response = await this.request(RequestMethod.GET, "/workspaces");

		return v.parse(
			v.object({
				workspaces: v.array(WorkspaceSchema),
			}),
			await response.json(),
		);
	}

	async getWorkspace(id: string) {
		const response = await this.request(RequestMethod.GET, `/workspaces/${id}`);

		return v.parse(
			v.object({
				workspace: WorkspaceSchema,
			}),
			await response.json(),
		);
	}

	async createWorkspace(workspace: {
		name: string;
		production: { name: string; rpid: string; origin: string };
		development: { name: string; rpid: string; origin: string };
	}) {
		const response = await this.request(
			RequestMethod.POST,
			"/workspaces",
			workspace,
		);

		return v.parse(
			v.object({
				workspace: WorkspaceSchema,
			}),
			await response.json(),
		);
	}
}
