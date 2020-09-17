import { PLATFORM } from "aurelia-framework";
require('bootstrap/dist/css/bootstrap.min.css');
export class App {
  configureRouter(config, router) {
    this.router = router;
    config.title = 'Connect 4';
    config.map([
      { route: [ ""],       name: 'Home',       moduleId: PLATFORM.moduleName("views/home") },
      { route: 'login',       name: 'Login',       moduleId: PLATFORM.moduleName("views/login") }
    ]);
  }
}