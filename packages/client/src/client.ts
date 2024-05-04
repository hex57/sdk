/* eslint-env node */

import type { BitField } from "bitflag-js";
import AccountRecord from "./records/Account.js";
import AccountCredentialRecord from "./records/AccountCredential.js";
import RoleRecord from "./records/Role.js";
import { APIVersion, RestClient, type RestClientOptions } from "./rest.js";

export { APIVersion } from "./rest.js";

export interface Hex57Options extends RestClientOptions {
	rpid: string;
	origin: string;
}

export class Hex57 {
	defaultRpid: string | undefined;
	defaultOrigin: string | undefined;
	rest: RestClient;

	constructor(
		key: string,
		{
			rpid,
			origin,
			apiVersion = APIVersion.ALPHA,
			apiBase = "https://www.0x57.dev/api",
			fetch = globalThis.fetch,
		}: Hex57Options
	) {
		this.rest = new RestClient(key, { apiVersion, apiBase, fetch });
		this.defaultRpid = rpid;
		this.defaultOrigin = origin;
	}

	set key(key: string) {
		this.rest.key = key;
	}

	set fetch(fetch: (url: string, options: ResponseInit) => Promise<Response>) {
		this.rest.fetch = fetch;
	}

	async register(parameters: {
		challenge: string;
		credential: string;
		username?: string;
		email?: string;
	}): Promise<AccountRecord> {
		const result = await this.rest.postAccounts(parameters);
		return new AccountRecord(this, result);
	}

	async login(parameters: {
		challenge: string;
		credential: string;
	}): Promise<AccountRecord> {
		const result = await this.rest.postSessions(parameters);
		return new AccountRecord(this, result);
	}

	async getAccount(id: string): Promise<AccountRecord> {
		const result = await this.rest.getAccount(id);
		return new AccountRecord(this, result);
	}

	async updateAccount(
		id: string,
		parameters: {
			email?: string | null;
			username?: string | null;
			flags?: BitField | bigint;
			permissions?: BitField | bigint;
		}
	): Promise<AccountRecord> {
		const result = await this.rest.patchAccount(id, parameters);
		return new AccountRecord(this, result);
	}

	async deleteAccount(id: string): Promise<boolean> {
		const result = await this.rest.deleteAccount(id);
		return result;
	}

	async createAccountCredential(
		id: string,
		parameters: { challenge: string; credential: string; name?: string }
	): Promise<AccountCredentialRecord> {
		const result = await this.rest.postAccountCredential(id, parameters);
		return new AccountCredentialRecord(this, result);
	}

	async getAccountCredential(
		accountId: string,
		id: string
	): Promise<AccountCredentialRecord> {
		const result = await this.rest.getAccountCredential(accountId, id);
		return new AccountCredentialRecord(this, result);
	}

	async updateAccountCredential(
		accountId: string,
		id: string,
		parameters: { name?: string | null }
	): Promise<AccountCredentialRecord> {
		const result = await this.rest.patchAccountCredential(
			accountId,
			id,
			parameters
		);
		return new AccountCredentialRecord(this, result);
	}

	async deleteAccountCredential(
		accountId: string,
		id: string
	): Promise<boolean> {
		const result = await this.rest.deleteAccountCredential(accountId, id);
		return result;
	}

	async createRole(parameters: {
		name: string;
		permissions: BitField | bigint;
	}): Promise<RoleRecord> {
		const result = await this.rest.postRole(parameters);
		return new RoleRecord(this, result);
	}

	async getRole(id: string): Promise<RoleRecord> {
		const result = await this.rest.getRole(id);
		return new RoleRecord(this, result);
	}

	async updateRole(
		id: string,
		parameters: {
			name?: string;
			permissions?: BitField | bigint;
		}
	): Promise<RoleRecord> {
		const result = await this.rest.patchRole(id, parameters);
		return new RoleRecord(this, result);
	}

	async deleteRole(id: string): Promise<boolean> {
		const result = await this.rest.deleteRole(id);
		return result;
	}

	async addAccountRoles(
		id: string,
		...roleIds: string[]
	): Promise<AccountRecord> {
		const result = await this.rest.postAccountRoles(id, roleIds);
		return new AccountRecord(this, result);
	}

	async removeAccountRoles(
		id: string,
		...roleIds: string[]
	): Promise<AccountRecord> {
		const result = await this.rest.deleteAccountRoles(id, roleIds);
		return new AccountRecord(this, result);
	}

	async setAccountRoles(
		id: string,
		...roleIds: string[]
	): Promise<AccountRecord> {
		const result = await this.rest.putAccountRoles(id, roleIds);
		return new AccountRecord(this, result);
	}
}
