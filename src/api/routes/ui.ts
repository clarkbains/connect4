import express from "express";
import path from "path"

module.exports = class {
    app: express.Application
    opts: object
    constructor(opts: object) {
        this.opts = opts
        this.app = express()
        this.setupApplication()
    }
    setupApplication() {
        console.log(path.join(__dirname,"..","..","ui"))
        this.app.use(express.static(path.join(__dirname,"..","..","ui")))
        
        this.app.get("/test", (req, res) => {
            res.send("UI Good!")
        })}
    }

   


module.exports.route = ""
module.exports.description = "UI Routes"
module.exports.parent = require('../main')
module.exports.id = 9