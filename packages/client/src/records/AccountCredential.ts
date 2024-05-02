import type { AccountCredential } from "@0x57/schemas";
import type { Hex57 } from "../client.js";

export default class AccountCredentialRecord {
	id: string;
	accountId: string;
	name: string | null;
	signCount: number;
	createdAt: Date;
	updatedAt: Date;
	readonly #client;

	constructor(client: Hex57, record: AccountCredential) {
		this.#client = client;

		this.id = record.id;
		this.accountId = record.accountId;
		this.name = record.name;
		this.signCount = record.signCount;
		this.createdAt = record.createdAt;
		this.updatedAt = record.updatedAt;
	}

	async update(params: { name?: string | null }) {
		const result = await this.#client.updateAccountCredential(
			this.accountId,
			this.id,
			params
		);
		this.#initialize(result);
	}

	async delete() {
		return this.#client.deleteAccountCredential(this.accountId, this.id);
	}

	#initialize(record: AccountCredential) {
		this.name = record.name;
		this.signCount = record.signCount;
		this.createdAt = record.createdAt;
		this.updatedAt = record.updatedAt;
	}
}
