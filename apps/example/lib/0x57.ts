import { Hex57 } from "@0x57/client";

const hex57 = new Hex57(process.env.HEX57_KEY!, {
	rpid: process.env.HEX57_RPID!,
	origin: process.env.HEX57_ORIGIN!,
	apiBase: "http://localhost:3000/api",
});

export default hex57;
