
import express from 'express'
import { RequestUser, UserModifyRequest, DatabaseUser, DatabaseFriend, PublicResponseUser, FriendRequest, DatabasePendingFriend, FriendRequestUserResponseRequest } from '../../../models/models'
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
            let resp = new statuses.GetUserSuccess(new RequestUser(res.locals.user))
            console.log(resp)
            success(resp)
        }))
        this.app.get("/:userid", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let r = new DatabaseUser({ userid: req.params.userid })

            let f = new DatabaseFriend({ user1: res.locals.userid, user2: r.userid })
            let friends = await f.select({ db: this.opts.gateway.db });


            let u = await r.select({ db: this.opts.gateway.db });
            if (u.length == 0) {
                throw new statuses.NotFound("User")
            }
            let foundUser = new PublicResponseUser(u[0]);

            if (!friends && r.userid!==res.locals.user.userid && u[0].private){
               foundUser = new PublicResponseUser(new PublicResponseUser({userid:r.userid}))
            }

            let resp = new statuses.GetUserSuccess(foundUser)
            console.log(resp)
            success(resp)
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
            res = await new DatabaseFriend({
                user1: res.locals.user.userid,
            }).select({ db: this.opts.gateway.db })
            let friends = res.map(e=>{return e.user2})
            success(new statuses.GetFriendsSuccess(friends))

        }))
        this.app.delete("/me/friends/:userid", APIHelpers.WrapRequest(async (req: express.Request, res: express.Response, success: Function) => {
            let r = new FriendRequest({userid:req.params.userid})
            try{
                APIHelpers.VerifyProperties(r)
            }catch{
                throw new statuses.MissingRequiredField(["userid"])
            }
            //Delete both sides
            await new DatabaseFriend({
                user1: res.locals.user.userid,
                user2:r.userid
            }).delete({ db: this.opts.gateway.db })
            await new DatabaseFriend({
                user2: res.locals.user.userid,
                user1:r.userid
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
            let friendsa = a.map(e=>{return e.user2})
            let friendsb = b.map(e=>{return e.use12})
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
            let pending = new DatabasePendingFriend(
                {
                    user2: req.params.userid,
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