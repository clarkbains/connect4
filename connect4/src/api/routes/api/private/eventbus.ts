import express from 'express'
import * as APIHelpers from '../../../resources/APIHelpers'
import * as statuses from '../../../resources/APIStatus'
import { DatabaseModel } from '../../../resources/databaseHelpers'
module.exports = class {
    app:express.Application
    opts:object
    constructor(opts:object){
        this.opts = opts
        this.app = express()
        this.setupApplication()
    }

    setupApplication(){
        this.app.get("/subscription/:eventType/:?id", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            
        }))
        this.app.get("/:subscriptionId")
    } 

}
module.exports.route = "/bus"
module.exports.description = "Handles Long Polling"
module.exports.parent = require('../private')
module.exports.id = 10