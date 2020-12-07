import express from "express";

module.exports = class {
    app: express.Application
    opts: object
    instanceId:string
    constructor(opts: object) {
        this.opts = opts
        this.app = express()
        this.setupApplication()
    }
    setupApplication() {
    }

   

}
module.exports.route = "/api"
module.exports.description = "API Routes"
module.exports.parent = require('../main')
module.exports.id = 5