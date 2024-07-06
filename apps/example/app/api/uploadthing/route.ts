import hex57 from "../../../lib/0x57";

export async function POST(request: Request) {
    const requestBody = await request.json();
    const x = await hex57.rest.request("POST", "/uploadthing?actionType=upload&slug=freeAvatar", requestBody, {
        "X-Uploadthing-Fe-Package": "uploadthing/react",
        "X-Uploadthing-Package": "@uploadthing/react",
        "X-Uploadthing-Version": "6.13.2"
    })
    const j = await x.json();
    console.log(j);
    return new Response(JSON.stringify(j));
}

export async function GET(request: Request) {
    console.log(request);
    const x = await hex57.rest.request("GET", "/uploadthing")
    const j = await x.json();
    console.log(j);
    return new Response(JSON.stringify(j));
}