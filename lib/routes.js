'use strict';

// register handlers
exports.register = function(server, middleware) {
    // clusters
    server.get('/:api_version/cluster/state', middleware.get_handler('cluster', 'state'), middleware.handle_response);
    server.delete('/:api_version/cluster', middleware.get_handler('cluster', 'delete'), middleware.handle_response);

    // applications
    server.get('/:api_version/applications', middleware.get_handler('applications', 'get'), middleware.handle_response);
    server.post('/:api_version/applications', middleware.get_handler('applications', 'create'), middleware.handle_response);

    // application
    server.get('/:api_version/applications/:application', middleware.get_handler('application', 'get'), middleware.handle_response);
    server.post('/:api_version/applications/:application', middleware.get_handler('application', 'create'), middleware.handle_response);
    server.put('/:api_version/applications/:application', middleware.get_handler('application', 'update'), middleware.handle_response);
    server.delete('/:api_version/applications/:application', middleware.get_handler('application', 'delete'), middleware.handle_response);
    server.get('/:api_version/applications/:application/containers', middleware.get_handler('application', 'get_containers'), middleware.handle_response);
    server.post('/:api_version/applications/:application/containers', middleware.get_handler('application', 'create_containers'), middleware.handle_response);
    server.delete('/:api_version/applications/:application/containers', middleware.get_handler('application', 'remove_containers'), middleware.handle_response);
    server.get('/:api_version/applications/:application/containers/:container', middleware.get_handler('application', 'get_container'), middleware.handle_response);
    server.delete('/:api_version/applications/:application/containers/:container', middleware.get_handler('application', 'remove_container'), middleware.handle_response);

    // hosts
    server.get('/:api_version/hosts', middleware.get_handler('hosts', 'get'), middleware.handle_response);

    // host
    server.get('/:api_version/hosts/:host', middleware.get_handler('host', 'get'), middleware.handle_response);
    server.put('/:api_version/hosts/:host', middleware.get_handler('host', 'update'), middleware.handle_response);
    server.delete('/:api_version/hosts/:host', middleware.get_handler('host', 'delete'), middleware.handle_response);

    // plugins
    server.get('/:api_version/plugins', middleware.get_handler('plugins', 'getAll'), middleware.handle_response);
    server.get('/:api_version/plugins/:plugin', middleware.get_handler('plugins', 'get'), middleware.handle_response);
    server.post('/:api_version/plugins/:plugin', middleware.get_handler('plugins', 'install'), middleware.handle_response);

    // variables
    server.get('/:api_version/variables', middleware.get_handler('variables', 'get'), middleware.handle_response);
    server.post('/:api_version/variables/:variable', middleware.get_handler('variable', 'create'), middleware.handle_response);
    server.get('/:api_version/variables/:variable', middleware.get_handler('variable', 'get'), middleware.handle_response);
    server.put('/:api_version/variables/:variable', middleware.get_handler('variable', 'update'), middleware.handle_response);
    server.delete('/:api_version/variables/:variable', middleware.get_handler('variable', 'delete'), middleware.handle_response);
};
