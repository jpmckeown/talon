# Phaser.Js - Patience (Solitaire)

Based on a tutorial by Scott Westover, a version of the one-player card game "Patience", implemented in Phaser with TypeScript. Originally version 3.80 and updated to Phaser 3.90

### Requirements

- [Node.js](https://nodejs.org) (version 18 or higher recommended) is needed to install dependencies.

- A package manager, such as npm which comes with Node.js, or [pnpm](https://pnpm.io/), or [yarn](https://yarnpkg.com/) - I use pnpm because if you have many local projects it only stores one copy of each dependency.

## To run the project on your computer.

1. Clone the github repository

2. Check terminal window is at project directory e.g. talon/

3. Install dependencies with command `pnpm install` or `npm install`. These will appear in a subfolder named /node_modules and that automatically includes [Phaser](https://phaser.io) 3.90, as well as [Vite](https://vitejs.dev/) which bundles the webapp.

4. We don't use the vscode webserver, instead start a local webserver with command `pnpm start` or `npm start`. Before doing that I like to get a new Terminal prompt, at the project directory, ready for this because once the webserver starts it will be running in its Terminal windows until you close the webserver.

5. It will say at what URL the local webserver is accessible. Likely it is `http://localhost:5173`

6. To close the webserver I normally use Ctrl-C in that Terminal window.

In the webpage inspector console you should see: [vite] connected.

Chrome: in inspector I saw a Console message "Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader (about:flags#enable-unsafe-swiftshader) flag to opt in to lower security guarantees for trusted content." I stopped that showing by in a new bowser tab going to chrome://flags/#enable-unsafe-swiftshader and clicking the checkbox. When I restarted Chrome the console was clear.

### Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install project dependencies |
| `pnpm start` | Build project and start local webserver running the game |
| `pnpm build` | Builds code bundle for deployment |

If you want to erase local storage of scores, in browser console run
localStorage.removeItem('solitaireHighScores');

### Writing code

Once pnpm starts a local webserver (see above), when any file in the `src` folder is edited Vite will automatically recompile and reload that local webserver. 

### Deploying to itch.io

After the command `pnpm build` the code is built into a single bundle at local folder `dist/*` together with assets.

After installing itch's Butler, 
dist/* is deployed to itch.io using this command:
/usr/local/bin/butler/butler push dist patrickmck/talon:html

/usr/local/bin/butler/butler status patrickmck/talon:html  

### Asset delivery

Images and audio files should be placed in the `public/assets` folder.

Also I have put development files (e.g. Aseprite) in /dev/art

My script generating a deck of blank cards, and then writing ID characters A[ce], 2, to K[ing] in the top-left of each card, and a suit symbol in the top-right, is in /dev/code

The mid-lower area of each card currently has a placeholder graphic drawn with Suit colour and that is where a graphic contributed during the project will appear. You only need to save any graphics in /public/assets/art and I can adjust the script to overlay them on cards within the spritesheet.

## Credits

This project was made possible by the code in a Phaser tutorial created by Scott Westover.

