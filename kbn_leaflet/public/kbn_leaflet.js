//css
import 'plugins/kbn_leaflet/kbn_leaflet.css';
// Include the angular controller
import 'plugins/kbn_leaflet/kbn_leaflet_controller';
import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';
import leafletTemplate from 'plugins/kbn_leaflet/kbn_leaflet.html';
import leafletEditorTemplate from 'plugins/kbn_leaflet/kbn_leaflet_editor.html';
import visTypes from 'ui/registry/vis_types';

visTypes.register(function KbnLeafletProvider(Private, config) {
  const TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
  const Schemas = Private(VisSchemasProvider);
  const supports = require('ui/utils/supports');

  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return new TemplateVisType({
    name: 'kbn_leaflet',
    title: 'Leaflet Plugin',
    icon: 'fa fa-fw fa-map-marker',
    description: 'Leaflet Plugin',
    template: leafletTemplate,
    params: {
			editor: leafletEditorTemplate, // Use this HTML as an options editor for this vis
			defaults: { // Set default values for paramters (that can be configured in the editor)
        size: 100,
        map_type: 'Marker Cluster'
			},
      canDesaturate: !supports.cssFilters
		},
    implementsRenderComplete: true,
    schemas: new Schemas([
      {
        group: 'metrics',
        name: 'metric',
        title: 'Value',
        min: 0,
        max: 0,
        aggFilter: ['count', 'avg', 'sum', 'min', 'max', 'cardinality'],
        defaults: [
          { schema: 'metric', type: 'count' }
        ]
      },
      {
        group: 'buckets',
        name: 'segment',
        title: 'Geo Coordinates',
        aggFilter: 'geohash_grid',
        min: 0,
        max: 0
      }
    ])
  });
});