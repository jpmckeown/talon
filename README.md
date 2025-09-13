# Phaser.Js - Patience (Solitaire)

Based on a tutorial by Scott Westover, a version of the one-player card game "Patience", implemented in Phaser TypeScript. Originally version 3.80 and updated to Phaser 3.90

## Requirements

- [Node.js](https://nodejs.org) (version 18 or higher recommended)
- A package manager: I use pnpm. but it will work with npm which comes with Node.js, or [pnpm](https://pnpm.io/), or [yarn](https://yarnpkg.com/)

## To run the project on your computer.

1. Clone the github repository

2. Check terminal window is at project directory e.g. talon/

3. Install dependencies with command `pnpm install` or `npm install`

4. We don't use the vscode webserver, instead (and I like to get a new Terminal prompt at the project directory for this because once the webserver starts it will be running in its Terminal windows until you close the webserver. Start local webserver with command `pnpm start` or `npm install`

5. It will say at what URL the local webserver is accessible. Likely it is `http://localhost:3000`

6. To close the webserver I normally use Ctrl-C in that Terminal window.

<a href="https://nodejs.org" target="_blank">Node.js</a> and <a href="https://pnpm.io/" target="_blank">pnpm</a> are required to install dependencies and run scripts using pnpm.

<a href="https://vitejs.dev/" target="_blank">Vite</a> bundles the web application. It's included in the project's dependencies.

### Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install project dependencies |
| `pnpm start` | Build project and start local webserver running the game |
| `pnpm build` | Builds code bundle for deployment |

### Writing code

Once pnpm starts a local webserver (see above), when any file in the `src` folder is edited Vite will automatically recompile and reload that local webserver. 

### Deploying to itch.io

After the command `pnpm build` the code is built into a single bundle at local folder `dist/*` together with assets.

After installing itch's Butler, 
dist/* is deployed to itch.io using this command:
/usr/local/bin/butler/butler push dist patrickmck/talon:html

/usr/local/bin/butler/butler status patrickmck/talon:html  

### Asset delivery

Images and audio files should be placed in the `public` folder.

Also I have put development files (e.g. Aseprite) in /dev/art

My script generating placeholder cards image is at /dev/code/cards_maker.py

The top of card needs character e.g. "7" and suit symbol, but the lower area of card which currently has a rectangle of Suit colour and placeholder letter is where a contributed graphic will go. A simicould be placed in all cards at once using a similar script.

## Credits

This project was made possible by the code in a tutorial created by Scott Westover.</a>
