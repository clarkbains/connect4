
import express from 'express'
import { RequestUser, UserModifyRequest } from '../../../models/models'
import * as APIHelpers from '../../../resources/APIHelpers'
import * as statuses from '../../../resources/APIStatus'


module.exports = class {
    app:express.Application
    opts:object
    constructor(opts:object){
        this.opts = opts
        this.app = express()
        this.setupApplication()
    }
    setupApplication(){
        this.app.get("/me", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
           res.send(new statuses.GetUserSuccess(new RequestUser(res.locals.user)))
        }))
        this.app.patch("/me",APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let modified = new UserModifyRequest(req.body)
            Object.assign(res.locals.user, modified)
            await res.locals.user.update({db:this.opts.gateway.db})
            .catch(e=> {throw new statuses.DatabaseError()})
            res.send(modified)
         }))
         this.app.delete("/me",APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            await res.locals.user.delete({db:this.opts.gateway.db})
            .catch(e=> {throw new statuses.DatabaseError()})
            res.send(new statuses.DeleteSuccess("User"))
         }))
 
    } 
}
module.exports.route = "/user"
module.exports.description = "RUD User Profiles"
module.exports.parent = require('../private')
module.exports.id = 3