import { inject } from 'aurelia-framework'
import { Gateway } from '../../gateway'

export class Msg {

    activate(o) {
      this.msg = o.msg
      this.col = o.col
      this.time = this.updateTime(this.msg.time)
      setInterval(()=>{
        this.time = this.updateTime(this.msg.time)
      }, 5000)
    }
    updateTime(t) {
      let curr = new Date()
      if (t) {
          let show = ((curr - t) / 1000)
          let suffix = ""
          if (show < 60) {
              suffix = "s"
          }
          else if (show < 3060) {
              show = show / 60
              suffix = "m"
          }
          else {
              show = show / 3600
              suffix = "h"
          }
          return show.toFixed(0) + suffix
      } 
      return ""
  }
}