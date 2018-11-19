"use strict";

// ***** global imports *****
const msgpack = require("msgpack-lite");

// ***** local imports *****
const Globals = require('./globals');
const Helper = require('./helper/helper');
const UiHelper = require('./helper/uiHelper');
const Keyboard = require('./helper/keyboard');

import 'scss/main.scss'

//Aliases
let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Graphics = PIXI.Graphics,
    Rectangle = PIXI.Rectangle,
    Container = PIXI.Container,
    ParticleContainer = PIXI.particles.ParticleContainer,
    Sprite = PIXI.Sprite;

const urlParams = UiHelper.getQueryParams();

//client
class Client
{
    constructor()
    {
        this.reset();
    }

    // ****************************** INIT ******************************

    reset()
    {
        // ********** Pixi Application **********
        this.pixi = null;

        this.fpsMeter = null;

        // ********** Game Objects **********
        this.objects =
        {
            players: null,
        };

        this.players = {};

        this.player = null;
        this.movement = {vx: 0.0, vy: 0.0};

        this.tickFunc = null;

        // ********** Textures **********
        this.textures =
        [
            'assets/textures/grin.png',
            'assets/textures/grinEvil.png',
            'assets/textures/smile.png',
        ];

        // ********** Networking **********
        this.host = (urlParams && urlParams.host) ? urlParams.host : '127.0.0.1';
        this.ws = null;
        this.netLoop = null;

        this.keys = null;

        // ********** States **********
        this.initialized = false;
        this.running = false;
        this.lastUpdate = Date.now();
        this.debug = location.search.indexOf('debug')!=-1;
        this.resizeHandler = null;
    }

    init()
    {
        document.querySelector('#connect').onclick = () =>
        {
            this.start();
        }

        if (!this.fpsMeter && this.debug)
            this.fpsMeter = new FPSMeter({ theme:'transparent', heat: 1, graph: 1 });
    }

    reInit(playSounds=true)
    {
        this.initialized = false;
        this.running = false;

        //disconnect
        this.disconnect();

        this.clear();

        //clear all pixi items
        this.clearRendering();

        //fps meter
        if (this.fpsMeter)
        {
            this.fpsMeter.destroy();
            this.fpsMeter = null;
        }

        //reset all vars
        this.reset();

        //remove resize event
        if (this.resizeHandler)
            window.removeEventListener('resize', this.resizeHandler);

        this.init();
    }

    clear()
    {
        if (this.netLoop)
        {
            clearInterval(this.netLoop);
            this.netLoop = null;
        }
    }

    clearRendering()
    {
        if (this.pixi && this.pixi.stage)
        {
            //destroy pixi
            this.pixi.stage.destroy(true);
            this.pixi.stage = null;

            document.body.removeChild(this.pixi.view);

            this.pixi.renderer.destroy(true);
            this.pixi.renderer = null;

            if (this.pixi.ticker)
                this.pixi.ticker.destroy();
        }
    }

    start()
    {
        this.running = true;

        UiHelper.show('#osd',false);
        UiHelper.hide('#menu',false);

        this.initEngine(() =>
        {
            this.connect();
        });
    }

    end()
    {
        this.disconnect();

        this.running = false;

        UiHelper.hide('#osd',false);
        UiHelper.show('#menu',false);

        this.reInit();
    }

    initEngine(callback)
    {
        //no pixi hello
        PIXI.utils.skipHello();

        //pixi
        this.pixi = new Application
        ({
            width: 256,
            height: 256,
            antialias: true,
            transparent: false,
            resolution: 1
        });

        //pixi renderer
        this.pixi.renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight, { antialias: true });

        this.pixi.renderer.view.style.position = 'absolute';
        this.pixi.renderer.view.style.display = 'block';
        this.pixi.renderer.resize(window.innerWidth, window.innerHeight);

        // add the canvas that Pixi automatically created for you to the HTML document
        document.body.appendChild(this.pixi.view);

        this.objects.players = new Container();
        this.pixi.stage.addChild(this.objects.players);

        //auto resize
        this.resizeHandler = this.resize.bind(this);
        window.addEventListener('resize', this.resizeHandler);

        // load all textures and run setup
        if (Helper.numKeys(loader.resources) == 0)
        {
            loader.add(this.textures).load(() =>
            {
                this.initGame(callback);
            });
        }
        else
        {
            this.initGame(callback);
        }
    }

    resize()
    {
        this.pixi.renderer.resize(window.innerWidth, window.innerHeight);
    }

    initGame(callback)
    {
        console.log('game initialized');

        this.clear();

        // ***** GAME LOOP *****
        this.tickFunc = bogus =>
        {
            if (!this.initialized)
                return;

            var now = performance.now();
            let delta = now - this.lastUpdate;

            this.gameLoop(delta);
            this.lastUpdate = now;
        };
        this.pixi.ticker.add(this.tickFunc);

        this.initialized = true;

        if (callback)
            callback();
    }

    // ****************************** NET ******************************

    initNetLoop()
    {
        // setup message interval (independent from gameloop)
        this.netLoop = setInterval(() =>
        {
            //player position
            if (this.player)
                this.send({ type: 'pos', x: this.player.x, y: this.player.y, rotation: this.player.rotation });

        }, 1000 / Globals.SERVER_FPS);
    }

    connect()
    {
        console.log('connecting to '+this.host);

        // create connection object
        this.ws = new WebSocket('ws://' + this.host + ':' + Globals.SERVER_PORT + '/ws');
        this.ws.binaryType = "arraybuffer";

        // add events
        this.ws.onopen = event => this.onOpen(event);
        this.ws.onclose = event => this.onClose(event);
        this.ws.onerror = event => this.onError(event);
        this.ws.onmessage = event => this.onMessage(event);
    }

    disconnect()
    {
        if (this.ws)
            this.ws.close();
    }

    onOpen(event)
    {
        console.log('socket opend');

        this.initNetLoop();
    }

    onClose(event)
    {
        console.log('onClose', event);

        this.end();
    }

    onError(event)
    {
        console.log('onError', event);

        this.end();
    }

    onMessage(event)
    {
        let obj = null;
        try
        {
            obj = msgpack.decode(new Uint8Array(event.data));
        }
        catch (error)
        {
            console.log('error in message', message, error);
        }


        // parse message
        if (obj && 'type' in obj)
        {
            switch (obj.type)
            {
                case 'init':
                {
                    let tex = resources[this.textures[obj.char]].texture;
                    let player = new Sprite(tex);

                    player.id = obj.id;
                    player.anchor.x = 0.5;
                    player.anchor.y = 0.5;
                    player.x = obj.x;
                    player.y = obj.y;
                    player.rotation = obj.rotation;

                    if (obj.isClient)
                    {
                        this.player = player;
                        this.initControlls();
                    }

                    //add to players object
                    this.players[obj.id] = player;

                    //add pixi item
                    this.objects.players.addChild(player);

                    break;
                }
                case 'pos':
                {
                    if (obj.id in this.players)
                    {
                        let player = this.players[obj.id];
                        player.x = obj.x;
                        player.y = obj.y;
                        player.rotation = obj.rotation;
                    }

                    break;
                }
                case 'disc':
                {
                    if (obj.id in this.players)
                    {
                        //remove from players object
                        delete this.players[obj.id];

                        //remove from pixi item
                        for(let i=0;i<this.objects.players.children.length;++i)
                        {
                            if (this.objects.players.children[i].id == obj.id)
                            {
                                this.objects.players.removeChildAt(i);
                            }
                        };
                    }

                    break;
                }
            }
        }
    }

    send(obj, doNotEncode)
    {
        let data = obj;
        if (!doNotEncode)
            data = msgpack.encode(obj);

        if (this.ws.readyState === WebSocket.OPEN)
            this.ws.send(data);
    }

    // ****************************** KEYBOARD ******************************

    initControlls(callback)
    {
        this.keys =
        {
            //http://keycode.info/
            w: Keyboard(87),
            a: Keyboard(65),
            s: Keyboard(83),
            d: Keyboard(68),

            up: Keyboard(38),
            down: Keyboard(40),
            left: Keyboard(37),
            right: Keyboard(39)
        };

        // key: >>> W <<<
        this.keys.w.press = this.keys.up.press = () =>
        {
            this.movement.vy = -1;
        };
        this.keys.w.release = this.keys.up.release = () =>
        {
            if (this.movement.vy < 0)
                this.movement.vy = 0;
        };

        // key: >>> S <<<
        this.keys.s.press = this.keys.down.press = () =>
        {
            this.movement.vy = 1;
        };
        this.keys.s.release = this.keys.down.release = () =>
        {
            if (this.movement.vy > 0)
                this.movement.vy = 0;
        };

        // key: >>> A <<<
        this.keys.a.press = this.keys.left.press = () =>
        {
            this.movement.vx = -1;
        };
        this.keys.a.release = this.keys.left.release = () =>
        {
            if (this.movement.vx < 0)
                this.movement.vx = 0;
        };

        // key: >>> D <<<
        this.keys.d.press = this.keys.right.press = () =>
        {
            this.movement.vx = 1;
        };
        this.keys.d.release = this.keys.right.release = () =>
        {
            if (this.movement.vx > 0)
                this.movement.vx = 0;
        };
    }

    // ****************************** GAME LOGIC ******************************

    gameLoop(delta)
    {
        if (this.player)
        {
            //some random rotation
            this.player.rotation += delta * 0.01;

            //movement
            this.player.x += delta * 0.25 * this.movement.vx;
            this.player.y += delta * 0.25 * this.movement.vy;
        }

        if (this.fpsMeter)
            this.fpsMeter.tick();
    }

}

// init & run game
let client = new Client();

document.addEventListener('DOMContentLoaded', () =>
{
    client.init();
}, false);
