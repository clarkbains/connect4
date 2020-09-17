import express from "express";

module.exports = class {
    app: express.Application
    opts: object
    constructor(opts: object) {
        this.opts = opts
        this.app = express()
        this.setupApplication()
    }
    setupApplication() {
        this.app.get("/test", (req, res) => {
            res.send("auth Good!")

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