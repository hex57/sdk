/* eslint-env node */

import {
	AccountCredentialResponseSchema,
	AccountListResponseSchema,
	AccountResponseSchema,
	InvitationListResponseSchema,
	InvitationResponseSchema,
	MemberListResponseSchema,
	MemberResponseSchema,
	OrganizationListResponseSchema,
	OrganizationResponseSchema,
	RoleListResponseSchema,
	RoleResponseSchema,
	type Account,
	type AccountCredential,
	type Invitation,
	type Member,
	type Organization,
	type Role,
} from "@0x57/schemas";
import type { BitField } from "bitflag-js";
import { parse } from "valibot";
import { getErrors } from "./lib/errors.js";
import { getCoercedSearchParams, getURLwithSearchParams } from "./lib/urls.js";

export enum RequestMethod {
	GET = "GET",
	POST = "POST",
	PATCH = "PATCH",
	PUT = "PUT",
	DELETE = "DELETE",
}

export enum APIVersion {
	ALPHA = "alpha",
}

export interface RestClientOptions {
	apiVersion?: APIVersion;
	apiBase?: string;
	fetch?: (url: string, options: ResponseInit) => Promise<Response>;
}

export class RestClient {
	readonly #apiUrl: string;
	#key: string;
	#fetch: (url: string, options: ResponseInit) => Promise<Response>;

	constructor(
		key: string,
		{
			apiVersion = APIVersion.ALPHA,
			apiBase = "https://www.0x57.dev/api",
			fetch = globalThis.fetch,
		}: RestClientOptions
	) {
		this.#key = key;
		this.#apiUrl = `${apiBase}/${apiVersion}`;
		this.#fetch = fetch;
	}

	set key(key: string) {
		this.#key = key;
	}

	set fetch(fetch: (url: string, options: ResponseInit) => Promise<Response>) {
		this.#fetch = fetch;
	}

	url(path: string) {
		return `${this.#apiUrl}${path}`;
	}

	async request<T>(
		method: RequestMethod,
		url: string,
		body?: Record<string, unknown>
	) {
		const options: RequestInit = {
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: this.#key,
			},
			method,
		};

		if (body != null) {
			options.body = JSON.stringify(body);
		}

		const response = await this.#fetch(this.url(url), options);

		if (response.status === 500) {
			throw new Error("0x57 Service returned a 500");
		}

		if (!response.ok) {
			await getErrors(response);
		}

		return response;
	}

	/**
	 * API Methods
	 */

	async postAccounts(parameters: {
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

	async postSessions(parameters: {
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

	async getAccount(accountId: string): Promise<Account> {
		const response = await this.request(
			RequestMethod.GET,
			`/accounts/${accountId}`
		);

		const json = (await response.json()) as unknown;
		const data = parse(AccountResponseSchema, json);

		return data.account;
	}

	async patchAccount(
		accountId: string,
		{
			email,
			username,
			permissions,
			flags,
		}: {
			email?: string | null;
			username?: string | null;
			flags?: BitField | bigint;
			permissions?: BitField | bigint;
		}
	): Promise<Account> {
		const response = await this.request(
			RequestMethod.PATCH,
			`/accounts/${accountId}`,
			{
				...(email !== undefined ? { email } : {}),
				...(username !== undefined ? { username } : {}),
				...(permissions !== undefined
					? { permissions: permissions.toString() }
					: {}),
				...(flags !== undefined ? { flags: flags.toString() } : {}),
			}
		);

		const json = (await response.json()) as unknown;
		const data = parse(AccountResponseSchema, json);

		return data.account;
	}

	async deleteAccount(accountId: string): Promise<boolean> {
		const response = await this.request(
			RequestMethod.DELETE,
			`/accounts/${accountId}`
		);
		return response.ok;
	}

	async postAccountCredential(
		accountId: string,
		{
			challenge,
			credential,
			name,
		}: { challenge: string; credential: string; name?: string }
	): Promise<AccountCredential> {
		const response = await this.request(
			RequestMethod.POST,
			`/accounts/${accountId}/credentials`,
			{
				challenge,
				credential,
				name,
			}
		);

		const json = (await response.json()) as unknown;
		const data = parse(AccountCredentialResponseSchema, json);

		return data.credential;
	}

	async getAccountCredential(
		accountId: string,
		credentialId: string
	): Promise<AccountCredential> {
		const response = await this.request(
			RequestMethod.GET,
			`/accounts/${accountId}/credentials/${credentialId}`
		);

		const json = (await response.json()) as unknown;
		const data = parse(AccountCredentialResponseSchema, json);

		return data.credential;
	}

	async patchAccountCredential(
		accountId: string,
		credentialId: string,
		{ name }: { name?: string | null }
	): Promise<AccountCredential> {
		const response = await this.request(
			RequestMethod.PATCH,
			`/accounts/${accountId}/credentials/${credentialId}`,
			{
				...(name !== undefined ? { name } : {}),
			}
		);

		const json = (await response.json()) as unknown;
		const data = parse(AccountCredentialResponseSchema, json);

		return data.credential;
	}

	async deleteAccountCredential(
		accountId: string,
		credentialId: string
	): Promise<boolean> {
		const response = await this.request(
			RequestMethod.DELETE,
			`/accounts/${accountId}/credentials/${credentialId}`
		);
		return response.ok;
	}

	async getAccounts(pagination?: {
		limit?: number;
		before?: string;
		after?: string;
	}): Promise<Account[]> {
		const response = await this.request(
			RequestMethod.GET,
			getURLwithSearchParams(`/accounts`, getCoercedSearchParams(pagination))
		);

		const json = (await response.json()) as unknown;
		const data = parse(AccountListResponseSchema, json);

		return data.accounts;
	}

	async deleteOrganizationInvitation(
		organizationId: string,
		accountId: string
	): Promise<boolean> {
		const response = await this.request(
			RequestMethod.DELETE,
			`/organizations/${organizationId}/invitations/${accountId}`
		);
		return response.ok;
	}

	async getOrganizationInvitation(
		organizationId: string,
		accountId: string
	): Promise<Invitation> {
		const response = await this.request(
			RequestMethod.GET,
			`/organizations/${organizationId}/invitations/${accountId}`
		);

		const json = (await response.json()) as unknown;
		const data = parse(InvitationResponseSchema, json);

		return data.invitation;
	}

	async patchOrganizationInvitation(
		organizationId: string,
		accountId: string,
		parameters: {
			status?: "pending" | "accepted" | "declined" | "blocked";
			flags?: BitField | bigint;
		}
	): Promise<Member> {
		const response = await this.request(
			RequestMethod.PATCH,
			`/organizations/${organizationId}/invitations/${accountId}`,
			{
				...(parameters.status != null ? { status: parameters.status } : {}),
				...(parameters.flags != null
					? { flags: parameters.flags.toString() }
					: {}),
			}
		);

		const json = (await response.json()) as unknown;
		const data = parse(MemberResponseSchema, json);

		return data.member;
	}

	async postOrganizationInvitation(
		organizationId: string,
		accountId: string,
		parameters: {
			status?: "pending" | "accepted" | "declined" | "blocked";
			flags?: BitField | bigint;
		}
	): Promise<Invitation> {
		const response = await this.request(
			RequestMethod.POST,
			`/organizations/${organizationId}/invitations/${accountId}`,
			{
				...(parameters?.status != null ? { status: parameters.status } : {}),
				...(parameters?.flags != null
					? { flags: parameters.flags.toString() }
					: {}),
			}
		);

		const json = (await response.json()) as unknown;
		const data = parse(InvitationResponseSchema, json);

		return data.invitation;
	}

	async getOrganizationInvitations(
		organizationId: string,
		pagination?: {
			limit?: number;
			before?: string;
			after?: string;
		}
	): Promise<Invitation[]> {
		const response = await this.request(
			RequestMethod.GET,
			getURLwithSearchParams(
				`/organizations/${organizationId}/invitations`,
				getCoercedSearchParams(pagination)
			)
		);

		const json = (await response.json()) as unknown;
		const data = parse(InvitationListResponseSchema, json);

		return data.invitations;
	}

	async deleteOrganizationMemberRole(
		organizationId: string,
		accountId: string,
		roleId: string
	): Promise<boolean> {
		const response = await this.request(
			RequestMethod.DELETE,
			`organizations/${organizationId}/members/${accountId}/roles/${roleId}`
		);
		return response.ok;
	}

	async postOrganizationMemberRole(
		organizationId: string,
		accountId: string,
		roleId: string
	): Promise<Member> {
		const response = await this.request(
			RequestMethod.POST,
			`/organizations/${organizationId}/members/${accountId}/roles/${roleId}`
		);

		const json = (await response.json()) as unknown;
		const data = parse(MemberResponseSchema, json);

		return data.member;
	}

	async getOrganizationMemberRoles(
		organizationId: string,
		accountId: string,
		pagination?: {
			limit?: number;
			before?: string;
			after?: string;
		}
	): Promise<Role[]> {
		const response = await this.request(
			RequestMethod.GET,
			getURLwithSearchParams(
				`/organizations/${organizationId}/members/${accountId}/roles`,
				getCoercedSearchParams(pagination)
			)
		);

		const json = (await response.json()) as unknown;
		const data = parse(RoleListResponseSchema, json);

		return data.roles;
	}

	async deleteOrganizationMember(
		organizationId: string,
		accountId: string
	): Promise<boolean> {
		const response = await this.request(
			RequestMethod.DELETE,
			`/organizations/${organizationId}/members/${accountId}`
		);
		return response.ok;
	}

	async getOrganizationMember(
		organizationId: string,
		accountId: string
	): Promise<Member> {
		const response = await this.request(
			RequestMethod.GET,
			`/organizations/${organizationId}/members/${accountId}`
		);

		const json = (await response.json()) as unknown;
		const data = parse(MemberResponseSchema, json);

		return data.member;
	}

	async patchOrganizationMember(
		organizationId: string,
		accountId: string,
		parameters: {
			flags?: BitField | bigint;
		}
	): Promise<Member> {
		const response = await this.request(
			RequestMethod.PATCH,
			`/organizations/${organizationId}/members/${accountId}`,
			{
				...(parameters.flags != null
					? { flags: parameters.flags.toString() }
					: {}),
			}
		);

		const json = (await response.json()) as unknown;
		const data = parse(MemberResponseSchema, json);

		return data.member;
	}

	async getOrganizationMembers(
		organizationId: string,
		pagination?: {
			limit?: number;
			before?: string;
			after?: string;
		}
	): Promise<Member[]> {
		const response = await this.request(
			RequestMethod.GET,
			getURLwithSearchParams(
				`/organizations/${organizationId}/members`,
				getCoercedSearchParams(pagination)
			)
		);

		const json = (await response.json()) as unknown;
		const data = parse(MemberListResponseSchema, json);

		return data.members;
	}

	async postOrganizationMember(
		organizationId: string,
		accountId: string,
		parameters?: {
			flags?: BitField | bigint;
		}
	): Promise<Member> {
		const response = await this.request(
			RequestMethod.POST,
			`/organizations/${organizationId}/members/${accountId}`,
			{
				...(parameters?.flags != null
					? { flags: parameters.flags.toString() }
					: {}),
			}
		);

		const json = (await response.json()) as unknown;
		const data = parse(MemberResponseSchema, json);

		return data.member;
	}

	async deleteOrganizationRole(
		organizationId: string,
		roleId: string
	): Promise<boolean> {
		const response = await this.request(
			RequestMethod.DELETE,
			`/organizations/${organizationId}/roles/${roleId}`
		);
		return response.ok;
	}

	async getOrganizationRole(
		organizationId: string,
		roleId: string
	): Promise<Role> {
		const response = await this.request(
			RequestMethod.GET,
			`/organizations/${organizationId}/roles/${roleId}`
		);

		const json = (await response.json()) as unknown;
		const data = parse(RoleResponseSchema, json);

		return data.role;
	}

	async patchOrganizationRole(
		organizationId: string,
		roleId: string,
		parameters: {
			name?: string;
			permissions?: BitField | bigint;
		}
	): Promise<Role> {
		const response = await this.request(
			RequestMethod.PATCH,
			`/organizations/${organizationId}/roles/${roleId}`,
			{
				...(parameters.name != null ? { name: parameters.name } : {}),
				...(parameters.permissions != null
					? { permissions: parameters.permissions.toString() }
					: {}),
			}
		);

		const json = (await response.json()) as unknown;
		const data = parse(RoleResponseSchema, json);

		return data.role;
	}

	async postOrganizationRole(
		organizationId: string,
		parameters: {
			name: string;
			permissions: BitField | bigint;
		}
	) {
		const response = await this.request(
			RequestMethod.POST,
			`/organizations/${organizationId}/roles`,
			{
				name: parameters.name,
				permissions: parameters.permissions.toString(),
			}
		);

		const json = (await response.json()) as unknown;
		const data = parse(RoleResponseSchema, json);

		return data.role;
	}

	async deleteOrganization(organizationId: string): Promise<boolean> {
		const response = await this.request(
			RequestMethod.DELETE,
			`/organizations/${organizationId}`
		);
		return response.ok;
	}

	async getOrganization(organizationId: string): Promise<Organization> {
		const response = await this.request(
			RequestMethod.GET,
			`/organizations/${organizationId}`
		);

		const json = (await response.json()) as unknown;
		const data = parse(OrganizationResponseSchema, json);

		return data.organization;
	}

	async patchOrganization(
		organizationId: string,
		{ name, flags }: { name?: string; flags?: BitField | bigint }
	): Promise<Organization> {
		const response = await this.request(
			RequestMethod.PATCH,
			`/organizations/${organizationId}`,
			{
				...(name != null ? { name } : {}),
				...(flags != null ? { permissions: flags.toString() } : {}),
			}
		);

		const json = (await response.json()) as unknown;
		const data = parse(OrganizationResponseSchema, json);

		return data.organization;
	}

	async getOrganizations(pagination: {
		limit?: number;
		before?: string;
		after?: string;
	}): Promise<Organization[]> {
		const response = await this.request(
			RequestMethod.GET,
			getURLwithSearchParams(
				`/organizations`,
				getCoercedSearchParams(pagination)
			)
		);

		const json = (await response.json()) as unknown;
		const data = parse(OrganizationListResponseSchema, json);

		return data.organizations;
	}

	async postOrganization(parameters: {
		name: string;
		flags?: BitField | bigint;
	}): Promise<Organization> {
		const response = await this.request(RequestMethod.POST, `/organizations`, {
			name: parameters.name,
			...(parameters.flags != null
				? { flags: parameters.flags.toString() }
				: {}),
		});

		const json = (await response.json()) as unknown;
		const data = parse(OrganizationResponseSchema, json);

		return data.organization;
	}
}
