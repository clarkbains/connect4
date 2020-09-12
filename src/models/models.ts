const { isNumber, xor } = require("lodash")

//Used by the server to send your own profile to you
class ResponseUser { 
    userid: number
    name: string
    email: string
    score:number
    isEditable:boolean
    constructor(u: User | object) { 
        this.id = u.id
        this.name = u.name
        this.email = u.email
        this.score = u.score
        this.isEditable = u.isEditable || true
    }
}
//Used by the server to send someone elses profile to you
class Public ResponseUser { 
    userid: number
    name: string
    score:number
    constructor(u: User | object) { 
        this.id = u.id
        this.name = u.name
        this.email = u.email
        this.score = u.score
    }
}

//Used by a client to request someone's details
class RequestUser { 
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
class ResponseMove {
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
class ResponseGameBasic { 
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
class ResponseGameWhole extends ResponseGameBasic{ 
    state: ResponseMove[]
    constructor(g: ResponseGameWhole | object) { 
        super(g)
        this.state = g.state
    }
}
//Used by the server for wss to send single moves.
//Will probably just use ResponseMove
class ResponseGameIncremental extends ResponseGameBasic{ 
    move:ResponseMove
    constructor(g: ResponseGameIncremental | object) { 
        super(g)
        this.move = g.move
    }
}

//Used by a client to request for a game request to be opened
class RequestMatch { 
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
class RequestResponseMatch { 
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
class ResponseMatch { 
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
class RequestPasswordChangePassword { 
    oldPassword: string
    newPassword: string
    constructor(p: RequestPasswordChangePassword | object) { 
        this.oldPassword = p.oldPassword
        this.newPassword = p.newPassword
    }
}
//Used to request a password change, knowing a token
class RequestPasswordChangeToken { 
    token: string
    newPassword: string
    constructor(p: RequestPasswordChangePassword | object) { 
        this.token = p.token
        this.newPassword = p.newPassword
    }
}
//Request an email to be sent out with password reset link
class RequestPasswordReset { 
    email: string
    constructor(p: RequestPasswordReset | object) { 
        this.email = p.email
    }
}
//Request a JWT with email and password
class LoginRequest { 
    email: string
    password: string
    constructor(l: LoginRequest | object) { 
        this.email = l.email
        this.password = l.password
    }
}




class DatabaseUser { 
    userid: number
    name: string
    email: string
    salt: string
    hash: string
    score: number
    constructor(u: DatabaseUser | object) { 
        this.id = u.id
        this.name = u.name
        this.email = u.email
        this.salt = u.salt
        this.hash = u.hash
        this.score = u.score
    }
}
class DatabaseGame { 
    gameid: number
    name: string
    email: string
    salt: string
    hash: string
    score: number

}class DatabaseMove { 
    moveid: number
    gameid: number
    x: number
    y: number
    time: number

}
class DatabaseMatchRequest { 
    matchid: number
    size: number[] | string
    participants: number[]|string
    accepted: boolean
    gameid:number

}
class DatabaseMatchAcceptances { 
    matchid: number
    userid: number
    accepted: boolean
    msg: string

}



module.exports.models = {


}
module.exports.assign = function (data:object|object[], model, verify) {
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
module.exports.compare = function (oldData, newData) {
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