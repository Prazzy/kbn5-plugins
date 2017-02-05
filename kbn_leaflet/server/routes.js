

module.exports = function (server) {
    const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');

	server.route({
    path: '/api/kbn_leaflet/geojson',
    method: 'POST',
    handler(req, reply) {
    	let searchReq = {
    		index: req.payload.index,
    		body: {
					query: {
						bool: {
					  	must: {
					    	term: {
					      	BeamName: req.payload.beamName
					    	}
					  	}
						}
					}
				}
			};

    	callWithRequest(req, 'search', searchReq)
    	.then(function (response) {
        reply(response.hits.hits);
      }).catch(function (resp) {
        console.error("Error while fetching beams", resp);
        reply([]);  
      });;
    }
  });
};