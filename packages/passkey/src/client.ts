/* eslint-env node */
import type { Hex57Options } from "@0x57/client";
import { Hex57, RequestMethod } from "@0x57/client";
import type { Prettify } from "@0x57/interfaces";
import { AccountResponseSchema, type Account } from "@0x57/schemas";
import { parse } from "valibot";

interface ClientOptions extends Hex57Options {
	rpid: string;
	origin: string;
}

interface AccountData {
	email?: string;
	username?: string;
}

export class PasskeyClient extends Hex57 {
	defaultRpid: string | undefined;
	defaultOrigin: string | undefined;

	constructor(key: string, defaultOptions?: Prettify<ClientOptions>) {
		super(key, defaultOptions);

		this.defaultRpid = defaultOptions?.rpid;
		this.defaultOrigin = defaultOptions?.origin;
	}

	async register(parameters: {
		challenge: string;
		credential: string;
		username?: string;
		email?: string;
	}): Promise<Account> {
		const response = await this.request(RequestMethod.POST, "/accounts", {
			challenge: parameters.challenge,
			credential: parameters.credential,
			username: parameters.username,
			email: parameters.email,
		});

		const json = (await response.json()) as unknown;
		const data = parse(AccountResponseSchema, json);
		return data.account;
	}

	async login(parameters: {
		challenge: string;
		credential: string;
	}): Promise<Account> {
		const response = await this.request(RequestMethod.POST, "/sessions", {
			challenge: parameters.challenge,
			credential: parameters.credential,
		});

		const json = (await response.json()) as unknown;
		const data = parse(AccountResponseSchema, json);

		return data.account;
	}

	async getAccount(id: string): Promise<Account> {
		const response = await this.request(RequestMethod.GET, `/accounts/${id}`);

		const json = (await response.json()) as unknown;
		const data = parse(AccountResponseSchema, json);

		return data.account;
	}

	async editAccount(
		id: string,
		{ email, username }: { email?: string; username?: string }
	): Promise<Account> {
		const response = await this.request(
			RequestMethod.PATCH,
			`/accounts/${id}`,
			{
				email,
				username,
			}
		);

		const json = (await response.json()) as unknown;
		const data = parse(AccountResponseSchema, json);

		return data.account;
	}
}
