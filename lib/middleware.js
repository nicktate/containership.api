var fs = require("fs");
var _ = require("lodash");

module.exports = {

    initialize: function(core){
        var handlers = {};
        var available_versions = fs.readdirSync([__dirname, "..", "handlers"].join("/"));
        _.each(available_versions, function(version){
            handlers[version] = {};
            var available_handlers = fs.readdirSync([__dirname, "..", "handlers", version].join("/"));
            _.each(available_handlers, function(handler){
                var handler_name = handler.split(".")[0];
                handlers[version][handler_name] = require([__dirname, "..", "handlers", version, handler].join("/"))(core);
            });
        });

        var methods = {
            // ensure auth
            authed: function(req, res, next){
                return next();
            },

            // allow cross origin requests
            allow_cors: function(req, res, next){
                var methods = [ "GET", "PUT", "POST", "DELETE" ];

                var headers = [
                    "Content-Type",
                    "Accept-Encoding",
                    "Authorization",
                    "Cache-Control",
                    "X-Containership-Cloud-Tier-Required",
                    "X-ContainerShip-Cloud-Response-Time"
                ];

                // if this is a logs proxy request, must set access-control-allow-credentials for event source flow
                if (req.path.indexOf('proxy') >= 0) {
                    const proxyUrl = req.query.url || req.body.url;
                    const proxyMethod = req.query.method || req.body.method;

                    if (proxyUrl && proxyUrl.indexOf('logs') >= 0 && proxyMethod === 'GET') {
                        res.setHeader("access-control-allow-credentials", true);
                    }
                }

                const allowed_origins = [
                    'http://localhost:8080',
                    'https://beta-cloud.containership.io',
                    'https://cloud.containership.io'
                ];

                let origin = req.headers.origin;
                res.setHeader("access-control-allow-origin", allowed_origins.indexOf(origin) >= 0 ? origin : false);
                res.setHeader("access-control-allow-methods", methods.join(","));
                res.setHeader("access-control-allow-headers", headers.join(","));

                if(req.method == "OPTIONS") {
                    res.stash.code = 200;
                    methods.handle_response(req, res, next);
                } else {
                    return next();
                }
            },

            // redirect to controlling leader
            redirect_to_controlling_leader: function(req, res, next){
                if(core.cluster.praetor.is_controlling_leader()) {
                    return next();
                } else if('false' === req.headers['X-Containership-Api-Redirect']) {
                    return next();
                } else {
                    var controlling_leader = core.cluster.praetor.get_controlling_leader();

                    if(_.isUndefined(controlling_leader)){
                        res.stash.code = 503;
                        methods.handle_response(req, res, next);
                    }
                    else{
                        var port = req.headers.host.split(":");
                        if(port.length > 1)
                            port = port[1];
                        else
                            port = 80;

                        var scope = core.options.legiond.network.public ? "public" : "private";

                        var location = [req.protocol, "://", controlling_leader.address[scope], ":", port, req.url].join("");
                        res.redirect(307, location);
                    }
                }
            },

            // ensure client accepts json
            json_request: function(req, res, next){
                if(req.accepts("application/json"))
                    return next();

                res.stash.code = 406;
                methods.handle_response(req, res, next);
            },

            // init response
            init_response: function(req, res, next){
                res.stash = {};
                res.response_start = new Date();
                return next();
            },

            // get appropriate handler
            get_handler: function(handler, method){
                return function(req, res, next){
                    if(!_.contains(_.keys(handlers), req.params.api_version))
                        methods.handle_response(req, res, next);
                    else if(!_.has(handlers[req.params.api_version], handler))
                        methods.handle_response(req, res, next);
                    else if(!_.has(handlers[req.params.api_version][handler], method))
                        methods.handle_response(req, res, next);
                    else
                        handlers[req.params.api_version][handler][method](req, res, next);
                }
            },

            // respond to client
            handle_response: function(req, res, next){
                res.setHeader("X-Containership-Response-Time", new Date() - res.response_start);

                res.stash = _.defaults(res.stash, {
                    code: 404
                });

                if(_.has(res.stash, "body"))
                    res.status(res.stash.code).json(res.stash.body);
                else
                    res.sendStatus(res.stash.code);

                core.loggers["containership.api"].log("debug", [req.ip, "-", ["HTTP", req.httpVersion].join("/"), req.method, req.url, "-", res.stash.code].join(" "));
                return next();
            },

            // event emitter
            event_emitter: function(req, res, next){
                if(req && req.route && req.route.path){
                    core.api.server.server.emit(req.route.path, {
                        req: req,
                        res: res
                    });
                }
            }

        }

        return methods;

    }

}
