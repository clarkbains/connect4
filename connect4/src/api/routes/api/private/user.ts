
import express from 'express'
import { sqlite3 } from 'sqlite3'
import { RequestUser, UserModifyRequest, DatabaseUser, DatabaseFriend, PublicResponseUser, FriendRequest, DatabasePendingFriend, FriendRequestUserResponseRequest, ResponseUser, DatabaseMatchAcceptance, DatabaseGame, DatabaseMatch } from '../../../models/models'
import * as APIHelpers from '../../../resources/APIHelpers'
import * as statuses from '../../../resources/APIStatus'
import { DatabaseModel } from '../../../resources/databaseHelpers'


module.exports = class {
    app: express.Application
    opts: object
    constructor(opts: object) {
        this.opts = opts
        this.app = express()
        this.setupApplication()
    }
    
    setupApplication() {
        this.app.get("/me", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let resp = new statuses.GetUserSuccess(
                await APIHelpers.GetUser(res.locals.user, res.locals.user.userid, this.opts.gateway.db)
            )
            success(resp)
        }))
        this.app.get("/:userid", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function, next: Function) => {
            if (!req.params.userid.match(/^\d+$/)) {
                return next()
            }
            let resp = await APIHelpers.GetUser(res.locals.user, req.params.userid, this.opts.gateway.db)
            if (!resp) {
                throw new statuses.NotFound("User")
            }
            success(new statuses.GetUserSuccess(resp))
        }))


        this.app.patch("/me", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let modified = new UserModifyRequest(req.body)
            Object.assign(res.locals.user, modified)
            await res.locals.user.update({ db: this.opts.gateway.db })
                .catch(e => { throw new statuses.DatabaseError() })
            success(modified)
        }))
        this.app.delete("/me", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            await res.locals.user.delete({ db: this.opts.gateway.db })
                .catch(e => { throw new statuses.DatabaseError() })
            success(new statuses.DeleteSuccess("User"))
        }))
        this.app.get("/me/friends", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let resp = await new DatabaseFriend({
                user1: res.locals.user.userid,
            }).select({ db: this.opts.gateway.db })
            let _this = this
            let f = await resp.map(async e => {
                return {
                    userid: e.user2,
                    username: (await (new DatabaseUser({ userid: e.user2 })).select({ db: _this.opts.gateway.db }))[0].username,
                    online: this.opts.tracker.get(e.user2)
                }
            })
            let friends = await Promise.all(f)
            success(new statuses.GetFriendsSuccess(friends))
        }))
        this.app.delete("/me/friends/:userid", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let r = new FriendRequest({ userid: req.params.userid })
            try {
                APIHelpers.VerifyProperties(r)
            } catch {
                throw new statuses.MissingRequiredField(["userid"])
            }
            //Delete both sides
            await new DatabaseFriend({
                user1: res.locals.user.userid,
                user2: r.userid
            }).delete({ db: this.opts.gateway.db })
            await new DatabaseFriend({
                user2: res.locals.user.userid,
                user1: r.userid
            }).delete({ db: this.opts.gateway.db })
            success(new statuses.GenericSuccess())


        }))
        this.app.get("/me/friendrequests", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {

            let a = await new DatabasePendingFriend({
                user1: res.locals.user.userid,
            }).select({ db: this.opts.gateway.db })
            let b = await new DatabasePendingFriend({
                user2: res.locals.user.userid,
            }).select({ db: this.opts.gateway.db })
            let _this = this
            let friendsb = a.map(async e => { return (await (new DatabaseUser({ userid: e.user2 }).select({ db: _this.opts.gateway.db })))[0] })
            let friendsa = b.map(async e => { return (await (new DatabaseUser({ userid: e.user1 }).select({ db: _this.opts.gateway.db })))[0] })
            friendsa = await Promise.all(friendsa)
            friendsb = await Promise.all(friendsb)

            success(new statuses.GetPendingFriends(friendsa, friendsb))

        }))
        this.app.post("/me/friendrequests/:friendrequest/accept", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            //Make sure they don't do a wildcard db search if not defined.
            let request = new FriendRequestUserResponseRequest({ friendrequestid: req.params.friendrequest })
            APIHelpers.VerifyProperties(request)
            let pending = await new DatabasePendingFriend(
                {
                    pendingfriendid: request.friendrequestid,
                    user2: res.locals.user.userid
                }).select({ db: this.opts.gateway.db })
            if (pending.length < 1) {
                throw new statuses.LonelyError()
            }
            let otherUser = pending[0].user1

            await pending[0].delete({ db: this.opts.gateway.db })
            //Insert users both ways
            await new DatabaseFriend({
                user1: res.locals.user.userid,
                user2: otherUser
            }).insert({ db: this.opts.gateway.db })
            await new DatabaseFriend({
                user2: res.locals.user.userid,
                user1: otherUser
            }).insert({ db: this.opts.gateway.db })
            success(new statuses.FriendRequestSuccess())
        }))
        this.app.post("/me/friendrequests/:friendrequest/deny", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            //Make sure they don't do a wildcard db search if not defined.
            if ([null, undefined].includes(req.params.friendrequest)) {
                throw new statuses.MissingRequiredField(["friendrequest"])
            }
            let pending = await new DatabasePendingFriend(
                {
                    pendingfriendid: req.params.friendrequest,
                    user2: res.locals.user.userid
                }).select({ db: this.opts.gateway.db })
            if (pending.length < 1) {
                throw new statuses.LonelyError()
            }

            await pending[0].delete({ db: this.opts.gateway.db })
            success(new statuses.FriendRequestSuccess())

        }))
        this.app.get("/search", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let friends = await (new DatabaseFriend({ user1: res.locals.user.userid })).select({ db: this.opts.gateway.db })
            let found = new Set<number>();
            let limit = req.query.limit || 10;
            let terms = [`${req.query.term}%`, `%${req.query.term}`, `%${req.query.term}%`]
            for (let i = 0; i < terms.length && found.size < limit; i++) {
                let resp = await new DatabaseUser({}).raw(this.opts.gateway.db, {
                    sql: `select userid from Users where userid!=? AND (private=0 ${friends.length ? (` OR userid in (${friends.map((v) => "?").join(",")}) `) : ""}) AND username like ?`,
                    params: [res.locals.user.userid, ...friends.map(e => e.user2), terms[i]]
                })
                for (let m of resp) {
                    found.add(m.userid)
                    if (found.size >= limit) {
                        break;
                    }
                }
            }


            let users = []
            for (let u of found) {
                users.push(await APIHelpers.GetUser(res.locals.user, u, this.opts.gateway.db))

            }
            success(new statuses.GetUsersSuccess(users))

        }))

        this.app.get("/:userid/games", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let games = await APIHelpers.GetGamesForUser(req.params.userid, res.locals.user.userid, this.opts.gateway.db)
            success(new statuses.ResourceSuccess(games))
        }))
        
        this.app.post("/:userid/friendrequests", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let request = new FriendRequest({ userid: req.params.userid })
            APIHelpers.VerifyProperties(request)
            let preExisting = await new DatabaseFriend(
                {
                    user1: request.userid,
                    user2: res.locals.user.userid
                }).select({ db: this.opts.gateway.db })
            if (preExisting.length > 0) {
                console.log("These people have a friend already")
                throw new statuses.FriendError()
            }
            let reverseRequested = new DatabasePendingFriend(
                {
                    user1: request.userid,
                    user2: res.locals.user.userid
                })
            preExisting = await reverseRequested.select({ db: this.opts.gateway.db })
            if (preExisting.length > 0) {
                console.log("Already have oposite friend request")
                throw new statuses.FriendError()
            }
            reverseRequested.user1 = reverseRequested.user2
            reverseRequested.user2 = request.userid
            preExisting = await reverseRequested.select({ db: this.opts.gateway.db })
            if (preExisting.length > 0) {
                console.log("Already have this friend request")
                throw new statuses.FriendError()
            }
            let pending = new DatabasePendingFriend(
                {
                    user2: request.userid,
                    user1: res.locals.user.userid
                })
            await pending.insert({ db: this.opts.gateway.db });
            success(new statuses.FriendRequestSuccess())

        }))

    }
}
module.exports.route = "/user"
module.exports.description = "RUD User Profiles"
module.exports.parent = require('../private')
module.exports.id = 3