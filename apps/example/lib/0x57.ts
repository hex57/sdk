import { Hex57 } from "@0x57/client";

const hex57 = new Hex57(process.env.HEX57_KEY!, {
	rpid: "localhost",
	origin: "http://localhost:3001",
});

export default hex57;
