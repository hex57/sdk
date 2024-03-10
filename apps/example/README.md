# Example Next.js Application

## Getting Started

First create a file at `apps/example/.env.local` with the following:

```
SECRET_COOKIE_PASSWORD="testtesttesttesttesttesttesttest"
HEX57_KEY="<token>"
```

Replacing `<token>` with your 0x57 Local environment token. Then at the root directory, run

```
npm install
npm run build
npm run dev
```

You can then visit `http://localhost:3000` to see the example application.
