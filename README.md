# Phaser.Js - Patience

Based on a tutorial by Scott Westover, a version of the one-player card game "Patience" implemented in Phaser 3 TypeScript.

## Local development

<a href="https://nodejs.org" target="_blank">Node.js</a> and <a href="https://pnpm.io/" target="_blank">pnpm</a> are required to install dependencies and run scripts using pnpm.

<a href="https://vitejs.dev/" target="_blank">Vite</a> bundles the web application. It's included in the project's dependencies.

### Commands

| Command | Description |
|---------|-------------|
| `pnpm install --frozen-lockfile` | Install project dependencies |
| `pnpm start` | Build project and start local webserver running the game |
| `pnpm build` | Builds code bundle for deployment |
| `pnpm lint` | Uses ESLint to inspect code |

### Writing code

After cloning the repo, run `pnpm install --frozen-lockfile` from your project directory. 

Then start a local development server by running `pnpm start`. 
In a web browser look for `http://localhost:3000`

Once that is done, when any file in the `src` folder is edited Vite will automatically recompile and reload the local server. 

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
