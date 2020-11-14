import { DatabaseUser, DatabaseGame, DatabaseMove, DatabaseMatch } from './../../../models/models';
import { Database } from 'sqlite3';
import { ResourceSuccess, MissingRequiredField } from '../../../resources/APIStatus';
import express from 'express'

import * as APIHelpers from '../../../resources/APIHelpers'
module.exports = class {
    app: express.Application
    opts: object
    constructor(opts: object) {
        this.opts = opts
        this.app = express()
        this.setupApplication()
    }

    setupApplication() {

        //Currently only works for matches that are won, I need to come up with a query that joins three tables before I can get this to spec.
        this.app.get("/", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let userid = undefined;
            if (req.query.player){
                let user = await new DatabaseUser({username:req.query.player}).select({db:this.opts.gateway.db})

                userid = user.length>=1?user[0].userid:undefined;
            }
            
            let finished = req.query.active==undefined?undefined:(req.query.active?0:1)
            let matches = await new DatabaseMatch({})
            let games = await new DatabaseGame({userid:userid, gamefinished:finished}).select({db:this.opts.gateway.db})
            if (req.query.detail=="full"){
                for (let game of games)
                    game.moves = await new DatabaseMove({gameid:game.gameid}).select({db:this.opts.gateway.db})
                  
            }
            
            
            success(new ResourceSuccess(games));

        }))







    }

}
module.exports.route = "/games"
module.exports.description = "R Games"
module.exports.parent = require('../public')
module.exports.id = 11