# Unlimited Webpanel

Your number one webpanel for QB Core on FiveM Servers.

Get it from [Tebex](https://unlimited.tebex.io)!

For running the resource you must at least be an active subscriber to the resource "Unlimited-Webpanel". Without you will miss the \*.lua files needed running the resource.

## Usage

Make sure to install the npm packages from both package.json with `npm install` inside the respective folder.

1. Build your html folder by running `npm run build` from the [html-folder](/html/)
2. Build your fivem server script by running `npm run build` from the main [package.json](/package.json)
3. Replace the files inside the keymaster resource (downloaded) with your new builds

## Development

### html

You can run the resource on the server and develop the frontend by running `npm run dev`. The frontend will then connect to the running server. Without a server on the local machine, the frontent development wont work, as the UI needs the server to authenticate users or fetching data.

### server

Make your changes to the source, build it and copy it from the resource folder into your running resource (server). Restart the server (no resource restart!).
