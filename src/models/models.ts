const { isNumber, xor } = require("lodash")

//Used by the server to send your own profile to you
export class ResponseUser { 
    userid: number
    name: string
    email: string
    score:number
    isEditable:boolean
    constructor(u: User | object) { 
        this.userid = u.userid
        this.name = u.name
        this.email = u.email
        this.score = u.score
        this.isEditable = u.isEditable || true
    }
}
//Used by the server to send someone elses profile to you
export class PublicResponseUser { 
    userid: number
    name: string
    score:number
    constructor(u: User | object) { 
        this.userid = u.userid
        this.name = u.name
        this.email = u.email
        this.score = u.score
    }
}

//Used by a client to request someone's details
export class RequestUser { 
    userid: number
    email: string
    name: string
    constructor(u: RequestUser | object) { 
        this.userid = u.userid
        this.email = u.email
        this.name = u.string
    }
}
//Used by the server to indicate a single move, by a single player
export class ResponseMove {
    moveid: number
    x:number
    y:number
    userid: number
    time:number
    gameid: number
    constructor (m:ResponseMove|object){
        this.moveid = m.moveid
        this.x = m.x
        this.y = m.y
        this.userid = m.userid
        this.time = m.time
        this.gameid = m.gameid
    }
}
//Used by the server to give basic game information
export class ResponseGameBasic { 
    gameid: number
    name: string
    size: number[]
    players: number[]
    currentTurn: number | null
    gameWon: boolean
    score: number|null
    constructor(g: ResponseGameBasic | object) { 
        this.gameid = g.gameid
        this.name = g.name
        this.size = g.size
        this.players = g.players
        this.currentTurn = g.currentTurn
        this.gameWon = g.gameWon
        this.score = g.score
    }
}

//Used by the server to send a whole game to a client
export class ResponseGameWhole extends ResponseGameBasic{ 
    state: ResponseMove[]
    constructor(g: ResponseGameWhole | object) { 
        super(g)
        this.state = g.state
    }
}
//Used by the server for wss to send single moves.
//Will probably just use ResponseMove
export class ResponseGameIncremental extends ResponseGameBasic{ 
    move:ResponseMove
    constructor(g: ResponseGameIncremental | object) { 
        super(g)
        this.move = g.move
    }
}

//Used by a client to request for a game request to be opened
export class RequestMatch { 
    size: number[]
    name: string
    participants: number[]
    constructor(m: RequestMatch | object) { 
        this.size = m.size
        this.name = m.name
        this.participants = m.participants 
    }
}


//Used for a client to indicate interest in a match
export class RequestResponseMatch { 
    matchid:number
    accepted:boolean
    msg:string

    constructor(a: RequestResponseMatch | object) { 
        this.matchid = a.matchid
        this.accepted = a.accepted
        this.msg = a.msg
    }
}
//Used by a server to indicate the status of a match
export class ResponseMatch { 
    matchid:number
    accepted:boolean
    gameid:number
    name:string
    size: number[]
    participants: number[]
    msg:string
    constructor(m: ResponseMatch | object) { 
        this.matchid = m.matchid
        this.msg = m.msg
        this.accepted = m.accepted
        this.gameid = m.gameid
        this.name = m.name
        this.size = m.size
        this.participants = m.participants
    }
}
//Used to request a password change, knowing the old password
export class RequestPasswordChangePassword { 
    oldPassword: string
    newPassword: string
    constructor(p: RequestPasswordChangePassword | object) { 
        this.oldPassword = p.oldPassword
        this.newPassword = p.newPassword
    }
}
//Used to request a password change, knowing a token
export class RequestPasswordChangeToken { 
    token: string
    newPassword: string
    constructor(p: RequestPasswordChangePassword | object) { 
        this.token = p.token
        this.newPassword = p.newPassword
    }
}
//Request an email to be sent out with password reset link
export class RequestPasswordReset { 
    email: string
    constructor(p: RequestPasswordReset | object) { 
        this.email = p.email
    }
}
//Request a JWT with email and password
export class LoginRequest { 
    email: string
    password: string
    constructor(l: LoginRequest | object) { 
        this.email = l.email
        this.password = l.password
    }
}


export class DatabaseUser { 
    userid: number
    name: string
    email: string
    score: number

    constructor(u: DatabaseUser | object) { 
        this.userid = u.userid
        this.name = u.name
        this.email = u.email
        this.score = u.score
    }
}
export class DatabaseCredential { 
    credentialid: number
    userid: string
    salt: string
    hash: string
    constructor(d: DatabaseCredential | object) { 
        this.credentialid = d.credentialid
        this.userid = d.userid
        this.salt = d.salt
        this.hash = d.hash
    }
}
export class DatabaseGame {
    gameid:number 
    matchid: number
    currentTurn: number
    gameFinished: boolean
    score: number|null
    constructor(g:DatabaseGame|object){
        this.gameid = g.gameid
        this.matchid = g.matchid
        this.currentTurn = g.currentTurn
        this.gameFinished = g.gameFinished
        this.score = g.score
    }

}
export class DatabaseMove { 
    moveid: number
    gameid: number
    x: number
    y: number
    time: number
    constructor(m:DatabaseMove|object){
        this.moveid = m.moveid
        this.gameid = m.gameid
        this.x = m.x
        this.y = m.y
        this.time = m.time
    }

}
//Used to show a general match
export class DatabaseMatch {

    matchid: number
    userid: number //creator
    width: number
    height: number
    participants:number //number of target participants
    msg: string //Game msg
    name: string //Game name
    acceptance: number //0,1,2
    constructor(m:DatabaseMatch|object){
        this.matchid = m.matchid
        this.userid = m.userid
        this.width = m.width
        this.height = m.height
        this.participants = m.participants
        this.msg = m.msg
        this.name = m.name
        this.acceptance = m.acceptance
}



}
//Used to show a users acceptance or declanation of a match
export class DatabaseMatchAcceptance { 
    matchid: number
    userid: number
    acceptance: number //0,1,2
    msg: string //Optional Message for decliners
    constructor(ma:DatabaseMatchAcceptance){
        this.matchid = ma.matchid
        this.userid = ma.userid
        this.acceptance = ma.acceptance
        this.msg = ma.msg
    }

}

export class PragmaTableInfo { 
    cid: number
    name: string
    type: string
    notnull: number
    dflt_value: any
    pk: number
    constructor(p:PragmaTableInfo|object){
        this.cid = p.cid
        this.name = p.name
        this.type = p.type
        this.notnull = p.notnull
        this.dflt_value = p.dflt_value
        this.pk = p.pk
}

}



export let assign = function (data:object|object[], model, verify) {
    function assignAndVerify(row:object) {
        let res = new model(row)
        if (res.verify) {
            if (!res.verify(verify)) {
                throw new Error("Didn't pass verification")
            }
        }
        return res
    }
    if (Array.isArray(data)) {
        return data.map(row => assignAndVerify(row))
    }
    return assignAndVerify(data)
}

//Shallow compare of property diffs
export let compare = function (oldData, newData) {
    let diffs = []
    let propertyList = [...new Set([...Object.keys(oldData), ...Object.keys(newData)])];
    for (let key of propertyList) {
        if (key.startsWith("_")) continue
        let o = oldData[key]
        o = oldData[`_db_${key}`]?oldData[`_db_${key}`](o):o
        let n = newData[key]
        n = newData[`_db_${key}`]?newData[`_db_${key}`](n):n
        if (n !== o) {
            diffs.push( {
                key: key,
                from: o,
                to: n
            })
        }
    }
    return diffs


}