import 'plugins/line_sg/line_sg.less';
import 'plugins/line_sg/line_sg_controller';
import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';
import lineSGTemplate from 'plugins/line_sg/line_sg.html';
import lineSGEditorTemplate from 'plugins/line_sg/line_sg_params.html';
import visTypes from 'ui/registry/vis_types';

visTypes.register(function LineSGProvider(Private, config) {
  let TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
  let Schemas = Private(VisSchemasProvider);

  return new TemplateVisType({
    name: 'line-sg',
    title: 'Line-sg',
    description: 'This plugin allows the creation of a view with several types of graphics on Kibana Version 4.2.2, 4.3.0, 4.4.0, 4.5.0',
    icon: 'fa-diamond',
    template: lineSGTemplate,
    params: {
      defaults: {
        configLine: {},
        configLine_threshold_data: '',
        configLine_threshold_value1: 80,
        configLine_threshold_color1: "#ffaa00",
        configLine_threshold_value2: 90,
        configLine_threshold_color2: "#ff0000",
        configLinegrouped: "none",
        configLine_xrotate: 0,
        configLine_autoscale: false
      },
      editor: lineSGEditorTemplate
    },
    schemas: new Schemas([
      {
        group: 'metrics',
        name: 'metric',
        title: 'Y-Axis',
        min: 1,
        aggFilter: '!std_dev',
        defaults: [
          { schema: 'metric', type: 'count' }
        ]
      },
      {
        group: 'buckets',
        name: 'segment',
        title: 'X-Axis',
        min: 0
        //aggFilter: ['terms','date_histogram','filters']
      }
    ])
  });
});

