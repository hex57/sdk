import type { AccountCredential } from "@0x57/schemas";
import type { Hex57 } from "../client.js";

export default class CredentialRecord {
	readonly #client;
	readonly #id: string;
	readonly #accountId: string;
	#name: string | null;
	#signCount: number;
	#createdAt: Date;
	#updatedAt: Date;

	constructor(client: Hex57, record: AccountCredential) {
		this.#client = client;

		this.#id = record.id;
		this.#accountId = record.accountId;
		this.#name = record.name;
		this.#signCount = record.signCount;
		this.#createdAt = record.createdAt;
		this.#updatedAt = record.updatedAt;
	}

	get id() {
		return this.#id;
	}

	get accountId() {
		return this.#accountId;
	}

	get name() {
		return this.#name;
	}

	get signCount() {
		return this.#signCount;
	}

	get createdAt() {
		return this.#createdAt;
	}

	get updatedAt() {
		return this.#updatedAt;
	}

	setName(name: string) {
		this.#name = name;
		return this;
	}

	async save() {
		const result = await this.#client.rest.patchAccountCredential(
			this.accountId,
			this.id,
			{ name: this.#name }
		);
		this.#initialize(result);
	}

	async delete() {
		return this.#client.deleteAccountCredential(this.accountId, this.id);
	}

	async refresh() {
		const result = await this.#client.rest.getAccountCredential(
			this.accountId,
			this.id
		);
		this.#initialize(result);
	}

	#initialize(record: AccountCredential) {
		this.#name = record.name;
		this.#signCount = record.signCount;
		this.#createdAt = record.createdAt;
		this.#updatedAt = record.updatedAt;
	}
}
