export default class APIStatus {
    cls:string
    msg:string
    info:string
    code:number
    constructor(cls:string, msg:string, info:string, code:number){
        this.cls = cls
        this.msg = msg
        this.info = info
        this.code = code
    }
    toString(){
        return JSON.stringify({
            cls:this.cls,
            msg:this.msg,
            info:this.info
        })
    }
}