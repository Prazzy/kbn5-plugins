// Create an Angular module for this plugin
import _ from 'lodash';
import 'jquery';
import L from 'leaflet';
import uiModules from 'ui/modules';
import './bower_components/leaflet_js/leaflet.markercluster';
import './bower_components/leaflet_js/mq-map';
import './bower_components/leaflet_js/MarkerCluster.Default.css';
import FilterManagerProvider from 'ui/filter_manager';
import SearchSourceProvider from 'ui/courier/data_source/search_source';

const module = uiModules.get('kibana/kbn_leaflet', ['kibana']);
module.controller('KbnLeafletController', function ($scope, $element, $rootScope, $http, config, Private) {
  const filterManager = Private(FilterManagerProvider);
  const SearchSource = Private(SearchSourceProvider);

  //$scope.vis.params.beam.enabled = false;

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
      //$scope.chart.setSize(chart_width, chart_height);
      if (chart_height) $scope.height = chart_height;
  };

  $scope.$on('change:vis', function () {
      if (_.isUndefined($scope.chart)) return;
      _updateDimensions();
  });

  let _clearLayers = function () {
    let m = $scope.map1;
    for (let i in m._layers) {
      if (m._layers[i]._path != undefined) {
        try {
          m.removeLayer(m._layers[i]);
        }
        catch (e) {
          console.log("problem with " + e + m._layers[i]);
        }
      }
    }
  };

  let _removeMarkers = function () {
    if ($scope.firstMarkers) {
      $scope.firstMarkers.forEach(function (entry) {
        $scope.map1.removeLayer(entry);
      });
      $scope.firstMarkers = [];
    }

    if ($scope.lastMarkers) {
      $scope.lastMarkers.forEach(function (entry) {
        $scope.map1.removeLayer(entry);
      });
      $scope.lastMarkers = [];
    }

    if ($scope.switchMarkers) {
      $scope.switchMarkers.forEach(function (entry) {
        $scope.map1.removeLayer(entry);
      });
      $scope.switchMarkers = [];
    }

    if ($scope.offlineMarkers) {
      $scope.offlineMarkers.forEach(function (entry) {
        $scope.map1.removeLayer(entry);
      });
      $scope.offlineMarkers = [];
    }

    if ($scope.onlineMarkers) {
      $scope.onlineMarkers.forEach(function (entry) {
        $scope.map1.removeLayer(entry);
      });
      $scope.onlineMarkers = [];
    }

    if ($scope.polyList) {
      $scope.polyList.forEach(function (entry) {
        $scope.map1.removeLayer(entry);
      });
      $scope.polyList = [];
    }
  };

  let tealIcon, orangeIcon, yellowIcon, greenIcon, redIcon, airplaneIcon;
  let _mapIcons = function () {
    tealIcon = L.icon({
      iconUrl: '../plugins/kbn_leaflet/images/teal-dot2.png',
      iconAnchor: [10, 30]
    });

    orangeIcon = L.icon({
      iconUrl: '../plugins/kbn_leaflet/images/orange-dot2.png',
      iconAnchor: [10, 30]
    });

    yellowIcon = L.icon({
      iconUrl: '../plugins/kbn_leaflet/images/yellow-dot2.png',
      iconAnchor: [10, 30]
    });

    greenIcon = L.icon({
      iconUrl: '../plugins/kbn_leaflet/images/green-dot2.png',
      iconAnchor: [10, 30]
    });

    redIcon = L.icon({
      iconUrl: '../plugins/kbn_leaflet/images/red-dot3.png',
      iconAnchor: [10, 30]
    });

    airplaneIcon = L.icon({
      iconUrl: '../plugins/kbn_leaflet/images/airplane.png',
      iconAnchor: [10, 30],
    });
  };

  $scope.$watchMulti(['esResponse', 'vis.params'], function ([resp]) {
    // if no response
    if (!resp) return;

    let map_type = $scope.vis.params.map_type;
    let size = $scope.vis.params.size;
    let lat = $scope.vis.params.lat;
    let lng = $scope.vis.params.lng;
    let tooltip_fields = [];
    if ($scope.vis.params.tooltip) tooltip_fields = $scope.vis.params.tooltip.split(",");

    let mapSearchSource = new SearchSource();
    mapSearchSource.set('filter', mapSearchSource.getOwn('filter'));
    mapSearchSource.set('query', mapSearchSource.getOwn('query'));
    mapSearchSource.size(size);
    mapSearchSource.index($scope.vis.indexPattern);
    mapSearchSource.onResults().then(function onResults(searchResp) {
      if (typeof $scope.map1 === 'undefined') {
        $scope.map1 = new L.map('leaflet_' + $scope.$id, {
            scrollWheelZoom: true,
            //center: [40, -86],
            minZoom: 2,
            maxZoom: 18,
            noWrap: true,
            fadeAnimation: false,
            layers: MQ.mapLayer()
        });

        $scope.paths = {};
        $scope.markers = {};
        $scope.switchMarkers = [];
        $scope.offlineMarkers = [];
        $scope.onlineMarkers = [];
        $scope.firstMarkers = [];
        $scope.lastMarkers = [];
        $scope.polyList = [];
      }

      let map1 = $scope.map1;
      L.Icon.Default.imagePath = '../plugins/kbn_leaflet/images';

      //(function () {
      //    let control = new L.Control({position: 'topright'});
      //    control.onAdd = function (map1) {
      //        let azoom = L.DomUtil.create('a', 'resetzoom');
      //        azoom.innerHTML = "[Reset Zoom]";
      //        L.DomEvent
      //            .disableClickPropagation(azoom)
      //            .addListener(azoom, 'click', function () {
      //                map1.fitBounds([[-90, -220], [90, 220]])
      //                //map1.setView(map1.options.center, map1.options.zoom);
      //            }, azoom);
      //        return azoom;
      //    };
      //    return control;
      //}())
      //    .addTo(map1);

      let beams = [];
      if (map_type === "Marker Cluster") {
        try {
          if ($scope.map1 && $scope.markers.getLayers()) $scope.markers.clearLayers();
        } catch (e) {
        }
        let markers = new L.MarkerClusterGroup({maxClusterRadius: 100});
        let markerList = [];
        _.each(searchResp.hits.hits, function (hit, i) {
          let es_data = hit['_source'];
          let tooltip_text = "";
          _.each(tooltip_fields, function (field) {
              tooltip_text += field + " : " + es_data[field] + "<br />";
          });
          if (es_data[lat] && es_data[lng]) {   
            let marker = L.marker(new L.LatLng(es_data[lat], es_data[lng]), {
               title: es_data[lat] + "," + es_data[lng]
            });
            marker.bindPopup(tooltip_text, {
               maxWidth: 500
            });
            markerList.push(marker);
          } 
        });

        markers.addLayers(markerList);
        markers.addTo(map1);
        $scope.markers = markers;
        map1.fitBounds([[-90, -220], [90, 220]]);
      } else {
        _clearLayers();
        _removeMarkers();
        _mapIcons();

        _.each(searchResp.hits.hits, function (hit, i) {
          let es_src = hit['_source'];
          if (hit.beams) beams.push(hit.beams.split(','));
          let tooltip_text = "";
          _.each(tooltip_fields, function (field) {
              tooltip_text += field + " : " + es_src[field] + "<br />";
          });

          if (typeof es_src.data != 'undefined') {  
            let map_json_data = $.parseJSON(es_src.data);
            // switch markers
            _.each(map_json_data.switchmarkers, function (marker_i, i) {
                let tooltip_content = tooltip_text + marker_i.content;
                let switchMarker = L.marker([marker_i.latitude, marker_i.longitude], {icon: tealIcon}).addTo(map1);
                switchMarker.bindPopup(tooltip_content, {maxWidth: 500});
                $scope.switchMarkers.push(switchMarker);
            });

            // down markers
            _.each(map_json_data.downmarkers, function (marker_i, i) {
                let tooltip_content = tooltip_text + marker_i.content;
                let offlineMarker = L.marker([marker_i.latitude, marker_i.longitude], {icon: orangeIcon}).addTo(map1);
                offlineMarker.bindPopup(tooltip_content, {maxWidth: 500});
                $scope.offlineMarkers.push(offlineMarker);
            });

            // online markers
            _.each(map_json_data.offtoonmarkers, function (marker_i, i) {
                let tooltip_content = tooltip_text + marker_i.content;
                let onlineMarker = L.marker([marker_i.latitude, marker_i.longitude], {icon: yellowIcon}).addTo(map1);
                onlineMarker.bindPopup(tooltip_content, {maxWidth: 500});
                $scope.onlineMarkers.push(onlineMarker);
            });

            // first marker
            let firstMarker = L.marker([map_json_data.markers[0].latitude, map_json_data.markers[0].longitude], {icon: greenIcon}).addTo(map1);
            let tooltip_content = tooltip_text + map_json_data.markers[0].content;
            firstMarker.bindPopup(tooltip_content, {maxWidth: 500});
            $scope.firstMarkers.push(firstMarker);

            // last marker
            let lastMarker;
            if (es_src.InFlight) {
              lastMarker = L.marker([map_json_data.markers[map_json_data.markers.length - 1].latitude, 
                map_json_data.markers[map_json_data.markers.length - 1].longitude], { icon: airplaneIcon }).addTo(map1); 
            } else { 
              lastMarker = L.marker([map_json_data.markers[map_json_data.markers.length - 1].latitude, 
                map_json_data.markers[map_json_data.markers.length - 1].longitude], { icon: redIcon }).addTo(map1);
            }                        
            let marker_tooltip_content = tooltip_text + map_json_data.markers[map_json_data.markers.length - 1].content;
            lastMarker.bindPopup(marker_tooltip_content, {maxWidth: 500});
            $scope.lastMarkers.push(lastMarker);

            // polylines
            _.each(map_json_data.polylines, function (polyline, i) {
                let line = L.polyline(polyline.marker, {
                    color: polyline.color,
                    opacity: polyline.opacity,
                    weight: polyline.weight
                }).addTo(map1);
                $scope.polyList.push(line);
            });
          }
          map1.fitBounds([[-90, -220], [90, 220]]);
        });

        // Beam layers
        if ($scope.controlLayers) {
          $scope.map1.removeControl($scope.controlLayers);
          delete $scope.controlLayers;
        } 
        if ($scope.vis.params.beam_enabled) {
          // get beam names
          const kmlSourceIndexName = $scope.vis.params.beam.index;
          const beamNames = ["MTNPAC_AFR1_APS7",
                              "MTNPAC_AG1_T01",
                              "MTNPAC_APS6_T01",
                              "MTNPAC_BRW1_GE23SEP_NPH7NSEPV7N",
                              "MTNPAC_BRW2_GE23NP",
                              "MTNPAC_BRW2_GE23SWP",
                              "MTNPAC_BUR3_W2A_D2VH_F1VH_NET3",
                              "MTNPAC_COL1_IS14",
                              "MTNPAC_COL1_T11NCA",
                              "MTNPAC_DUB1_A5",
                              "MTNPAC_GE23SP_T01",
                              "MTNPAC_HKG2_SC2",
                              "MTNPAC_HOL8_T11N_K11BVH_K35VH_NET11",
                              "MTNPAC_IS15_T01"]; 
          $scope.controlLayers = L.control.layers(null, [], { collapsed: true }).addTo(map1);
          const highlightStyle = {
              weight: 2,
              opacity: 0.6
          };

          // get co-ordinates
          _.each(beamNames, function (beam, i) {
            let params = {
              index: kmlSourceIndexName,
              beamName: beam
            };

            $http.post('../api/kbn_leaflet/geojson', params)
            .then(function (resp) {
              if (resp.data) {
                let geojson_data = JSON.parse(resp.data[0]._source.GeoJSON);
                let beamLayer = L.geoJson(geojson_data, {
                  onEachFeature: function (feature, layer) {
                    layer.bindPopup(feature.properties.name);
                    layer.on("mouseover", function (e) {
                      layer.setStyle(highlightStyle);
                    });               
                  },
                  weight: 1
                });
                map1.addLayer(beamLayer);
                $scope.controlLayers.addOverlay(beamLayer, geojson_data.properties.name);
              }
            });
          }); 
        } // Beam layers
      }
    });
    mapSearchSource.fetchQueued();

  });

  _updateDimensions();
  $element.trigger('renderComplete');

});
