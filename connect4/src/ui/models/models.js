export default class Request{
    toString(){
        return JSON.stringify(this)
    }
}
export class LoginRequest extends Request{
    constructor (username, email ,password){
        this.username = username
        this.password = password
    }
}