"use client";

import {generateComponents, generateUploadButton} from "@uploadthing/react";
import {useState} from "react";
import "@uploadthing/react/styles.css";

const UploadButton = generateUploadButton<any>();

export default function UTTest() {
    const [file, setFile] = useState<string>();
    return (
        <div>
            <UploadButton endpoint="freeAvatar" skipPolling={false} onClientUploadComplete={(files) => setFile(files[0]?.url)} />
            {file}
            <img src={file} />
        </div>
    )
}