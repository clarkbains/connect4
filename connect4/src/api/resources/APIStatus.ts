import { DatabaseGameMessage, DatabaseMatch, DatabaseMove, ResponseUser } from "../models/models"

//MAIN
export class APIStatus {
    cls: string
    msg: string
    info: string
    code: number
    constructor(cls: string, msg: string, info: string, code: number) {
        this.cls = cls
        this.msg = msg
        this.info = info
        this.code = code
    }
    toString() {
        return JSON.stringify({
            cls: this.cls,
            msg: this.msg,
            info: this.info
        })
    }
}
//SUCCESSES
export class APISuccess extends APIStatus {

    constructor(msg: string, info: string, code?: number) {
        super("success", msg, info, code ? code : 200)
    }

}
export class CreateUserSuccess extends APISuccess {

    constructor() {
        super("account created", "please validate your email")
    }

}

export class GenericSuccess extends APISuccess {

    constructor() {
        super("Success", "This Action Succeeded")
    }

}
export class ChangePasswordSuccess extends APISuccess {

    constructor() {
        super("Password Changed", "please login again")
    }

}
export class TokenDebugRequest extends APISuccess {
    token: string
    constructor(token) {
        super("Got Token", "Dev Token")
        this.token = token
    }

}
export class LoginSuccess extends APISuccess {
    token: string
    userid: number
    constructor(jwt: string, id: number) {
        super("Logged In", "Please Make a request")
        this.token = jwt
        this.userid = id
    }

}
export class GetUserSuccess extends APISuccess {
    user: object
    constructor(user: object) {
        super("Got User", "")
        this.user = user
    }
}
export class GetUsersSuccess extends APISuccess {
    users: object[]
    constructor(user: object[]) {
        super("Got Users", "")
        this.users = user
    }
}
export class GetStateSuccess extends APISuccess {
    currentTurn: number
    finished:boolean
    winner:number|undefined
    constructor(o: GetStateSuccess|object) {
        super("Got State", "")
        this.currentTurn = o.currentTurn
        this.finished = o.finished
        this.winner = o.winner
    }
}
export class GetFriendsSuccess extends APISuccess {
    friends: number[]
    constructor(friends: number[]) {
        super("Got Friends", "")
        this.friends = friends
    }
}
export class GotPrivateUser extends APISuccess{
    userid: number
    constructor(id: number) {
        super("Got Private Account", "")
        this.userid = id
    }
}
export class ResignationSuccess  extends APISuccess{
    constructor() {
        super("Resigned", "You have resigned from this game")
    }
}
export class GetPendingFriends extends APISuccess {
    incoming: number[]
    outgoing: number[]
    constructor(incoming: number[], outgoing: number[]) {
        super("Got Requests", "")
        this.incoming = incoming
        this.outgoing = outgoing
    }
}
export class GameWatchers extends APISuccess {
    players: ResponseUser[]
    watchers: ResponseUser[]
    constructor(players: ResponseUser[], watchers: ResponseUser[]) {
        super("Got Watchers", "")
        this.players = players
        this.watchers = watchers
    }
}
export class MatchCreationSuccess extends APISuccess {
    matchid: number
    constructor(matchid) {

        super("Created Match", `Your match has been created`)
        this.matchid = matchid
    }

}
export class PromotionSuccess extends APISuccess {
    gameid: number
    constructor(gameid) {
        super("Promoted Match", `You can now play game ${gameid}`)
        this.gameid = gameid
    }

}
export class GetMatchSuccess extends APISuccess {
    match: DatabaseMatch
    constructor(m) {
        super("Got Match", ``)
        this.match = m
    }
}
export class AcceptAllSuccess extends APISuccess {
    matchid: number
    constructor() {
        super("Accepted Match", `Your match has been Accepted, promote it to begin playing`)
    }
}
export class FriendRequestSuccess extends APISuccess {
    constructor(){
        super("Friend Request", "The operation has succeeded.")
    }
}
export class LogoutSuccess extends APISuccess {
    constructor() {
        super("Logged Out", `Your sessison tokens have been overwritten`)
    }

}
export class JoinSuccess extends APISuccess {
    matchid:number
    constructor(id:number) {
        super("Join", `Found you a match to join`)
        this.matchid = id
    }

}
export class TurnSuccess extends APISuccess {
    userid:number
    constructor(turn:number) {
        super("Turn", `It is the turn of userid: ${turn}`)
        this.userid = turn
    }

}
export class GameStateSuccess extends APISuccess {
    resource:number
    constructor(finished:number) {
        super("Game State", `The Game is ${finished?"finished":"not finished"}`)
        this.resource = finished
    }

}
export class WinnerSuccess extends APISuccess {
    resource:number
    constructor(win:number) {
        super("Game Winner", win===undefined?"The Game is tied":`The winner has the id ${win}`)
        this.resource = win
    }

}
export class IncrementalMovesSuccess extends APISuccess {
    moves:DatabaseMove[]
    constructor(m:DatabaseMove[]) {
        super("Moves", "Here are current moves")
        this.moves = m;
    }

}
export class ResourceSuccess extends APISuccess {
    resource:any
    constructor(thing:any) {
        super("Got Resource", ``)
        this.resource = thing
    }

}
export class MesageSuccess extends APISuccess {
    messages:DatabaseGameMessage[]
    constructor(thing:any) {
        super("Got Messages", ``)
        this.messages = thing
    }

}
export class DeleteSuccess extends APISuccess {
    constructor(type: string) {
        super("Deleted", `${type} has been deleted`)
    }

}
//ERRORS
export class APIError extends APIStatus {

    constructor(msg: string, info: string, code: number) {
        super("error", msg, info, code)
    }
}
export class CouldNotFindMatch extends APIError {

    constructor() {
        super("Could Not Find Open Match", "Please Try again later, or make one yourself",404)
    }

}
export class AuthorizationError extends APIError {
    constructor() {
        super("Invalid Session", "You may need to sign in again", 401)
    }
}
export class ResourceError extends APIError {
    constructor() {
        super("Resource Error", "Could not retrieve the given resource", 404)
    }
}
export class FieldError extends APIError {
    constructor(invalidItems: Map<string, string>) {
        let messagePairs: string[] = []
        for (let key of invalidItems.keys()) {
            messagePairs.push(`"${key}" ${invalidItems.get(key)}.`)
        }
        super("Field Error", messagePairs.join(", "), 400)
    }
}
export class CredentialError extends APIError {
    constructor() {
        super("Invalid Credentials", "Double Check your Login Credentials", 401)
    }
}
export class MatchCreateError extends APIError {
    constructor() {
        super("Could Not Create Match", "Double check settings or try again later", 400)
    }
}

export class FriendError extends APIError {
    constructor(){
        super("Friend Error", "Ran into an error while doing this operation",500)
    }
}
export class LonelyError extends APIError {
    constructor(){
        super("Lonely Error. :(", "This person is not your friend",400)
    }
}

export class GenericErrorWrapper extends APIError {
    constructor(e:Error) {
        super("Error", e.message, 500)
    }
}
export class AcceptAllError extends APIError {
    constructor() {
        super("Could Not Accept Match", "Bad Request", 400)
    }
}
export class PromoteError extends APIError {
    constructor() {
        super("Could Not Promote Match", "Bad Request", 400)
    }
}
export class JWTError extends APIError {
    constructor() {
        super("Invalid JWT", "This JWT is not valid", 401)
    }
}
export class NoPasswordSet extends APIError {
    constructor() {
        super("No Password Set", "Please Verify your account", 401)
    }
}
export class MissingRequiredField extends APIError {
    constructor(missingFields: string[]) {
        let map = []
        for (let field of missingFields) {
            map.push(`${field} field is required`)
        }
        super("Field Error", map.join(", "), 400)
    }

}
export class FieldsNotValidated extends APIError {
    constructor() {
        super("Fields Not Validated", "This request failed a verification step. Please check the Docs", 400)

    }
}
export class NotFound extends APIError {
    constructor(type: string) {
        super(`Cannot Find ${type}`, `the resource cannot be found on the server`, 404)
    }
}
export class PasswordValidationError extends APIError {
    constructor() {
        super("Bad Password", "Your password does not meet requirements", 401)
    }
}
export class ResourcePermissionError extends APIError {
    constructor() {
        super("Resource Permission Error", "You cannot attempt to modify this resource since it is not yours", 401)
    }
}
export class RouteError extends APIError {

    constructor() {
        super("Route Error", "There are no routes for the route you are trying to reach", 404)
    }
}
export class DatabaseError extends APIError {
    constructor() {
        super("Error", "a database query failed", 500)
    }
}
export class UnknownError extends APIError {
    constructor() {
        super("Error", "something happened", 500)
    }
}
export class BadPasswordResetRequest extends FieldError {
    constructor() {
        super(new Map(
            [
                ["token", " or oldpassword must be provided"],
                ["oldpassword", " or token must be provided"]
            ]
        )
        )
    }
}
