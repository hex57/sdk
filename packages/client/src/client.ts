/* eslint-env node */

import {
	AccountListResponse,
	AccountResponse,
	CredentialListResponse,
	CredentialResponse,
	InvitationListResponse,
	InvitationResponse,
	MemberListResponse,
	MemberResponse,
	OrganizationListResponse,
	OrganizationResponse,
	RoleListResponse,
	RoleResponse,
	type Account,
	type Credential,
	type Invitation,
	type Member,
	type Organization,
	type PartialAccount,
	type PartialCredential,
	type PartialInvitation,
	type PartialMember,
	type PartialOrganization,
	type PartialRole,
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

export class Client {
	readonly #apiUrl: string;
	#key: string;
	#fetch: (url: string, options: ResponseInit) => Promise<Response>;

	constructor(
		key: string,
		{
			apiVersion = APIVersion.ALPHA,
			apiBase = "https://www.0x57.dev/api",
			fetch = globalThis.fetch,
		}: RestClientOptions,
	) {
		this.#key = key;
		this.#apiUrl = `${apiBase}/${apiVersion}`;
		this.#fetch = fetch;
	}

	// #region Client

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
		body?: Record<string, unknown>,
	) {
		const options: RequestInit = {
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json",
				"Authorization": this.#key,
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

	// #region Webauthn

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
		const data = parse(AccountResponse, json);
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
		const data = parse(AccountResponse, json);

		return data.account;
	}

	// #region Accounts

	async listAccounts(pagination?: {
		limit?: number;
		before?: string;
		after?: string;
	}): Promise<Record<string, PartialAccount>> {
		const response = await this.request(
			RequestMethod.GET,
			getURLwithSearchParams(`/accounts`, getCoercedSearchParams(pagination)),
		);

		const json = (await response.json()) as unknown;
		const data = parse(AccountListResponse, json);

		return data.accounts;
	}

	async getAccount(accountId: string): Promise<Account> {
		const response = await this.request(
			RequestMethod.GET,
			`/accounts/${accountId}`,
		);

		const json = (await response.json()) as unknown;
		const data = parse(AccountResponse, json);

		return data.account;
	}

	async updateAccount(
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
		},
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
			},
		);

		const json = (await response.json()) as unknown;
		const data = parse(AccountResponse, json);

		return data.account;
	}

	async deleteAccount(accountId: string): Promise<boolean> {
		const response = await this.request(
			RequestMethod.DELETE,
			`/accounts/${accountId}`,
		);
		return response.ok;
	}

	// #region Credentials

	async listCredentials(): Promise<Record<string, PartialCredential>> {
		const response = await this.request(
			RequestMethod.GET,
			"/accounts/credentials",
		);

		const json = (await response.json()) as unknown;
		const data = parse(CredentialListResponse, json);

		return data.credentials;
	}

	async createCredential(
		accountId: string,
		{
			challenge,
			credential,
			name,
		}: { challenge: string; credential: string; name?: string },
	): Promise<Credential> {
		const response = await this.request(
			RequestMethod.POST,
			`/accounts/${accountId}/credentials`,
			{
				challenge,
				credential,
				name,
			},
		);

		const json = (await response.json()) as unknown;
		const data = parse(CredentialResponse, json);

		return data.credential;
	}

	async getCredential(
		accountId: string,
		credentialId: string,
	): Promise<Credential> {
		const response = await this.request(
			RequestMethod.GET,
			`/accounts/${accountId}/credentials/${credentialId}`,
		);

		const json = (await response.json()) as unknown;
		const data = parse(CredentialResponse, json);

		return data.credential;
	}

	async updateCredential(
		accountId: string,
		credentialId: string,
		{ name }: { name?: string | null },
	): Promise<Credential> {
		const response = await this.request(
			RequestMethod.PATCH,
			`/accounts/${accountId}/credentials/${credentialId}`,
			{
				...(name !== undefined ? { name } : {}),
			},
		);

		const json = (await response.json()) as unknown;
		const data = parse(CredentialResponse, json);

		return data.credential;
	}

	async deleteCredential(
		accountId: string,
		credentialId: string,
	): Promise<boolean> {
		const response = await this.request(
			RequestMethod.DELETE,
			`/accounts/${accountId}/credentials/${credentialId}`,
		);

		return response.ok;
	}

	// #region Organizations

	async listOrganizations(pagination: {
		limit?: number;
		before?: string;
		after?: string;
	}): Promise<Record<string, PartialOrganization>> {
		const response = await this.request(
			RequestMethod.GET,
			getURLwithSearchParams(
				`/organizations`,
				getCoercedSearchParams(pagination),
			),
		);

		const json = (await response.json()) as unknown;
		const data = parse(OrganizationListResponse, json);

		return data.organizations;
	}

	async createOrganization(parameters: {
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
		const data = parse(OrganizationResponse, json);

		return data.organization;
	}

	async getOrganization(organizationId: string): Promise<Organization> {
		const response = await this.request(
			RequestMethod.GET,
			`/organizations/${organizationId}`,
		);

		const json = (await response.json()) as unknown;
		const data = parse(OrganizationResponse, json);

		return data.organization;
	}

	async updateOrganization(
		organizationId: string,
		{ name, flags }: { name?: string; flags?: BitField | bigint },
	): Promise<Organization> {
		const response = await this.request(
			RequestMethod.PATCH,
			`/organizations/${organizationId}`,
			{
				...(name != null ? { name } : {}),
				...(flags != null ? { permissions: flags.toString() } : {}),
			},
		);

		const json = (await response.json()) as unknown;
		const data = parse(OrganizationResponse, json);

		return data.organization;
	}

	async deleteOrganization(organizationId: string): Promise<boolean> {
		const response = await this.request(
			RequestMethod.DELETE,
			`/organizations/${organizationId}`,
		);
		return response.ok;
	}

	// #region Roles
	async listRoles(
		organizationId: string,
	): Promise<Record<string, PartialRole>> {
		const response = await this.request(
			RequestMethod.GET,
			`/organizations/${organizationId}/roles`,
		);

		const json = (await response.json()) as unknown;
		const data = parse(RoleListResponse, json);

		return data.roles;
	}

	async createRole(
		organizationId: string,
		parameters: {
			name: string;
			permissions: BitField | bigint;
		},
	): Promise<Role> {
		const response = await this.request(
			RequestMethod.POST,
			`/organizations/${organizationId}/roles`,
			{
				name: parameters.name,
				permissions: parameters.permissions.toString(),
			},
		);

		const json = (await response.json()) as unknown;
		const data = parse(RoleResponse, json);

		return data.role;
	}

	async getRole(organizationId: string, roleId: string): Promise<Role> {
		const response = await this.request(
			RequestMethod.GET,
			`/organizations/${organizationId}/roles/${roleId}`,
		);

		const json = (await response.json()) as unknown;
		const data = parse(RoleResponse, json);

		return data.role;
	}

	async updateRole(
		organizationId: string,
		roleId: string,
		parameters: {
			name?: string;
			permissions?: BitField | bigint;
		},
	): Promise<Role> {
		const response = await this.request(
			RequestMethod.PATCH,
			`/organizations/${organizationId}/roles/${roleId}`,
			{
				...(parameters.name != null ? { name: parameters.name } : {}),
				...(parameters.permissions != null
					? { permissions: parameters.permissions.toString() }
					: {}),
			},
		);

		const json = (await response.json()) as unknown;
		const data = parse(RoleResponse, json);

		return data.role;
	}

	async deleteRole(organizationId: string, roleId: string): Promise<boolean> {
		const response = await this.request(
			RequestMethod.DELETE,
			`/organizations/${organizationId}/roles/${roleId}`,
		);
		return response.ok;
	}

	// #region Invitations

	async listInvitations(
		organizationId: string,
		pagination?: {
			limit?: number;
			before?: string;
			after?: string;
		},
	): Promise<Record<string, PartialInvitation>> {
		const response = await this.request(
			RequestMethod.GET,
			getURLwithSearchParams(
				`/organizations/${organizationId}/invitations`,
				getCoercedSearchParams(pagination),
			),
		);

		const json = (await response.json()) as unknown;
		const data = parse(InvitationListResponse, json);

		return data.invitations;
	}

	async createInvitation(
		organizationId: string,
		accountId: string,
		parameters?: {
			status?: "pending" | "accepted" | "declined" | "blocked";
			flags?: BitField | bigint;
		},
	): Promise<Invitation> {
		const response = await this.request(
			RequestMethod.POST,
			`/organizations/${organizationId}/invitations/${accountId}`,
			{
				...(parameters?.status != null ? { status: parameters.status } : {}),
				...(parameters?.flags != null
					? { flags: parameters.flags.toString() }
					: {}),
			},
		);

		const json = (await response.json()) as unknown;
		const data = parse(InvitationResponse, json);

		return data.invitation;
	}

	async getInvitation(
		organizationId: string,
		accountId: string,
	): Promise<Invitation> {
		const response = await this.request(
			RequestMethod.GET,
			`/organizations/${organizationId}/invitations/${accountId}`,
		);

		const json = (await response.json()) as unknown;
		const data = parse(InvitationResponse, json);

		return data.invitation;
	}

	async updateInvitation(
		organizationId: string,
		accountId: string,
		parameters: {
			status?: "pending" | "accepted" | "declined" | "blocked";
			flags?: BitField | bigint;
		},
	): Promise<Invitation> {
		const response = await this.request(
			RequestMethod.PATCH,
			`/organizations/${organizationId}/invitations/${accountId}`,
			{
				...(parameters.status != null ? { status: parameters.status } : {}),
				...(parameters.flags != null
					? { flags: parameters.flags.toString() }
					: {}),
			},
		);

		const json = (await response.json()) as unknown;
		const data = parse(InvitationResponse, json);

		return data.invitation;
	}

	async deleteInvitation(
		organizationId: string,
		accountId: string,
	): Promise<boolean> {
		const response = await this.request(
			RequestMethod.DELETE,
			`/organizations/${organizationId}/invitations/${accountId}`,
		);
		return response.ok;
	}

	// #region Members

	async listMembers(
		organizationId: string,
		pagination?: {
			limit?: number;
			before?: string;
			after?: string;
		},
	): Promise<Record<string, PartialMember>> {
		const response = await this.request(
			RequestMethod.GET,
			getURLwithSearchParams(
				`/organizations/${organizationId}/members`,
				getCoercedSearchParams(pagination),
			),
		);

		const json = (await response.json()) as unknown;
		const data = parse(MemberListResponse, json);

		return data.members;
	}

	async addMember(
		organizationId: string,
		accountId: string,
		parameters?: {
			flags?: BitField | bigint;
		},
	): Promise<Member> {
		const response = await this.request(
			RequestMethod.POST,
			`/organizations/${organizationId}/members/${accountId}`,
			{
				...(parameters?.flags != null
					? { flags: parameters.flags.toString() }
					: {}),
			},
		);

		const json = (await response.json()) as unknown;
		const data = parse(MemberResponse, json);

		return data.member;
	}

	async getMember(organizationId: string, accountId: string): Promise<Member> {
		const response = await this.request(
			RequestMethod.GET,
			`/organizations/${organizationId}/members/${accountId}`,
		);

		const json = (await response.json()) as unknown;
		const data = parse(MemberResponse, json);

		return data.member;
	}

	async updateMember(
		organizationId: string,
		accountId: string,
		parameters: {
			flags?: BitField | bigint;
			permissions?: BitField | bigint;
		},
	): Promise<Member> {
		const response = await this.request(
			RequestMethod.PATCH,
			`/organizations/${organizationId}/members/${accountId}`,
			{
				...(parameters.flags != null
					? { flags: parameters.flags.toString() }
					: {}),
			},
		);

		const json = (await response.json()) as unknown;
		const data = parse(MemberResponse, json);

		return data.member;
	}

	async removeMember(
		organizationId: string,
		accountId: string,
	): Promise<boolean> {
		const response = await this.request(
			RequestMethod.DELETE,
			`/organizations/${organizationId}/members/${accountId}`,
		);
		return response.ok;
	}

	// #region Member Roles

	async listMemberRoles(
		organizationId: string,
		accountId: string,
		pagination?: {
			limit?: number;
			before?: string;
			after?: string;
		},
	): Promise<Record<string, PartialRole>> {
		const response = await this.request(
			RequestMethod.GET,
			getURLwithSearchParams(
				`/organizations/${organizationId}/members/${accountId}/roles`,
				getCoercedSearchParams(pagination),
			),
		);

		const json = (await response.json()) as unknown;
		const data = parse(RoleListResponse, json);

		return data.roles;
	}

	async addMemberRole(
		organizationId: string,
		accountId: string,
		roleId: string,
	): Promise<Member> {
		const response = await this.request(
			RequestMethod.POST,
			`/organizations/${organizationId}/members/${accountId}/roles/${roleId}`,
		);

		const json = (await response.json()) as unknown;
		const data = parse(MemberResponse, json);

		return data.member;
	}

	async removeMemberRole(
		organizationId: string,
		accountId: string,
		roleId: string,
	): Promise<boolean> {
		const response = await this.request(
			RequestMethod.DELETE,
			`organizations/${organizationId}/members/${accountId}/roles/${roleId}`,
		);
		return response.ok;
	}
}
