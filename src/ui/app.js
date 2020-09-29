import { PLATFORM } from "aurelia-framework";
require('./app.css');
require('bootstrap/dist/css/bootstrap.min.css');
import { Gateway } from './gateway'
import { inject } from 'aurelia-framework'
import {Redirect} from 'aurelia-router';

@inject(Gateway)
export class App {
  constructor(gw){
    this.gateway = gw
    gw.addLoggedInObserver((state)=>{
      console.log("Logged in state has changed")
      this.router.loggedin = state
    })

  }

  configureRouter(config, router) {
    this.router = router;
    let _this = this
    function step() {
      return step.run;
    }
    step.run = this.run(()=>{return this.router.loggedin})
    config.addAuthorizeStep(step);
    config.title = 'Connect 4';
    config.map([
      {
        route: [""],
        name: 'home',
        title: "Home",
        moduleId: PLATFORM.moduleName("views/home"),
        nav: true,
        settings: {
          visible: true
        }
      },
      {
        route: 'profile/:id?',
        name: 'profile',
        href:"#/profile/me",
        title: "Profile",
        moduleId: PLATFORM.moduleName("views/profile"),
        nav: true,
        settings: {
          auth: true,
          visible:true
        }
      },
      {
        route: 'games/:id',
        name: 'me',
        href:"#/games",
        title: "Play Game",
        moduleId: PLATFORM.moduleName("views/playgame"),
        nav: true,
        settings: {
          auth: true,
          visible:true
        }
      },
      {
        route: ['games'],
        name: 'games',
        title: "Select Game",
        moduleId: PLATFORM.moduleName("views/selectgame"),
        nav: true,

        settings: {
          auth: true,
          visible:false
        }
      },
      {
        route: 'login',
        name: 'login',
        title: "Login",
        nav: true,
        moduleId: PLATFORM.moduleName("views/login"),
        settings:{
          visible:true,
          auth: false
        }
      },
      {
        route: 'logout',
        name: 'logout',
        title: "Logout",
        nav: true,
        moduleId: PLATFORM.moduleName("views/logout"),
        settings:{
          visible:true,
          auth:true
        }
      },
      {
        route: 'resetpassword',
        name: 'resetpassword',
        title: "Password Reset",
        nav: true,
        moduleId: PLATFORM.moduleName("views/passwordreset"),
        settings:{
          visible:false,
          auth:false
        }
      }
    ]);
  }
  run(f) {
    return (navigationInstruction, next)=>{
    if (navigationInstruction.getAllInstructions().some(i => i.config.settings.auth)) {
      if (!f()) {
        return next.cancel(new Redirect('login'));
      }
    }

    return next();
  }
  }
}
