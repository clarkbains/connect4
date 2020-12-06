import { inject } from 'aurelia-framework'
import { Gateway } from '../gateway'

@inject(Gateway)
export class Home {
    constructor(g) {
        let time = 0;
        this.seconds = 0;
        let _this = this
        console.log(this)

        setInterval(() => {
            _this.seconds = time / 10;
            time++
        }, 100)
    }
    attached() {
        //Copied from https://stackoverflow.com/questions/9514179/how-to-find-the-operating-system-version-using-javascript
        let OSName = "";
        if (window.navigator.userAgent.indexOf("Windows NT 10.0") != -1) OSName = "Windows 10";
        if (window.navigator.userAgent.indexOf("Windows NT 6.2") != -1) OSName = "Windows 8";
        if (window.navigator.userAgent.indexOf("Windows NT 6.1") != -1) OSName = "Windows 7";
        if (window.navigator.userAgent.indexOf("Windows NT 6.0") != -1) OSName = "Windows Vista";
        if (window.navigator.userAgent.indexOf("Windows NT 5.1") != -1) OSName = "Windows XP";
        if (window.navigator.userAgent.indexOf("Windows NT 5.0") != -1) OSName = "Windows 2000";
        if (window.navigator.userAgent.indexOf("Mac") != -1) OSName = "Mac/iOS";
        if (window.navigator.userAgent.indexOf("X11") != -1) OSName = "UNIX";
        if (window.navigator.userAgent.indexOf("Linux") != -1) OSName = "Linux";
        this.os = OSName;
        this.good = ["Linux","UNIX"].includes(OSName)
    }
}