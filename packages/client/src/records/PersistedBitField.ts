import { BitField, type BitFlagResolvable } from "bitflag-js";

export default class PersistentBitField {
	static resolve(...values: BitFlagResolvable[]): bigint {
		return BitField.resolve(...values);
	}

	readonly #bitfield: BitField;
	readonly #save: () => unknown;

	constructor(save: () => unknown, ...value: BitFlagResolvable[]) {
		this.#bitfield = new BitField(...value);
		this.#save = save;
	}

	get value() {
		return this.#bitfield.value;
	}

	async set(flag: BitFlagResolvable, value: boolean) {
		this.#bitfield.set(flag, value);
		this.#save();
		return this;
	}

	add(...flags: BitFlagResolvable[]) {
		this.#bitfield.add(...flags);
		this.#save();
		return this;
	}

	has(...flags: BitFlagResolvable[]) {
		return this.#bitfield.has(...flags);
	}

	remove(...flags: BitFlagResolvable[]) {
		this.#bitfield.remove(...flags);
		this.#save();
		return this;
	}

	mask(...flags: BitFlagResolvable[]) {
		return this.#bitfield.mask(...flags);
	}

	// TODO: Can we find a way to not reimplement this?
	*[Symbol.iterator]() {
		let index = 0n;
		let bit = 0n;

		while (this.#bitfield.value > (bit = 1n << index)) {
			const field = this.#bitfield.value & bit;

			if (field) {
				yield field;
			}

			index++;
		}
	}

	toJSON() {
		return this.#bitfield.toJSON();
	}

	toString() {
		return this.#bitfield.toString();
	}
}
