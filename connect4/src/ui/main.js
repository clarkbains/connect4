import * as environment from './config/environment.json';
import {PLATFORM} from 'aurelia-pal';
import 'regenerator-runtime/runtime'
export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName('resources/index'))
    .plugin(PLATFORM.moduleName('aurelia-plugins-notifier'), config => {
      config.options({
        insert: true, // whether or not to insert new notifications as a stack or replace the latest one, default is true
        position: 'top-right', // the position on the page where to show the notifications, default is 'top-right'
        timeout: 3000, // the TTL of the notification, default is 5000
        type: 'success' // the default style of the notification, default is 'info'
      });
    });
  aurelia.use.developmentLogging(environment.debug ? 'debug' : 'warn');

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
