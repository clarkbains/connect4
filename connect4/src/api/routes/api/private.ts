import express from "express";
import { DatabaseUser } from "../../models/models";
import * as statuses from '../../resources/APIStatus'
import * as APIHelpers from '../../resources/APIHelpers'
import * as Auth from '../../resources/Auth'

module.exports = class {
    app: express.Application
    opts: object
    constructor(opts: object) {
        this.opts = opts
        this.app = express()
        this.setupApplication()
    }
    setupApplication() {
        this.app.use(APIHelpers.WrapMiddleware(async (req: express.Request, res: express.Response, next: Function) => {
            try {
                await this.opts.auth.setUser(req, res, this.opts.gateway.db)
                next()
            } catch (e) {
                console.log("Ran into issue while validating")
                throw e;
            }

        }))
        this.app.post("/socketAuth",APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            try{
                this.opts.bus.promoteWS(req.body.id, "counter_test", "counter",undefined)
            } catch(e){
                throw new statuses.NotFound("socket")
            }
            success(new statuses.GenericSuccess())
        }))
        
        this.app.get("/loginstatus", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            await console.log("Getting status", req.locals)
            success(new statuses.LoginSuccess(""))
        }))
    }




}
module.exports.route = "/private"
module.exports.description = "Checks JWTS"
module.exports.parent = require('../api')
module.exports.id = 1