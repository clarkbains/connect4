import * as statuses from './APIStatus'
import express from 'express'
export function VerifyProperties(obj:object): object{

        if (!obj.verify){
            return console.error("Verify Callsed for Model with no verify attribute", obj)
        }
        else if (!obj.verify()){
            throw new statuses.FieldsNotValidated()
        }
    return obj
}
export function DefaultProperties(obj:object, properties:string[][]):object{
    for (let prop of properties){
        if (obj[prop[0]] === undefined){
            obj[prop[0]] = prop[1]
        }
    }
    return obj
}
export function CopyTo(obj:object, properties:string[][]):object{
    for (let prop of properties){
        if (obj[prop[0]] === undefined){
            obj[prop[0]] = prop[1]
        }
    }
    return obj
}
//Handles errors in async promise chains a lot nicer than otherwise.
//Also passes helper function to send the responses defined in resources/APIStatuses.ts
export function WrapRequest(func:Function) {
        
    return async (req:express.Request, res:express.Response) => {
        async function sendResponse (r:statuses.APIStatus){
          //  console.log("Response Callback fired with", r)
            if (r.code){
                res.status(r.code).send(r)
            } else {
                console.warn("Do not send :any objects with the callback")
                res.status(200).send(r)
            }
        }
        try {
            await func(req, res, sendResponse)
        } catch (e) {
            console.log("Thrown from Route wrapper", e)
            if (e && e.code) {
                
                return await sendResponse(e)
            }
            
            await sendResponse(new statuses.UnknownError())
        }
    }
}
export function WrapMiddleware(func:Function) {
        
    return async (req:express.Request, res:express.Response, next:Function) => {
        async function sendResponse (r:statuses.APIStatus){
            if (r.code){
                res.status(r.code).send(r)
            } else {
                console.warn("Do not send :any objects with the callback")
                res.status(200).send(r)
            }
        }
        try {
            await func(req, res, next)
        } catch (e) {
            console.log("Thrown from Middleware wrapper", e)
            if (e && e.code) {
                
                return await sendResponse(e)
            }
            
            await sendResponse(new statuses.UnknownError())
        }
    }
}
export function GetDomain(req){
    let host = req.headers.host
    return host.match(/^([^:]*)(:\d*)?$/)[1]
}