import * as Phaser from 'phaser';
//import { Phaser, Scene, ParticleEmitter } from 'phaser';
import { ASSET_KEYS, AUDIO_KEYS, CARD_WIDTH, CARD_HEIGHT } from '../scenes/common';
import { FOUNDATION_PILE_X_POSITIONS, FOUNDATION_PILE_Y_POSITION } from '../scenes/game-scene';

// this class triggers particle and sound effects
// when the player does certain things in the game
export class Effects {

    parentScene!: Phaser.Scene;
    poofEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(currentScene: Phaser.Scene) {
        console.log("creating particle effect emitters!");
        if (!currentScene) {
            console.log("ERROR: Effects has no scene to add particles to!");
            return;
        }
        this.parentScene = currentScene;
        this.poofEmitter = currentScene.add.particles(0,0,ASSET_KEYS.PARTICLE, {
            alpha: { start:1, end:0 }, // fade out
            lifespan: { min: 500, max: 1000 }, // ms until it fades out
            speed: { min: 50, max: 100 }, // pixels per second
            angle: { min: 0, max: 360 }, // spin
            scale: { start: 1, end: 0.1 }, // shrink
            gravityY: 100, // fall
            blendMode: 'ADD', // lighten
            maxParticles: 1000, // good perf
            frequency: -1, // wait to be triggered
            // spawn in a rectangle shape along the card edges
            // works, but positions are not relative to card
            // emitZone: [ { type: 'edge', source: new Phaser.Geom.Rectangle(0, 0, 100, 100), quantity: 250 }],
        });
        
    } // end constructor

    // emit a burst of particles
    poof(x:number,y:number) {
        //console.log("effects creating a poof at "+x+","+y);
        if (!this.poofEmitter) return;
        let particleCount = 100;
        
        // explode in a circle from the center of the card
        // this.poofEmitter.explode(particleCount,x,y);
        
        // manually explode along the edges of the card only
        for (let px,py,i=0; i<particleCount; i++) {
            if (Math.random()<0.5) {
                px = Math.round(x + (Math.random()<0.5?0:CARD_WIDTH));
                py = Math.round(y + (Math.random()*CARD_HEIGHT));
            } else {
                px = Math.round(x + (Math.random()*CARD_WIDTH));
                py = Math.round(y + (Math.random()<0.5?0:CARD_HEIGHT));
            }
            // console.log(px+","+py);
            this.poofEmitter.explode(1,px,py);
        }
    }

    winFX() {
        console.log("starting game win animation!");
        this.parentScene.sound.play(AUDIO_KEYS.GAME_WIN, { volume: 0.25 });
        this.poof(FOUNDATION_PILE_X_POSITIONS[0], FOUNDATION_PILE_Y_POSITION);
        this.poof(FOUNDATION_PILE_X_POSITIONS[1], FOUNDATION_PILE_Y_POSITION);
        this.poof(FOUNDATION_PILE_X_POSITIONS[2], FOUNDATION_PILE_Y_POSITION);
        this.poof(FOUNDATION_PILE_X_POSITIONS[3], FOUNDATION_PILE_Y_POSITION);
    }

} // end Effects class

