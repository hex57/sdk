import type { Invitation } from "@0x57/schemas";
import { BitField } from "bitflag-js";
import type { Hex57 } from "../client.js";

export default class OrganizationRecord {
	readonly #client;
	readonly #id: string;
	#status: "pending" | "accepted" | "declined" | "blocked";
	#flags: BitField;
	#updatedAt: Date;
	#createdAt: Date;

	constructor(client: Hex57, record: Invitation) {
		this.#client = client;
		this.#id = record.id;
		this.#status = record.status;
		this.#flags = new BitField(record.flags);
		this.#updatedAt = record.updatedAt;
		this.#createdAt = record.createdAt;
	}

	get id() {
		return this.#id;
	}

	get status() {
		return this.#status;
	}

	get flags() {
		return this.#flags;
	}

	get updatedAt() {
		return this.#updatedAt;
	}

	get createdAt() {
		return this.#createdAt;
	}

	setStatus(status: "pending" | "accepted" | "declined" | "blocked") {
		this.#status = status;
		return this;
	}

	async save() {
		const result = await this.#client.rest.patchInvitation(this.id, {
			status: this.#status,
			flags: this.#flags,
		});
		this.#initialize(result);
	}

	async delete() {
		return this.#client.deleteInvitation(this.id);
	}

	async refresh() {
		const record = await this.#client.rest.getInvitation(this.id);
		this.#initialize(record);
	}

	#initialize(record: Invitation) {
		this.#status = record.status;
		this.#flags = new BitField(record.flags);
		this.#updatedAt = record.updatedAt;
		this.#createdAt = record.createdAt;
	}
}
