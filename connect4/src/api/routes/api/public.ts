import express from "express";
import * as statuses from '../../resources/APIStatus'

import * as APIHelpers from '../../resources/APIHelpers'

module.exports = class {
    app: express.Application
    opts: object
    constructor(opts: object) {
        this.opts = opts
        this.app = express()
        this.setupApplication()
    }
    setupApplication() {
        this.app.get("/logout",APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            res.cookie('jwt',"",{domain: APIHelpers.GetDomain(req)})
            success(new statuses.LogoutSuccess())
        }))

    }

   

}
module.exports.route = "/public"
module.exports.description = "Public Routes, no auth needed"
module.exports.parent = require('../api')
module.exports.id = 4