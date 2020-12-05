import * as statuses from './APIStatus'
import express from 'express'
import {DatabaseUser,DatabaseMatchAcceptance, ResponseUser, DatabasePendingFriend,DatabaseFriend, DatabaseGame, DatabaseMatch} from '../models/models'



export async function GetGamesForUser(userid, foruserid, db) {
    let priv = (await (new DatabaseUser({ userid: userid }).select({ db: db })))[0].private;
    let matches = await new DatabaseMatchAcceptance({ userid: userid }).select({ db: db })
    if (priv) {
        //Check if friends
        let f = new DatabaseFriend({ user1: userid, user2: foruserid })
        let friends = await f.select({ db: db });
        if (!friends) {
            throw new statuses.FriendError()
        }
        //Get all the matches we are in
        let userMatchesid = new Set(matches.map(e => e.matchid))
        //Get all the matches with the user requesting the data
        let matchesWithUser = await new DatabaseMatchAcceptance({}).raw(db, {
            sql: `SELECT matchid FROM MatchAcceptances WHERE userid=? AND matchid in (${[...userMatchesid].map((e) => "?").join(",")})`,
            params: [foruserid, ...userMatchesid],
            model: DatabaseMatchAcceptance
        })
        //Discard everything that they aren't in
        let matchesToKeep = {}
        matchesWithUser.forEach((e) => {
            matchesToKeep[e.matchid] = true
        })
        matches = matches.filter((e) => {
            return !!matchesToKeep[e.matchid]
        })
    }
    let items = []
    for (let match of matches) {
        let mgame = await (new DatabaseGame({ matchid: match.matchid })).select({ db: db })
        let oponents = await (new DatabaseMatchAcceptance({ matchid: match.matchid })).select({ db: db })
        let m = (await (new DatabaseMatch({ matchid: match.matchid })).select({ db: db }))[0]
        items.push({
            match: m,
            opponents: oponents,
            game: mgame ? mgame[0] : undefined
        })
    }
    return items

}
export async function GetUser(me, userid, db) {

    let model = new DatabaseUser({ userid: userid })
    VerifyProperties(model)

    let r = await model.select({ db: db })
    if (r.length == 0) {
        return null
    }
    let resp = new ResponseUser(r[0]);
    if (me.userid != userid) {
        let f = new DatabaseFriend({ user1: me.userid, user2: userid })
        let friends = await f.select({ db: db });
        if (friends.length == 0) {
            let freqs = new DatabasePendingFriend({ user1: userid, user2: me.userid })
            let freqs1 = new DatabasePendingFriend({ user2: userid, user1: me.userid })

            let notFResp = new ResponseUser({ userid: userid, isFriend: false, username: r[0].username, private: r[0].private });
            if (resp.private == 0) {
                notFResp = resp;
            }
            let freqsarr = [...(await freqs.select({ db: db })), ...(await freqs1.select({ db: db }))]
            if (freqsarr.length > 0) {
                if (freqsarr[0].user1 !== me.userid) {
                    notFResp.pendingFriend = freqsarr[0].pendingfriendid
                } else {
                    notFResp.pendingFriend = true
                }
            }
            return notFResp;
        }
        resp.isFriend = true;
        return resp
    }
    resp.isFriend = true;
    resp.isEditable = true;
    return resp;
}

export function VerifyProperties(obj:object): object{

        if (!obj.verify){
            console.error("Verify Called for Model with no verify attribute", obj)
            return {}
        }
        else if (!obj.verify()){
            throw new statuses.FieldsNotValidated()
        }
    return obj
}
export function DefaultProperties(obj:object, properties:string[][]):object{
    for (let prop of properties){
        if (obj[prop[0]] === undefined){
            obj[prop[0]] = prop[1]
        }
    }
    return obj
}
export function CopyTo(obj:object, properties:string[][]):object{
    for (let prop of properties){
        if (obj[prop[0]] === undefined){
            obj[prop[0]] = prop[1]
        }
    }
    return obj
}
//Handles errors in async promise chains a lot nicer than otherwise.
//Also passes helper function to send the responses defined in resources/APIStatuses.ts
export function WrapRequest(func:Function) {
        
    return async (req:express.Request, res:express.Response, next:express.Next) => {
        async function sendResponse (r:statuses.APIStatus){
          //  console.log("Response Callback fired with", r)
            if (r.code){
                res.status(r.code).send(r)
            } else {
                console.warn("Do not send :any objects with the callback")
                res.status(200).send(r)
            }
        }
        try {
            await func(req, res, sendResponse, next)
        } catch (e) {
            console.log("Thrown from Route wrapper", e)
            if (e && e.code) {
                
                return await sendResponse(e)
            }
            
            await sendResponse(new statuses.UnknownError())
        }
    }
}
export function WrapMiddleware(func:Function) {
        
    return async (req:express.Request, res:express.Response, next:Function) => {
        async function sendResponse (r:statuses.APIStatus){
            if (r.code){
                res.status(r.code).send(r)
            } else {
                console.warn("Do not send :any objects with the callback")
                res.status(200).send(r)
            }
        }
        try {
            await func(req, res, next)
        } catch (e) {
            console.log("Thrown from Middleware wrapper", e)
            if (e && e.code) {
                
                return await sendResponse(e)
            }
            
            await sendResponse(new statuses.UnknownError())
        }
    }
}
export function GetDomain(req){
    let host = req.headers.host
    return host.match(/^([^:]*)(:\d*)?$/)[1]
}