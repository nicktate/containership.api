'use strict';

const _ = require('lodash');
const async = require('async');

module.exports = {
    // get all plugins
    getAll(req, res, next) {
        const core = req.core;

        return core.cluster.myriad.persistence.keys(core.constants.myriad.PLUGINS, (err, plugin_keys) => {
            if(err) {
                res.stash.code = 500;
                return next();
            }

            return async.map(plugin_keys, (plugin_name, fn) => {
                return core.cluster.myriad.persistence.get(plugin_name, (err, plugin) => {
                    if(err) {
                        return fn(err);
                    }

                    try {
                        plugin = JSON.parse(plugin);
                    } catch(err) {
                        return fn(err);
                    }

                    return fn(null, plugin);
                });
            }, (err, plugins) => {
                if(err) {
                    res.stash.code = 500;
                    return next();
                }

                res.stash.code = 200;
                res.stash.body = plugins;
                return next();
            });
        });
    },

    // get single plugin info
    get(req, res, next) {
        const core = req.core;

        return core.cluster.myriad.persistence.get(req.params.plugin, (err, plugin) => {
            if(err) {
                res.stash.code = 500;
                return next();
            }

            if(!plugin) {
                res.stash.code = 404;
                return next();
            }

            try {
                plugin = JSON.parse(plugin);
            } catch(err) {
                res.stash.code = 500;
                return next();
            }

            res.stash.code = 200;
            res.stash.body = plugin;
            return next();
        });
    },

    // install plugin on cluster
    install(req, res, next) {
        const leader = core.cluster.legiond.get_controlling_leader();

        return core.cluster.legiond.send({
            event: core.constants.events.PLUGIN_INSTALL,
            data: {
                // put in plugin info
            }
        }, leader);

        res.stash.code = 202;
        return next();
    }
};
