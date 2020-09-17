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
    }

   

}
module.exports.route = "/public"
module.exports.description = "Just for folder structure"
module.exports.parent = require('../api')
module.exports.id = 4