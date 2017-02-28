'use strict';

const _ = require('lodash');
const async = require('async');
const request = require('request');

module.exports = {

    // GET v1/plugins
    // POST v1/plugins/:plugin
    // {
    //   "version": "^4.0"
    //   // git or npm
    // }
    //
    // DELETE v1/plugins/:plugin


    // get plugins
    get(req, res, next) {
        const core = req.core;

        res.stash = {
            body: {},
            code: 200
        };

        return core.cluster.myriad.persistence.keys(core.constants.myriad.PLUGINS, (err, plugin_names) => {
            if(err) {
                res.stash.code = 500;
                return next();
            }

            return async.each(plugin_names, (plugin_name, fn) => {
                return core.cluster.myriad.persistence.get(plugin_name, (err, plugin) => {
                    if(err) {
                        res.stash.code = 500;
                        return fn();
                    }

                    try {
                        plugin = JSON.parse(plugin);
                        res.stash.body[plugin.name] = plugin;

                        return fn();
                    } catch(err) {
                        res.stash.code = 500;
                        return fn();
                    }
                });
            }, next);
        });
    },

    // install plugin
    create(req, res, next) {
        const core = req.core;

        if (_.isUndefined(req.body)) {
            res.stash.code = 400;
            return next();
        }

        const containership_version = core.options.version;

        console.info(`Containership Version: ${containership_version}`);


        // todo : if specific version is passed, validate version works with current containership version

        return request({
            method: 'GET',
            baseUrl: 'https://plugin-registry.containereship.io', // todo : remove hard-coded url
            uri: `/containership/${containership_version}/plugins/${req.params.plugin}`
        }, (err, response, body) => {
            if (err) {
                res.stash.code = 500;
                return next();
            }

            if (response.statusCode !== 200) {
                res.stash.code = 400;
                return next();
            }

            body = JSON.parse(body);

            console.log('the plugin body');
            console.log(body);

            return core.cluster.myriad.persistence.set([core.constants.myriad.PLUGINS_PREFIX, req.params.plugin].join(core.constants.myriad.DELIMITER), body, (err) => {
                if (err) {
                    res.stash.code = 500;
                    return next();
                }

                res.stash.code = 201;
                return next();
            });
        });
    },

    delete(req, res, next) {
        const core = req.core;

        return core.cluster.myriad.persistence.delete([core.constants.myriad.PLUGINS_PREFIX, req.params.plugin].join(core.constants.myriad.DELIMITER), (err) => {
            // todo: what if the plugin did not exist to begin with
            if (err) {
                res.stash.code = 500;
                return next();
            }

            res.stash.code = 201;
            return next();
        });
    }
};
