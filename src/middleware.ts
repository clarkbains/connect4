import express from 'express'
import { send } from 'process'
import APIError from './resources/errors/APIError'
import RouteError from './resources/errors/RouteError'
import UnknownError from './resources/errors/UnknownError'
module.exports = {
  authMiddleware: function (req: Request, res, next) {

    next()
  },
  errorMiddleware: function (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log("Error")
    console.error(err, err.stack)
    let sendErr: APIError
    if (!err.code)
      sendErr = new UnknownError()
    else
      sendErr = err
    res.status(sendErr.code).send(sendErr)
  },
  noRouteMiddleware: function (req: express.Request, res: express.Response) {
    throw new RouteError()
  }
}
