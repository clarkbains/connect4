import { inject } from 'aurelia-framework'
import { Gateway } from '../gateway'
import { Router } from 'aurelia-router';
import { NotifierService } from 'aurelia-plugins-notifier';

@inject(Gateway, NotifierService, Router)
export class Profile {
    constructor(g, ns, r) {
        this.gateway = g
        this.r = r
        this.ns = ns
        this.socketsConnected = false
        }
    async connectSockets(){
        if (this.socketsConnected) return;
        this.socketsConnected = true;
        if (! this.gateway.getUserSocket()){
            this.gateway.setUserSocket(await this.gateway.connectSocket())
        }
        await this.gateway.authUserSocket("user"+this.profile.userid,this.profile.userid, this.gateway.getUserSocket())
        console.log(this.gateway.getUserSocket())
        this.gateway.getUserSocket().on("user"+this.profile.userid, (d)=>{console.log("Got Data", d); this.reload()})

    }
    reload() {
        this.activate(this.ac)
    }
    detached(){
     if (this.socketsConnected)
      this.gateway.getUserSocket().removeListener("user"+this.profile.userid)
     this.socketConnected=false;
    }
    async activate(obj) {
        let _this = this
        this.ac = obj || this.ac
        this.ac.id = this.ac.id || this.gateway.getId()
        let userId = this.ac.id
        console.log("Activiated with", userId)
        try {
            let r = await this.gateway.getUser(userId)
            console.log(r.user)
            _this.self = r.user.isEditable
            _this.profile = r.user
            _this.private = _this.profile.private
            _this.acceptButton = typeof r.user.pendingFriend === "number"
            _this.pendingButton = r.user.pendingFriend === true
            _this.removeButton = r.user.isFriend;
            _this.addButton = !r.user.pendingFriend && r.user.pendingFriend !== 0
            _this.editing = false;


            let e = await this.gateway.getFriends()
            _this.totalFriends = e.friends.length || 0
            _this.friendsOnline = e.friends.filter((b) => {
                return !!b.online
            })
            _this.friendsOffline = e.friends.filter((b) => {
                return !b.online
            })


            let f = await this.gateway.getFriendRequests()
            _this.reqs = f

        } catch (e) {
            console.error("Ran into issue getting profile, notifying", e);
            _this.ns.danger(e.msg, e.info)
            return this.r.navigateBack();
        }
        this.gateway.getGamesForUser(this.ac.id).then(g => {
            //Make the format of the data slightly more sane
            _this.gameslen = g.resource.length
            g.resource = g.resource.map((e) => {
                //Remove self from opponents
                e.denied = e.opponents.filter(f => f.status == 2).length > 0;
                e.started = !!e.game
                e.readyToPromote = !e.started && e.opponents.filter(f => f.status == 1).length === e.opponents.length;


                let fixedOpp = e.opponents.filter(f => f.userid !== _this.gateway.getId())
                if (e.opponents.length != fixedOpp.length) {
                    e.me = e.opponents.filter(f => f.userid === _this.gateway.getId())[0]

                    e.meWon = !!(e.game && e.game.gamefinished && e.game.userid === _this.gateway.getId());

                    e.needToAccept = e.me.status !== 1
                    e.myTurn = !e.finished && !!(e.game && e.game.currentturn === _this.gateway.getId());

                }
                e.finished = !!(e.game && e.game.gamefinished);


                //e.opponents = fixedOpp;

                return e
            })
            console.log("Got Game data!", g)

            _this.pendingGames = g.resource.filter(o => !o.started && !o.denied)
            _this.deniedGames = g.resource.filter(o => !o.started && o.denied)

            _this.openGames = g.resource.filter(o => o.started && !o.finished && !o.me)
            _this.myOpenGames = g.resource.filter(o => o.started && !o.finished && o.me)

            _this.closedGames = g.resource.filter(o => o.started && o.finished)
            if (this.profile.userid!==this.gateway.getId()){
                _this.openGames = _this.openGames.slice(0, Math.min(_this.openGames.length, 5))
                _this.closedGames = _this.closedGames.slice(0, Math.min(_this.closedGames.length, 5))

            }



            let pCache = {}
            g.resource.forEach(o => {
                o.opponents.forEach(p => {
                    if (typeof p.userid == "number" && !pCache[p.userid]) {
                        pCache[p.userid] = _this.gateway.getUser(p.userid)
                    }
                })
            })
            let pArr = []
            for (let key of Object.keys(pCache)) {
                pArr.push(pCache[key])
            }
            _this.peopleCache = {}
            Promise.all(pArr).then((p) => {
                console.log(p)
                p.forEach(q => {
                    _this.peopleCache[q.user.userid] = q.user
                })
            })

        })
        await this.connectSockets()
        
    }

    startGame() {
        this.r.navigate(`/gameSelection/${this.profile.userid}`)
    }
    requestFriend() {
        let _this = this
        this.gateway.sendFriendRequest(this.profile.userid).then((e) => { console.log("Requested", e); _this.activate() }).catch(e => {
            _this.ns.danger(e.msg, e.info)
        })
    }
    removeFriend() {
        let _this = this
        this.gateway.deleteFriend(this.profile.userid).then((e) => { _this.activate() }).catch(e => {
            _this.ns.danger(e.msg, e.info)
        })
    }
    acceptFriendRequest() {
        let _this = this
        this.gateway.acceptFriendRequest(this.profile.pendingFriend).then((e) => { _this.activate() }).catch(e => {
            _this.ns.danger(e.msg, e.info)
        })
    }
    declineFriendRequest(){
        let _this = this
        this.gateway.declineFriendRequest(this.profile.pendingFriend).then((e) => { _this.activate() }).catch(e => {
            _this.ns.danger(e.msg, e.info)
        })
    }


    togglePrivate() {
        if (!this.editing)
            return;
        this.private = this.private ? 0 : 1
        console.log("Private is set to", this.private)
    }

    edit() {
        this.editing = !this.editing
        let _this = this
        let changeKeys = [{ ref: "usernameVal", name: "username" }, { ref: "emailVal", name: "email" }, { ref: "private", name: "private" }]
        if (!this.editing) {
            let changeObj = {}
            for (let key of changeKeys) {
                if (this[key.ref] !== undefined)
                    changeObj[key.name] = this[key.ref]
            }
            console.log(changeObj)
            this.gateway.editMe(changeObj).then((e) => { _this.activate() }).catch(e => {
                _this.ns.danger(e.msg, e.info)
            })
        } else {
            console.log("Prefilling")
            for (let key of changeKeys) {
                this[key.ref] = this.profile[key.name]
            }
        }

    }


}
