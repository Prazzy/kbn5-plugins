//css
import 'plugins/kbn_highcharts_pie/kbn_highcharts_pie.css';
// Include the angular controller
import 'plugins/kbn_highcharts_pie/kbn_highcharts_pie_controller';
import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';
import highchartsPieTemplate from 'plugins/kbn_highcharts_pie/kbn_highcharts_pie.html';
import highchartsPieEditorTemplate from 'plugins/kbn_highcharts_pie/kbn_highcharts_pie_editor.html';
import visTypes from 'ui/registry/vis_types';

visTypes.register(function KbnHighchartsPieProvider(Private, config) {
  var TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
  var Schemas = Private(VisSchemasProvider);

  return new TemplateVisType({
    name: 'kbn_highcharts_pie',
    title: 'Highcharts Pie Chart',
    icon: 'fa-pie-chart',
    description: 'Highcharts Pie Chart',
    template: highchartsPieTemplate,
    params: {
      editor: highchartsPieEditorTemplate, // Use this HTML as an options editor for this vis
      defaults: { // Set default values for paramters (that can be configured in the editor)
        shareYAxis: true,
        hc_options: `{
        "title": {
          "text": ""
        },
        "tooltip": {
          "pointFormat": "<b>{point.percentage:.1f}%</b><br><b>{point.y:.0f}</b>"
        },
        "plotOptions": {
          "pie": {
            "allowPointSelect": "true",
            "cursor": "pointer",
            "dataLabels": {
              "enabled": "true",
              "format": "<b>{point.name}</b>: {point.percentage:.1f} %",
              "style": {
                "color": "black"
              }
            },
          "showInLegend": "true"
          }
        }
      }`
      }
    },
    hierarchicalData: true,
    schemas: new Schemas([
      {
        group: 'metrics',
        name: 'metric',
        title: 'Slice Size',
        min: 1,
        max: 1,
        aggFilter: ['sum', 'count', 'cardinality'],
        defaults: [
          {schema: 'metric', type: 'count'}
        ]
      },
      {
        group: 'buckets',
        name: 'segment',
        icon: 'fa fa-scissors',
        title: 'Split Slices',
        min: 0,
        max: 2,
        aggFilter: '!geohash_grid'
      },
      {
        group: 'buckets',
        name: 'split',
        icon: 'fa fa-th',
        title: 'Split Chart',
        mustBeFirst: true,
        min: 0,
        max: 1,
        aggFilter: '!geohash_grid'
      }
    ])
  });
});
