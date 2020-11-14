import express from 'express'
import Game from '../../../../resources/Game'
import * as APIHelpers from '../../../../resources/APIHelpers'
import { AcceptAllError, AcceptAllSuccess, MatchCreateError, MatchCreationSuccess, MissingRequiredField, PromoteError, PromotionSuccess } from '../../../../resources/APIStatus'
import { EventSubscription, MatchStatusChangeRequest, Message, RequestMatch } from '../../../../models/models'

module.exports = class {
    app: express.Application
    opts: object
    constructor(opts: object) {
        this.opts = opts
        this.app = express()
        this.setupApplication()

    }
 
    setupApplication() {
        
        
         
        
      
    }

}
module.exports.route = "/messages"
module.exports.description = "Message Handler"
module.exports.parent = require('../games')
module.exports.id = 10