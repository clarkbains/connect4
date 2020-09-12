import APIStatus from "../APIStatus";

export default class APIError extends APIStatus {

    constructor(msg:string, info:string, code:number){
        super("error",msg,info,code)
    }
}