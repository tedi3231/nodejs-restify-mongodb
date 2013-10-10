
/**
 * Module dependencies.
 */

var restify = require('restify')
   , mongoose = require('mongoose')
   // , toobusy = require('toobusy')
   , clientSessions = require("client-sessions")
   , longjohn = require("longjohn");


module.exports = function (app, config, sessionKey) {

   longjohn.async_trace_limit = 5;  // defaults to 10
   longjohn.empty_frame = 'ASYNC CALLBACK';

   app.use(restify.acceptParser(app.acceptable));
   app.use(restify.authorizationParser());
   app.use(restify.dateParser());
   app.use(restify.queryParser());
   app.use(restify.jsonp());
   app.use(restify.gzipResponse());
   app.use(restify.bodyParser());


    // send a 503 if the server is too busy
    /* Would like to use this, having trouble with npm module on one of my machines
    app.use(function(req, res, next) {
      if (toobusy()) res.send(503, "I'm busy right now, sorry.");
      else next();
    });
    */

   app.use(clientSessions({
     cookieName: 'session'    // defaults to session_state
     , secret: sessionKey
     , duration: config.session_timeout // defaults to 20 minutes, in ms
     // refresh every access
     , path: '/'
     , httpOnly: true // defaults to true
     , secure: false   // defaults to false
     , cookie: {
         maxAge: config.session_timeout
     }
   }));

    app.use(restify.throttle({
      burst: 100,
      rate: 50,
      ip: true,
      overrides: {
        '192.168.1.1': {
           rate: 0,        // unlimited
           burst: 0
         }
      }
    }));
   app.use(restify.conditionalRequest());
}


