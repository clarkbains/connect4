import { json } from 'body-parser'
import './models/models'
module.exports = class Gateway { 
  //Just Testing a promise based gateway
  getUserById(id: number) {
    return new Promise((resolve, reject)=>{
      setTimeout(()=>{
      resolve(JSON.stringify({yay:"user"}))
      },1000)
    })
    
         
  }
}