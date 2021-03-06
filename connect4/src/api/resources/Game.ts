import { Database } from "sqlite3"
import { debug } from "webpack"
import * as models from "../models/models"
import Gateway from "../gateway"
import OnlineTracker from "./OnlineTracker"

export default class Game {
    db: Database
    gameId: number
    matchId: number
    width: number
    height: number
    players: number[]
    playerIndex: number
    finished: boolean
    tracker: OnlineTracker
    constructor(db: Database, gameId: number) {
        this.db = db
        this.gameId = gameId
        this.finished = false
        this.playerIndex = 0;
        this.tracker = new OnlineTracker(-1)

    }
    static async findMatchingMatchId(userid: number, privacylevel: number, db: Database): Promise<number> {
        let foundMatch = await new models.DatabaseMatchAcceptance({}).raw(db, {
            sql: "select Matchs.matchid, matcchacceptanceid from MatchAcceptances JOIN Matchs on Matchs.matchid = MatchAcceptances.matchid WHERE MatchAcceptances.userid is null AND Matchs.privacylevel = ? GROUP BY MatchAcceptances.matchid;",
            params: [privacylevel],
            model: models.DatabaseMatchAcceptance
        })
        if (!foundMatch || !foundMatch.length) {
            return undefined;
        }
        console.log(foundMatch)
        let foundId = undefined;
        let foundMAID = undefined;
        for (let mid of foundMatch) {
            let selfMatch = await new models.DatabaseMatchAcceptance({
                matchid: mid.matchid,
                userid: userid
            }).select({ db: db })
            if (!selfMatch.length) {
                foundId = mid.matchid
                foundMAID = mid.matcchacceptanceid
            }
        }
        if (foundMAID === undefined) {
            return undefined;
        }
        console.log("fid", foundId)
        let pending = new models.DatabaseMatchAcceptance({
            userid: userid,
            matcchacceptanceid: foundMAID,
            status: 1
        })
        await pending.update({ db: db })
        return foundId
    }
    static async createMatch(name: string, users: number[], creator: number, privacy: number, db: Database): Promise<number> {
        let matchOpts = {
            //participants: users.length + (computer ? 1 : 0), //Add an autogen user in there.
            participants: 2,
            msg: name,
            name: "Match From " + (new Date()).toISOString(),
            width: 8,
            height: 6,
            status: 0,
            userid: creator,
            privacylevel: privacy
        }
        let match = new models.DatabaseMatch(matchOpts)

        await match.insert({ db: db })
        match = await match.select({ db: db, limit: 1 })
        //console.log(matchId)
        for (let i = 0; i < 2; i++) {
            let participant = users.length > i ? users[i] : undefined
            //Make all users have a mending acceptance
            let pending = new models.DatabaseMatchAcceptance({
                userid: participant,
                matchid: match.matchid,
                //Auto Accept invites from own game.
                status: participant === creator ? 1 : 0
            })
            await pending.insert({ db: db })
        }

        /*if (computer)
            await new models.DatabaseMatchAcceptance({
                userid: -1,
                matchid: match.matchid,
                status: 1
            }).insert({ db: db }) //Add computer Player*/

        return <number><unknown>match.matchid;

    }


    static async acceptGame(matchid: number, db: Database): Promise<boolean> {
        //Set all pending requests to accepted, 

        //Raw queueries are kinda bad to do with the orm.
        //Update works by identifying primary keys and using them as the where clause
        //We have no info about the prim keys, so we would have to select then call update otherwise.
        await new models.DatabaseMatchAcceptance({}).raw(db, {
            sql: "UPDATE MatchAcceptances set status = 1 where matchid=?",
            params: [matchid]
        })

        console.log("Players accepted")

        let match = new models.DatabaseMatch({ matchid: matchid, status: 1 })
        await match.update({ db: db })

        return true;
    }
    static async setResponse(userid: number, matchid: number, status: number, db: Database): Promise<boolean> {
        //Set all pending requests to accepted, 

        //Raw queueries are kinda bad to do with the orm.
        //Update works by identifying primary keys and using them as the where clause
        //We have no info about the prim keys, so we would have to select then call update otherwise.
        await new models.DatabaseMatchAcceptance({}).raw(db, {
            sql: "UPDATE MatchAcceptances set status = ? where matchid=? AND userid=?",
            params: [status, matchid, userid]
        })
        return true;
    }

    static async startGame(matchid: number, db: Database): Promise<number> {
        let matches = await new models.DatabaseMatch({ matchid: matchid, status: 0 }).select({ db: db })
        if (matches.length == 0) {
            throw new Error("Could not find match to init")
        }
        let accepted = await new models.DatabaseMatchAcceptance({
            matchid: matchid,
            status: 1
        }).select({ db: db })
        let all = await new models.DatabaseMatchAcceptance({
            matchid: matchid,

        }).select({ db: db })

        if (accepted.length != all.length) {
            throw new Error("Not everyone has accepted yet")
        }

        let match = new models.DatabaseMatch({ matchid: matchid, status: 1 })
        await match.update({ db: db })

        let game = new models.DatabaseGame({
            matchid: matchid,
            currentturn: accepted[0].userid
        })
        await game.insert({ db: db });
        let selected = await game.select({ db: db, limit: 1 })
        return selected.gameid
    }
    async getPlayers() {
        await this._getInfo()
        return this.players
    }
    async getMatchId(): Promise<number> {
        await this._getInfo()
        return this.matchId
    }
    async _getInfo() {

        let s = await new models.DatabaseGame({ gameid: this.gameId }).select({ db: this.db, limit: 1 })
        this.matchId = s.matchid
        if (!this.width || !this.height) {
            let m = await new models.DatabaseMatch({ matchid: this.matchId }).select({ db: this.db, limit: 1 })

            this.width = m.width
            this.height = m.height
        }

        let playing = await new models.DatabaseMatchAcceptance({
            matchid: this.matchId,
            status: 1
        }).select({ db: this.db })

        this.players = []
        this.finished = s.gamefinished
        
        for (let elm of <models.DatabaseMatchAcceptance[]>playing) {
            this.players.push(elm.userid)
        }
        this.playerIndex = this.players.indexOf((await new models.DatabaseGame({
            gameid: this.gameId
        }).select({ db: this.db, limit: 1 })).currentturn);
        //console.log("Finished Getting Info", this)

    }
    async getBoard(): Promise<(number | undefined)[][]> {
        await this._getInfo()
        return this._getBoard()
    }
    async isMyTurn(userid: number) {
        return this.players[this.playerIndex] === userid
    }
    async turn() {
        if (!this.players)
            await this.getBoard();
        return this.players[this.playerIndex]
    }
    async _getBoard(): Promise<(number | undefined)[][]> {
        let moves = await new models.DatabaseMove({
            gameid: this.gameId
        }).select({ db: this.db });
        let board: number[][] = []
        for (let i = 0; i < this.height; i++) {
            let cur: (number | undefined)[] = []
            for (let j = 0; j < this.width; j++) {
                cur.push(undefined)
            }
            board.push(cur)
        }
        for (let move of <models.DatabaseMove[]>moves) {
            board[move.y][move.x] = move.userid;
        }
        return board;
    }

    async makeMove(userid: number, x: number): Promise<(number | undefined)[][]> {

        await this._getInfo()
        if (this.players.indexOf(userid) !== this.playerIndex) {
            throw new Error("It is not your turn")
        } else if (this.finished) {
            throw new Error("You may not go.")
        }
        try {
            x = Number(x)
        }
        catch {
            throw new Error("Could not convert x coord")
        }
        let moves = await new models.DatabaseMove({
            gameid: this.gameId,
            x: x
        }).select({ db: this.db });
        let ycoord = moves.map(e => { return e.y })
        let desiredY: number = -1
        for (let yc of ycoord) {
            if (yc > desiredY) {
                desiredY = yc
            }
        }
        desiredY++
        //console.log("Max height", this.height, desiredY)
        if (desiredY >= this.height || x < 0 || x >= this.width) {
            throw new Error("Cannot Place piece here")
        }
        let move = new models.DatabaseMove({
            gameid: this.gameId,
            x: x,
            y: desiredY,
            userid: userid,
            time: Math.floor(new Date().getTime() / 1000)
        })
        await move.insert({ db: this.db })

        //Advance to next player
        this.playerIndex = (this.playerIndex + 1) % this.players.length
        await new models.DatabaseGame({
            gameid: this.gameId,
            currentturn: this.players[this.playerIndex]
        }).update({ db: this.db })
        await this.postMove(move);

        // return board;
    }
    //Will check if game is won, if not, then if its bot turn. Will cause stackoverflow
    // if only bot players
    async postMove(move: models.DatabaseMove) {
        if (this.players.filter(e => { return e === -1 }).length === this.players.length) {
            throw new Error("Only Bot players. This won't end well")
        }
        let size = 4;
        let board = await this._getBoard()
        for (let dx of [-1, 0, 1]) {
            for (let dy of [-1, 0, 1]) {
                if (dx == 0 && dy == 0) {
                    continue;
                }
                let result = await this.checkForLine(board, move.x, move.y, dx, dy, 4)
                console.log(result)
                if (result !== false) {
                    await this.finishGame(result)
                    return
                }
            }
        }
        if (board[this.height - 1].filter(e => e === undefined).length === 0) {
            await this.finishGame(undefined)
        }
        await this.botMove()

    }
    //This returns false if no streak is found, -1 if its the computer winning, or an int of the playerid if a player has made a streak
    async checkForLine(board: (number | undefined)[][], sx: number, sy: number, dx: number, dy: number, length: number) {
        let row: number[] = []
        for (let i = -length; i < length; i++) {
            let x = sx + (i * dx);
            let y = sy + (i * dy);
            //console.log("Offsets are",x,y, sx,i,dx,sy,i,dy)

            if (x >= 0 && x < board[0].length && y >= 0 && y < board.length) {
                console.log(sx, sy, dx, dy, x, y, board[y][x])
                row.push(board[y][x])

            }
        }
        //row will be variable length with eg [undefined,0,0,1,0,0,0,0]
        let current = undefined
        let streaks: object[] = []
        let cnt = 0;
        for (let elm of row) {
            if (elm === current) {
                cnt++;
            }
            else {
                streaks.push([current, cnt])
                current = elm;
                cnt = 1;
            }
        } if (cnt != 0)
            streaks.push([current, cnt])
        //console.log(`Origin is x:${sx},y:${sy}), Started from (x:${sx -(4*dx)},y:${sy -(4 * dy)}) , Ended at (x:${Number(sx +(4*dx))},y:${Number(sy+(4*dy))}) going x:${dx} y: ${dy}`)
        //console.log("Got Row: ", row)
        //console.log("Streaks: ", streaks)
        for (let streak of streaks) {
            if (!!streak[0]) { //If its an active player
                if (streak[1] >= length) {
                    return streak[0]
                }
            }
        }
        return false
    }
    async getScores() {
        let realPlayers = this.players.filter(e => { return !!e })
        let users = await new models.DatabaseUser({}).raw(this.db, {
            sql: `SELECT * from Users  where userid in (${realPlayers.map(e => "?").join(",")})`,
            params: realPlayers,
            model: models.DatabaseUser
        })
        return users
    }
    async botMove() {
        if (this.players[this.playerIndex] === -1) {
            console.log("Making Bot Move")
            let sanity = 50;
            while (sanity--) {
                try {
                    await this.makeMove(-1, Math.floor(Math.random() * Math.floor(this.width)))
                    break
                } catch {
                    console.log("Failed to place bot piece")
                }
            }
        }
    }
    async getGameWinner() {
        if (!this.isGameFinished())
            return null
        let r = await new models.DatabaseGame({
            gameid: this.gameId,
        }).select({ db: this.db, limit: 1 })
        return r ? r.userid : undefined;
    }
    async isGameFinished() {
        await this._getInfo()
        return this.finished
    }
    async getUsersWhoArent(userid: number): Promise<number[]> {
        await this._getInfo();
        let found: number[] = []
        for (let user of this.players) {
            if (user !== userid) {
                found.push(user)
            }
        }
        return found
    }
    async finishGame(userid: number) {
        console.log("Finished Game")
        this.finished = true
        await new models.DatabaseGame({
            gameid: this.gameId,
            gamefinished: 1,
            userid: userid
        }).update({ db: this.db })
        for (let player of this.players) {
            //Bots don't get scores.
            if (player < 0) {
                continue;
            }

            if (userid === player) {
                console.log("Updating score for user", userid)
                let winner = await new models.DatabaseUser({
                    userid: userid
                }).select({ db: this.db, limit: 1 })
                console.log(winner)
                winner.score = winner.score += 1;
                await winner.update({ db: this.db })
            }

            let p = await new models.DatabaseUser({
                userid: player
            }).select({ db: this.db, limit: 1 })
            p.totalGames += 1
            await p.update({ db: this.db });
        }


    }

}
/*
import conf from '../config'
import { TokenDebugRequest } from "./APIStatus"
let gw = new Gateway(conf.dbFile,false)
console.log("Waiting for init\n\n")
setTimeout(()=>{
    console.log("Starting\n")
    Game.createMatch([1],1,0,true,gw.db).then(async (id)=>{
        console.log("Created Match",id)
            await Game.acceptGame(id, gw.db)
            console.log("Accepted Match")
            let gameid = await Game.startGame(id, gw.db)
            console.log("Created db Instance gameid:", gameid)
            let gameInstance = new Game(gw,gameid)
            console.log("Made instance")
            function prettyPrintBoard(b:(number|undefined)[][]){
                let r = ""
                for (let y of b.reverse()){
                    for (let x of y){
                        let tsx = x?String(x):""
                        r += tsx.padStart(3," ").padEnd(4," ")
                    }
                    r+="\n"
                }
                console.log(r)
            }
            let b = await gameInstance.getBoard()
            console.log("Initial Board")
            prettyPrintBoard(b)

            console.log("Scores", await gameInstance.getScores())
            while (!await gameInstance.isGameFinished()){
                let sanity = 50;
                console.log("Current is ")
                prettyPrintBoard(await gameInstance.getBoard())
                while (sanity--){
                    try {
                        let xco = Math.floor(Math.random() * Math.floor(gameInstance.width))
                        await gameInstance.makeMove(1,xco)
                        console.log("Starting new turn", xco)
                        break
                    } catch {
                        console.log("Failed to place user piece")
                    }
                }
                console.log("After turn")
                prettyPrintBoard(await gameInstance.getBoard())
            }
            console.log("Game winner was ", await gameInstance.getGameWinner())
        })

},1000)

*/