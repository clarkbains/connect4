import { inject } from 'aurelia-framework'
import { Gateway } from '../../gateway'

export class Msg {

  activate(o) {
    this.msg = o.msg
    this.col = o.col
    this.time = this.updateTime(this.msg.time)
    setInterval(() => {
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
      else if (show < 3600) {
        show = show / 60
        suffix = "m"
      } else if (show < (3600 * 24)) {
        show = show / 3600
        suffix = "h"
      }
      else if (show < (3600 * 24 * 7)) {
        show = show / (3600 * 24)
        suffix = "d"
      } else {
        show = show / (3600 * 24 * 7)
        suffix = "w"
      }
      return show.toFixed(0) + suffix
    }
    return ""
  }
}