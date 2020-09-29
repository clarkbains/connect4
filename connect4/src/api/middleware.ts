import express from 'express'
import { send } from 'process'
import * as statuses from './resources/APIStatus'

module.exports = {
  authMiddleware: function (req: express.Request, res:express.Response, next) {
    next()
  },
  errorMiddleware: function (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log("Error")
    console.error(err, err.stack)
    let sendErr: statuses.APIError
    if (!err.code)
      sendErr = new statuses.UnknownError()
    else
      sendErr = err
    res.status(sendErr.code).send(sendErr)
  },
  noRouteMiddleware: function (req: express.Request, res: express.Response) {
    throw new statuses.RouteError()
  }
}