import 'jquery';
import uiModules from 'ui/modules';
import Highcharts from './bower_components/highcharts';
// if (typeof Highcharts === "undefined") {
//   import Highcharts from './bower_components/highcharts';
// }

const module = uiModules.get('kibana/kbn_highcharts_pie', ['kibana']);
module.controller('KbnHighchartsPieController', function ($scope, $element, $rootScope, Private) {
  let filterManager = Private(require('ui/filter_manager'));

  $scope.filter = function (item) {
    // Add a new filter via the filter manager
    filterManager.add(
      // The field to filter for, we can get it from the config
      $scope.vis.aggs.bySchemaName['segment'][0].params.field,
      // The value to filter for, we will read out the bucket key from the tag
      item,
      // Whether the filter is negated. If you want to create a negated filter pass '-' here
      null,
      // The index pattern for the filter
      $scope.vis.indexPattern.title
    );
  };

  let chart_width, chart_height;

  let _updateDimensions = function () {
    let delta = 18;
    let width = $element.parent().width();
    let height = $element.parent().height();

    if (width) {
      if (width > delta) {
        chart_width = width - delta;
      } else {
        chart_width = width
      }
    }

    if (height) {
      if (height > delta) {
        chart_height = height - delta;
      } else {
        chart_height = height
      }
    }
    $scope.chart.setSize(chart_width, chart_height);
  };

  $scope.$on('change:vis', function () {
    if (_.isUndefined($scope.chart)) return;
    _updateDimensions();
  });

  $scope.$watchMulti(['esResponse', 'vis.params'], function ([resp]) {
    if (!resp || !resp.aggregations) {
        return;
    }

    // Retrieve the id of the configured aggregation
    let aggId = $scope.vis.aggs.bySchemaName['segment'][0].id;
    // Retrieve the metrics aggregation configured
    let metricsAgg = $scope.vis.aggs.bySchemaName['metric'][0];
    // Get the buckets of that aggregation
    let buckets = resp.aggregations[aggId].buckets;
    let categories = [];
    let results = buckets.map(function (bucket) {
      // Use the getValue function of the aggregation to get the value of a bucket
      let value = metricsAgg.getValue(bucket);
      categories.push(bucket.key);
      return [bucket.key, value];
      //return {name: bucket.key,
      //        y: value,
      //        x: bucket.key}
    });

    let hc_options = {
      chart: {
        renderTo: 'highcharts_pie_' + $scope.$id,
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false
      },
      credits: {
        enabled: false
      },
      series: [{
        type: 'pie',
        data: results,
        point: {
          events: {
            click: function (event) {
              $scope.filter(event.point.name);
            }
          }
        }
      }]
    };

    if (typeof $scope.vis.params.hc_options == 'string' && $scope.vis.params.hc_options.trim().length > 0) {
      let additional_options = JSON.parse($scope.vis.params.hc_options);
      hc_options = _.merge(hc_options, additional_options);
    }
    $scope.chart = new Highcharts.Chart(hc_options);

    _updateDimensions();
  });
});

