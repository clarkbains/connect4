import { DatabaseUser, DatabaseGame, DatabaseMove, DatabaseMatch, DatabaseMatchAcceptance } from './../../../models/models';
import { Database } from 'sqlite3';
import { ResourceSuccess, MissingRequiredField, NotFound } from '../../../resources/APIStatus';
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
            let username = req.query.player;
            let matchIds = []
            if (!!username){
                let terms = [`${username}%`, `%${username}`, `%${username}%`]
                let found;
                for (let i = 0; i < terms.length && !found; i++) {
                    let resp = await new DatabaseUser({}).raw(this.opts.gateway.db, {
                        sql: `select * from Users where private=0 AND username like ? LIMIT 1`,
                        params: [terms[i]],
                        single:true
                    })
                    if (resp[0]){
                        found = resp[0]
                    }
    
                }
                let mids = await new DatabaseMatch({}).raw(this.opts.gateway.db, {
                    sql: `select Matchs.matchid from Matchs CROSS JOIN MatchAcceptances on MatchAcceptances.matchid = Matchs.matchid where Matchs.privacylevel=0 AND MatchAcceptances.userid=?`,
                    params:[found.userid],
                    model:DatabaseMatch
                })
                matchIds = mids.map(m=>{return m.matchid})
            } else {
                let mids = await new DatabaseMatch({}).raw(this.opts.gateway.db, {
                    sql: `select Matchs.matchid from Matchs where Matchs.privacylevel=0`,
                    params:[],
                    model:DatabaseMatch
                })
                matchIds = mids.map(m=>{return m.matchid})
            }
            if(!matchIds.length){
                throw new NotFound("Game")
            }
            let finished=""
            if(req.query.active==="true"){
                finished = "AND gamefinished is NULL"
            } else if(req.query.active==="false"){
                finished = "AND gamefinished is not NULL"
            }
            let games = await new DatabaseGame({}).raw(this.opts.gateway.db, {
                sql: `select * from Games where matchid in (${matchIds.map(()=>"?").join(",")}) ${finished}`,
                params:matchIds,
                model:DatabaseGame
            })
            if (!games.length){
                throw new NotFound("Game")
            }
            let allGames = []
            let personMap = new Map<number, DatabaseUser>()
            for (let g of games){
                let match = await new DatabaseMatch({matchid:g.matchid}).select({db:this.opts.gateway.db})[0]
                let acceptances = await new DatabaseMatchAcceptance({matchid:g.matchid}).select({db:this.opts.gateway.db})
                let moves = await new DatabaseMove({gameid:g.gameid}).select({db:this.opts.gateway.db})
                let users = []
                for (let acc of acceptances){
                    if (!personMap.has(acc.userid)){
                        personMap.set(acc.userid, (await (new DatabaseUser({userid:acc.userid})).select({db:this.opts.gateway.db}))[0])
                    }
                    users.push(personMap.get(acc.userid))
                }
               let data = {
                   players:Array.from(personMap.values()).map(e=>e.username),
                   finished:g.gamefinished!=null
               }
               if (g.gamefinished!=null){
                   data.winner = personMap.get(g.gamefinished).username
                   data.turns = moves.length
               }
               if (req.query.detail==="full"){
                   data.moves = moves.map(m=>{
                    return {
                       username:personMap.get(m.userid).username,
                       x:m.x,
                       y:m.y,
                       time:m.time
                   }})
               }
                allGames.push(data)
            }
      
            
            
            success(new ResourceSuccess(allGames));

        }))







    }

}
module.exports.route = "/games"
module.exports.description = "R Games"
module.exports.parent = require('../public')
module.exports.id = 11