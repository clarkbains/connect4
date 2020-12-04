import express from "express";
const bodyParser = require('body-parser')
const glob = require('glob')
const path = require('path');
const mw = require('./middleware')
const compression = require('compression')
const app = express()
import {Authenticator} from './resources/Auth'
import Gateway from './gateway'
import conf from './config'
import { Socket } from "socket.io";
import { APIError } from "./resources/APIStatus";
import  OnlineTracker  from "./resources/OnlineTracker"
import Bus from "./resources/bus";
require('source-map-support').install();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
let bus = new Bus()
const opts = {
    auth: new Authenticator(conf.JWTSigner),
    gateway: new Gateway(conf.dbFile, false),
    conf: conf,
    bus: bus,
    tracker: new OnlineTracker(3600)
}

app.use(bodyParser.json())
app.use(compression())
let apps = new Map<string, any>()
/*Pretty Proud of this. Globs everything in routes, converts it into a tree system, and then adds all the
 * routes, which makes it super simple to move parts of the api around, rename things, or add versions later.
 * I kind of hate the id system though, but it avoids complexity quite a bit. I could do a simple hash on the 
 * source of the module of something, but that just sounds worse
 */
glob.sync(path.join(__dirname, '/routes/') + '**/*.js').forEach(function (file: string) {
    try {
        let handlerC = require(path.resolve(file))
        apps.set(handlerC.id, handlerC)
    }
    catch (e) {
        console.warn(e)
    }
});
let maxid = 0
for (let key of apps.keys()) {
    //console.log(apps.get(key))
    if (maxid < apps.get(key).id) {
        maxid = apps.get(key).id
    }
}
console.debug(`Next Route id is ${maxid + 1}`)

//Add Routes
treeRoutes(apps, 0, app)
app.use(mw.noRouteMiddleware).use(mw.errorMiddleware)
console.log("Application has started")

io.sockets.on("connection",(socket:Socket)=>{
    bus.addNewWS(socket)
})


server.listen(9000)


function treeRoutes(routes: Map<string, any>, parentId: number, currentApplication: express.Application, depth: number = 0) {
    if (depth === 0) {
        console.log("Treeing Routes")
    }
    for (let element of routes.keys()) {
        let currRoute = routes.get(element)
        if (parentId.toString() == (currRoute.parent.id || 0)) {

            let d = ""
            for (let i = 0; i < depth; i++) {
                d += "\t"
            }
            console.log(`${d} ${currRoute.route} (${currRoute.description})`)
            try {
                let r = new currRoute(opts)
                treeRoutes(routes, currRoute.id, r.app, depth + 1)
                if (currRoute.route)
                    currentApplication.use(currRoute.route, r.app)
                else //Both UI and API Handlers bind to root
                    currentApplication.use(r.app)
            }
            catch (e) {
               console.warn("An Error Occurred while adding the previous handler",e)
            }

        }
    }
}
module.exports.id = 0





