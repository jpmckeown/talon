import * as Phaser from 'phaser';
//import { Phaser, Scene, ParticleEmitter } from 'phaser';
import { ASSET_KEYS } from '../scenes/common';

// a way to show some particle poof explosions
// when the player does certain things in the game
export class Effects {

    parentScene : Scene;
    poofEmitter : ParticleEmitter;

    constructor(currentScene:Scene) {
        console.log("creating particle effect emitters!");
        if (!currentScene) {
            console.log("ERROR: Effects has no scene to add particles to!");
            return;
        }
        this.parentScene = currentScene;
        this.poofEmitter = currentScene.add.particles(0,0,ASSET_KEYS.PARTICLE, {
            alpha: { start:1, end:0 }, // fade out
            lifespan: { min: 500, max: 1000 }, // ms until it fades out
            speed: { min: 150, max: 250 }, // pixels per second
            angle: { min: 0, max: 360 }, // spin
            scale: { start: 1, end: 0.1 }, // shrink
            gravityY: 400, // fall
            blendMode: 'ADD', // lighten
            maxParticles: 1000, // good perf
            frequency: -1, // wait to be triggered
        });
        
        // FIXME: this seems to have no effect
        // only spawn particles around the edges of a card!
        this.poofEmitter.addEmitZone({ type: 'edge', source: new Phaser.Geom.Rectangle(-150, -150, 300, 300) });

    } // end constructor

    // emit a burst of particles
    poof(x:number,y:number) {
        console.log("effects creating a poof at "+x+","+y);
        if (!this.poofEmitter) return;
        let particleCount = 100;
        this.poofEmitter.explode(particleCount,x,y);
    }

} // end Effects class


