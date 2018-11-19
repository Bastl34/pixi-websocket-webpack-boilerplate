# PIXI.JS with "Net-Code" and Webpack Boilerplate

![Preview Image](demo.gif "Preview")

The "Net-Code" is based on broadcast packages without interpolation or validation.

## Based on

* PIXI.JS
* uWS
* Webpack
* SCSS
* Node.JS

## Directory Structure

* `./assets` - asset files (copied by webpack with some file type filters)
* `./server` - server project directory (for server `node_modules`)
* `./client` - client project directory (for client `node_modules`, webpack, `scss`-Files, `index.html`)
* `./source` - shared source directory

## Requirements
* Node.js >= 8.0
* `npm install -g nodemon`

## Run Development

```bash
#run server
$ npm run server

#run client
$ npm run client

#run client in public mdoe
$ npm run client-public
```
