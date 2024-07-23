/* eslint-env node */

import type { BitField } from "bitflag-js";
import { Base0x57Error } from "./lib/errors.js";
import AccountRecord from "./records/Account.js";
import CredentialRecord from "./records/Credential.js";
import OrganizationRecord from "./records/Organization.js";
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

	async safe<T>(promise: Promise<T>): Promise<T | undefined> {
		try {
			return await promise;
		} catch (error) {
			if (error instanceof Base0x57Error) {
				return undefined;
			}

			throw error;
		}
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

	async getAccount(accountId: string): Promise<AccountRecord> {
		const result = await this.rest.getAccount(accountId);
		return new AccountRecord(this, result);
	}

	async updateAccount(
		accountId: string,
		parameters: {
			email?: string | null;
			username?: string | null;
			flags?: BitField | bigint;
			permissions?: BitField | bigint;
		}
	): Promise<AccountRecord> {
		const result = await this.rest.patchAccount(accountId, parameters);
		return new AccountRecord(this, result);
	}

	async deleteAccount(accountId: string): Promise<boolean> {
		const result = await this.rest.deleteAccount(accountId);
		return result;
	}

	async createAccountCredential(
		accountId: string,
		parameters: { challenge: string; credential: string; name?: string }
	): Promise<CredentialRecord> {
		const result = await this.rest.postAccountCredential(accountId, parameters);
		return new CredentialRecord(this, result);
	}

	async getAccountCredential(
		accountId: string,
		credentialId: string
	): Promise<CredentialRecord> {
		const result = await this.rest.getAccountCredential(
			accountId,
			credentialId
		);
		return new CredentialRecord(this, result);
	}

	async updateAccountCredential(
		accountId: string,
		credentialId: string,
		parameters: { name?: string | null }
	): Promise<CredentialRecord> {
		const result = await this.rest.patchAccountCredential(
			accountId,
			credentialId,
			parameters
		);
		return new CredentialRecord(this, result);
	}

	async deleteAccountCredential(
		accountId: string,
		credentialId: string
	): Promise<boolean> {
		const result = await this.rest.deleteAccountCredential(
			accountId,
			credentialId
		);
		return result;
	}

	async createOrganization(parameters: {
		name: string;
		flags: BitField;
	}): Promise<OrganizationRecord> {
		const result = await this.rest.postOrganization(parameters);
		return new OrganizationRecord(this, result);
	}

	async getOrganization(organizationId: string): Promise<OrganizationRecord> {
		const result = await this.rest.getOrganization(organizationId);
		return new OrganizationRecord(this, result);
	}

	async updateOrganization(
		organizationId: string,
		parameters: { name?: string; flags?: BitField }
	): Promise<OrganizationRecord> {
		const result = await this.rest.patchOrganization(
			organizationId,
			parameters
		);
		return new OrganizationRecord(this, result);
	}

	async deleteOrganization(organizationId: string): Promise<boolean> {
		const result = await this.rest.deleteOrganization(organizationId);
		return result;
	}

	// addOrganizationInvitation;
	// getOrganizationInvitation;
	// updateOrganizationInvitation;
	// deleteOrganizationInvitation;

	// addOrganizationMember;
	// getOrganizationMember;
	// updateOrganizationMember;
	// deleteOrganizationMember;

	// addOrganizationMemberRole;
	// getOrganizationMemberRole;
	// updateOrganizationMemberRole;
	// deleteOrganizationMemberRole;

	async createOrganizationRole(
		organizationId: string,
		parameters: {
			name: string;
			permissions: BitField | bigint;
		}
	): Promise<RoleRecord> {
		const result = await this.rest.postOrganizationRole(
			organizationId,
			parameters
		);

		return new RoleRecord(this, result);
	}

	async getOrganizationRole(
		organizationId: string,
		roleId: string
	): Promise<RoleRecord> {
		const result = await this.rest.getOrganizationRole(organizationId, roleId);
		return new RoleRecord(this, result);
	}

	async updateOrganizationRole(
		organizationId: string,
		roleId: string,
		parameters: {
			name?: string;
			permissions?: BitField | bigint;
		}
	): Promise<RoleRecord> {
		const result = await this.rest.patchOrganizationRole(
			organizationId,
			roleId,
			parameters
		);

		return new RoleRecord(this, result);
	}

	async deleteOrganizationRole(
		organizationId: string,
		roleId: string
	): Promise<boolean> {
		const result = await this.rest.deleteOrganizationRole(
			organizationId,
			roleId
		);

		return result;
	}

	// async addAccountRoles(
	// 	id: string,
	// 	...roleIds: string[]
	// ): Promise<AccountRecord> {
	// 	const result = await this.rest.postAccountRoles(id, roleIds);
	// 	return new AccountRecord(this, result);
	// }

	// async removeAccountRoles(
	// 	id: string,
	// 	...roleIds: string[]
	// ): Promise<AccountRecord> {
	// 	const result = await this.rest.deleteAccountRoles(id, roleIds);
	// 	return new AccountRecord(this, result);
	// }

	// async setAccountRoles(
	// 	id: string,
	// 	...roleIds: string[]
	// ): Promise<AccountRecord> {
	// 	const result = await this.rest.putAccountRoles(id, roleIds);
	// 	return new AccountRecord(this, result);
	// }
}
