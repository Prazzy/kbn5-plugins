import 'plugins/kibana-html-plugin/bower_components/ace-builds/src-min-noconflict/ace.js';
import 'plugins/kibana-html-plugin/bower_components/ace-builds/src-min-noconflict/mode-html.js';
import 'plugins/kibana-html-plugin/bower_components/ace-builds/src-min-noconflict/theme-monokai.js';
import 'plugins/kibana-html-plugin/bower_components/angular-ui-ace/ui-ace.min.js';
import 'plugins/kibana-html-plugin/html.less';
import 'plugins/kibana-html-plugin/htmlController';
import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';
import htmlTemplate from 'plugins/kibana-html-plugin/html.html';
import htmlEditorTemplate from 'plugins/kibana-html-plugin/htmlOptions.html';
import visTypes from 'ui/registry/vis_types';

visTypes.register(function HtmlVisProvider(Private, config) {
  var TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);

  return new TemplateVisType({
    name: 'html',
    title: 'Html widget',
    icon: 'fa-code',
    description: 'Useful for displaying html in dashboards.',
    template: htmlTemplate,
    params: {
      editor: htmlEditorTemplate
    },
    requiresSearch: false
  });
});
