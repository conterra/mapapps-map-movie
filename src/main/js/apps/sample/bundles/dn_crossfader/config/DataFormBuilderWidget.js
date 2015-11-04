/*
 * Copyright (C) 2015 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define(["dojo/_base/declare", "dojo/_base/lang", "wizard/DataFormBuilderWidget", "dojo/_base/array"],
        function(declare, d_lang, DataFormBuilderWidget, d_array) {
            return declare([DataFormBuilderWidget], {
                updateConfig: function(dataForm) {
                    this._hideErrorMessages();
                    var nodes = [];
                    var services = [];
                    for (var i = 1; i < 6; i++) {
                        var layer = dataForm["layer" + i];
                        var url = layer.url;
                        if (!url || !url.length) {
                            break;
                        }
                        var config = this._getServiceConfig(layer, "" + i);
                        services.push(config);
                        nodes.push(this._getMapModelNode(config, layer.thumbnail, i === 1));
                    }
                    var serviceConfig = {
                        _knownServices: {
                            services: services
                        }
                    };
                    var mapModelConfig = {
                        _configData: {
                            maps: [{
                                    id: "default",
                                    glass_pane: [],
                                    operationalLayer: [],
                                    baseLayer: nodes
                                }]
                        }
                    };
                    var mrrConfig = this.getComponentConfig("map-MappingResourceRegistryFactory", "map");
                    mrrConfig.update(serviceConfig);
                    var mmConfig = this.getComponentConfig("map-MapModelFactory", "map");
                    mmConfig.update(mapModelConfig);
                    var cfConfig = this.getComponentConfig("crossfader-CrossFaderController", "crossfader");
                    cfConfig.update({
                        stopOnClose: dataForm.stopOnClose,
                        resetOnClose: dataForm.resetOnClose,
                        transitionTime: dataForm.transitionTime
                    });
                },
                _getMapModelNode: function(serviceNode, thumbnail, enabled) {
                    var id = serviceNode.id;
                    var title = serviceNode.title;
                    return {
                        id: id,
                        title: title,
                        enabled: !!enabled,
                        service: id,
                        layers: ["*"],
                        category: {
                            title: title,
                            imgUrl: thumbnail
                        }
                    };
                },
                _getServiceConfig: function(layer, id) {
                    var title = layer.title;
                    var url = layer.url;
                    var layerId = url.substring(url.lastIndexOf("/") + 1);
                    url = url.substring(0, url.lastIndexOf("/"));
                    var id = id || url;
                    return {
                        id: id,
                        title: title,
                        url: url,
                        type: layer.type,
                        layers: {
                            id: layerId
                        }
                    };
                },
                _registerBinding: function(dataFormWidget, defaultProperties) {
                    defaultProperties = d_lang.clone(defaultProperties || {});
                    var mapModelProperties = this.getComponentProperties("map-MapModelFactory", "map");
                    var baseLayer = mapModelProperties._configData.maps[0].baseLayer;
                    var mrrProperties = this.getComponentProperties("map-MappingResourceRegistryFactory", "map");
                    var services = mrrProperties = mrrProperties._knownServices.services;
                    var cfProperties = this.getComponentProperties("crossfader-CrossFaderController", "crossfader");

                    var layers = {};
                    d_array.forEach(baseLayer, function(layer, index) {
                        var service = d_array.filter(services, function(service) {
                            return service.id === layer.service;
                        })[0];
                        var url = service.url + "/" + service.layers[0].id;
                        var imageUrl = layer.category ? layer.category.imgUrl : "";
                        var layer = {
                            title: layer.title,
                            thumbnail: imageUrl,
                            url: url,
                            type: service.type
                        };
                        layers["layer" + (index + 1)] = layer;
                    });

                    var props = d_lang.mixin(defaultProperties, cfProperties, layers);
                    var dfService = this.dataformService;
                    var binding = dfService.createBinding("object", {
                        data: props
                    });
                    dataFormWidget.set("dataBinding", binding);
                    var that = this;
                    binding.watch("*", function() {
                        var config = binding.data;
                        that.fireConfigChangeEvent(config);
                    });
                    return binding;
                },
                getComponentConfig: function(pid, bid) {
                    return this.configAdminService.getConfiguration(pid, bid);
                },
                getComponentProperties: function(pid, bid) {
                    var config = this.configAdminService.getConfiguration(pid, bid);
                    return config.get("properties") || {};
                }
            });
        });