import express from "express";

module.exports = class {
    app: express.Application
    opts: object
    instanceId:string
    constructor(opts: object) {
        this.opts = opts
        this.app = express()
        this.setupApplication()
        this.instanceId = String(Math.floor(Math.random() * 1000000))
    }
    setupApplication() {
        this.app.get("/test", (req, res) => {
            res.send("auth Good!")

        })
        this.app.post("/test", (req, res) => {
            res.send(JSON.stringify(req.body))

        })
        this.app.get("/node", (req,res)=>{
            res.send(this.instanceId)
        })
        this.app.use((req: express.Request, res: express.Response, next: Function) => {
            next()
        })
    }

   

}
module.exports.route = "/api"
module.exports.description = "API Routes"
module.exports.parent = require('../main')
module.exports.id = 5