"use strict";

// ***** modules search path *****
if (global.searchPaths)
    module.paths = global.searchPaths.concat(module.paths);

// ***** global imports *****
const WebSocketServer = require('uws').Server;
const microtime = require('microtime');
const msgpack = require("msgpack-lite");

// ***** local imports *****
const Globals = require('./globals');
const Helper = require('./helper/helper');

let PLAYER_ID = 0;

class Server
{
    constructor(port)
    {
        this.productionMode = (Helper.hasArg('prod') || Helper.hasArg('production'));

        // ********** data **********
        this.loop = null;
        this.players = {};

        // ********** NET **********
        this.port = port;
        this.wss = null;
    }

    // ****************************** INIT ******************************

    init()
    {
        let lastUpdate = microtime.now();
        this.loop = setInterval(() =>
        {
            let now = microtime.now();
            let delta = (now - lastUpdate) / 1000.0;
            this.gameLoop(delta);
            lastUpdate = now;
        }, 1000 / Globals.SERVER_FPS);
    }

    start()
    {
        this.wss = new WebSocketServer({ port: this.port });
        console.log(`Server listening on websocket-port ${Globals.SERVER_PORT}`);

        this.wss.on('connection', ws => this.onConnect(ws));
    }

    end()
    {
        //send game end
        this.broadcast({ type : Globals.NET_TYPE.end });
    }


    // ****************************** NET ******************************

    onConnect(ws)
    {
        let playerId = ++PLAYER_ID;

        let player =
        {
            id: playerId,
            ws: ws,
            lastAction: Date.now(),

            char: Helper.getRandomInt(0,2),

            x: Helper.getRandomInt(0,400),
            y: Helper.getRandomInt(0,400),
            rotation: 0,
        };


        ws.on('message', data => this.onMessage(ws, player.id, data));

        ws.on('error', event => this.onClose(ws, player.id, event));
        ws.on('close', event => this.onClose(ws, player.id, event));

        console.log('player connect (pid:'+player.id+', players online: '+Helper.numKeys(this.players)+')');

        //send the player its position
        this.send(player, {type: 'init', id: player.id, x: player.x, y: player.y, rotation: player.rotation, char: player.char, isClient: true});

        //send all other connected players this player
        this.broadcast({type: 'init', id: player.id, x: player.x, y: player.y, rotation: player.rotation, char: player.char}, player.id);

        //send the new connected player all other connected players
        for(let playerId in this.players)
        {
            let playerToSend = this.players[playerId];
            this.send(player, {type: 'init', id: playerToSend.id, x: playerToSend.x, y: playerToSend.y, rotation: playerToSend.rotation, char: playerToSend.char});
        }

        //add to players object
        this.players[playerId] = player;
    }

    onMessage(ws, pid, data)
    {
        try
        {
            if (!(pid in this.players))
            {
                console.log('error: player not in list');
                console.log(pid);
                return;
            }

            let player = this.players[pid];

            // decode message
            let obj = null;
            try
            {
                obj = msgpack.decode(new Uint8Array(data));
            }
            catch (error)
            {
                console.log('error in message', obj, error);
                return;
            }

            // parse message
            if (obj && 'type' in obj)
            {
                switch (obj.type)
                {
                    case 'pos':
                    {
                        player.x = obj.x;
                        player.y = obj.y;
                        player.rotation = obj.rotation;

                        obj.id = player.id;

                        this.broadcast(obj, player.id);
                        break;
                    }
                }
            }

            player.lastAction = Date.now();
        }
        catch(error)
        {
            console.error(error);

            if (!(pid in this.players))
                this.disconnect(this.players[pid]);
        }
    }

    onClose(ws, pid, event)
    {
        if (pid in this.players)
        {
            this.disconnect(this.players[pid]);

            delete this.players[pid];

            this.broadcast({ type: 'disc', id: pid });
        }
    }

    disconnect(player)
    {
        this.send(player, { type :'disc'}, { ignoreReady: true });
        player.ws.close();

        console.log('player disconnect (pid:'+player.id+', players online: '+Helper.numKeys(this.players)+')');
    }

    send(player, data)
    {
        player.ws.send(msgpack.encode(data));
    }

    broadcast(messageObj, ignorePlayerId)
    {
        for (let pid in this.players)
        {
            const player = this.players[pid];

            if (player.id != ignorePlayerId)
            {
                let obj = Helper.deepCopy(messageObj);
                this.send(player, obj);
            }
        }
    }

    // ****************************** GAME LOGIC ******************************
    gameLoop(delta)
    {
        //your game logic here
    }
}

let server = new Server(Globals.SERVER_PORT);
server.init();
server.start();