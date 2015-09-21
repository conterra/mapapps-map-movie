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
define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/aspect",
    "ct/array",
    "ct/request",
    "ct/_when",
    "ct/Stateful",
    "ct/_Connect",
    "ct/mapping/mapcontent/ServiceTypes",
    "dijit/Tooltip",
    "./ImageMenuItem"
],
        function (declare, d_array, d_lang, aspect, ct_array, ct_request, ct_when, Stateful, Connect, ServiceTypes, Tooltip, ImageMenuItem) {
            return declare([Stateful, Connect], {
                fetchBaselayerCapabilitiesOnStartup: true,
                transitionTime: 2000,
                interval: 100,
                forward: true,
                stopOnClose: true,
                resetOnClose: true,
                //Events
                pauseEvent: null,
                startEvent: null,
                resetEvent: null,
                changeEvent: null,
                sliderEvent: null,
                constructor: function () {

                },
                activate: function () {

                    this.imageSelector = this.crossFader.imageSelector;
                    this.crossFaderBar = this.crossFader.crossFaderBar;

                    this.crossFaderBar.stopOnClose = this.stopOnClose;
                    this.crossFaderBar.resetOnClose = this.resetOnClose;

                    this._createSelectionItems();

                    // Click on first item so that overlay("unselected") is deactivated for first item
                    this._onItemClick(this._items[0]);

                    // Additional call if bundle has been changed by wizard and window was opened
                    this.imageSelector.resize();

                    if (this.imageSelector.getChildren().length === 0) {
                        console.debug("There are no layers");
                    }

                    this.connect("menu", this.imageSelector, "onItemClick", "_onItemClick");

                    this.pauseEvent = this.crossFaderBar.on("pause", d_lang.hitch(this, this._onPause));
                    this.startEvent = this.crossFaderBar.on("start", d_lang.hitch(this, this._onStart));
                    this.resetEvent = this.crossFaderBar.on("reset", d_lang.hitch(this, this._onReset));
                    this.changeEvent = this.crossFaderBar.on("changeDirection", d_lang.hitch(this, this._onChangeDirection));
                    this.sliderEvent = this.crossFaderBar.on("sliderChange", d_lang.hitch(this, this._onSliderValueChange));

                    if (this.fetchBaselayerCapabilitiesOnStartup) {

                        var servicenodes = this.mapModel.getServiceNodes(this.root);

                        window.capabilitiesMap = window.capabilitiesMap || {};

                        d_array.forEach(servicenodes, function (service) {
                            var s = service.service;
                            //check if we can and should fetch the capabilities
                            if (s.serviceType === ServiceTypes.WMTS && !window.capabilitiesMap[s.serviceUrl]) {
                                window.capabilitiesMap[s.serviceUrl] = true;
                                //esri api wants text...
                                ct_when(ct_request.request({
                                    handleAs: "text",
                                    url: s.serviceUrl + "?SERVICE=WMTS&REQUEST=GetCapabilities&VERSION=1.0.0"
                                }), function (resp) {

                                    window.capabilitiesMap[s.serviceUrl] = resp;

                                }, function (err) {
                                    console.error(err);
                                    delete window.capabilitiesMap[s.serviceUrl];
                                }, this);
                            }

                        }, this);
                    }

                    this.mapModel.fireModelNodeStateChanged({
                        source: this
                    });
                },
                _createSelectionItems: function () {
                    if (!this.mapModel) {
                        return;
                    }
                    var layers = this.layers = this.mapModel.getBaseLayer().get("children");
                    this._items = [];

                    // create imageMenuItems
                    d_array.forEach(layers, function (bl) {

                        var label;
                        if (bl.title === undefined || bl.title === "") {
                            bl.title = bl.id;
                        }

                        label = bl.title;

                        if (bl.title === undefined || bl.title === "") {
                            bl.title = bl.id;
                        }

                        var item = new ImageMenuItem({
                            label: label,
                            value: bl.id,
                            'class': bl.id,
                            index: this._items.length,
                            style: "font-weight: bold"
                        });

                        var tooltip = bl.title;

                        tooltip = new Tooltip({
                            connectId: [item.domNode],
                            label: tooltip
                        });

                        aspect.before(item, "destroy", function () {
                            tooltip.destroy();
                        });

                        if (bl.category === undefined) {
                            var category = new Object();
                            category.imgUrl = "";
                            bl.category = category;
                        }
                        var url = bl.category.imgUrl || bl.service.serviceUrl + "/info/thumbnail"

                        item.set("iconUrl", url);

                        this._items.push(item);

                        this.imageSelector.addChild(item);

                    }, this);

                    // prepare slider
                    this.crossFaderBar.set("minimum", 0);
                    this.crossFaderBar.set("maximum", this._items.length);
                    this.crossFaderBar.set("value", 0.5);

                },
                _onStart: function () {
                    var tansitiontime = this.transitionTime || 4000;
                    var step = 1 / (tansitiontime / this.interval);

                    // Forward
                    if (this.forward) {
                        this.intervalTimer = setInterval(d_lang.hitch(this, function () {

                            var newval = this.crossFaderBar.get("value") + step;
                            if (newval < this.crossFaderBar.get("maximum")) {
                                this.crossFaderBar.set("value", newval);
                            } else {
                                this.crossFaderBar.set("value", this.crossFaderBar.get("minimum"));
                            }

                        }), this.interval);

                        // Reverse
                    } else {
                        this.intervalTimer = setInterval(d_lang.hitch(this, function () {

                            var newval = this.crossFaderBar.get("value") - step;
                            if (newval > this.crossFaderBar.get("minimum")) {
                                this.crossFaderBar.set("value", newval);
                            } else {
                                this.crossFaderBar.set("value", this.crossFaderBar.get("maximum"));
                            }

                        }), this.interval);
                    }
                },
                _onReset: function () {

                    if (this.forward) {
                        this.crossFaderBar.set("value", 0.5);
                    } else {
                        this.crossFaderBar.set("value", this._items.length - 0.5);
                    }
                },
                _onChangeDirection: function () {

                    this.forward = !this.forward;

                },
                _onModelStructureChange: function () {

                    this.imageSelector.clear();
                    this._createSelectionItems();
                    this.crossFader.resize();

                },
                _onPause: function () {
                    clearInterval(this.intervalTimer);
                },
                _onItemClick: function (item) {

                    this.crossFaderBar.set("value", item.index + 0.5);
                    d_array.forEach(this.layers, function (layer) {
                        var idx = this._findMenuIdxForID(layer.id);
                        if (idx !== item.index) {
                            this.imageSelector.getChildren()[idx].set("unselected", true);
                        }
                    }, this);
                    this.imageSelector.getChildren()[item.index].set("unselected", false);
                },
                _findMenuIdxForID: function (id) {
                    return ct_array.arrayFirstIndexOf(this._items, {value: id});
                },
                _onModelNodeStateChange: function () {

                    if (this.imageSelector) {


                        var layers = ct_array.arraySearch(this.layers, {
                            enabled: true
                        });
                        if (layers.length === 2) {

                            var op1 = this._getAttributeFromLayer(layers[0], "opacity"),
                                    op2 = this._getAttributeFromLayer(layers[1], "opacity");
                            var current;
                            var last;
                            if (op1 > op2) {
                                current = layers[0];
                                last = layers[1];
                            } else {
                                current = layers[1];
                                last = layers[0];
                            }

                            var currentIdx = this._findMenuIdxForID(current.id);
                            var lastIdx = this._findMenuIdxForID(last.id);

                            this.imageSelector.getChildren()[currentIdx].set("unselected", false);
                            this.imageSelector.getChildren()[lastIdx].set("unselected", true);

                        } else {
                            console.debug("too many/less layers", layers);
                        }
                    }

                },
                _onSliderValueChange: function (evt) {

                    var value = Math.round(evt.value * 100) / 100;

                    // smooth transition if slider reaches end/start
                    if (value === this.layers.length) {
                        value = value - 0.01;
                    }

                    d_array.forEach(this.layers, function (bl) {
                        bl.set("enabled", false);
                    });

                    var indexLeft = Math.floor(value - 0.5);
                    var indexRight = Math.floor(value);
                    if (indexLeft < 0) {
                        indexLeft = this.layers.length - 1;
                    }
                    if (indexLeft === indexRight) {
                        if (indexRight === this.layers.length - 1)
                            indexRight = 0;
                        else {
                            indexRight++;
                        }
                    }

                    var leftLayer = this.layers[indexLeft];
                    var rightLayer = this.layers[indexRight];

                    var raise = function (x, map) {
                        var f = ((map * -100) + 50 + (x * 100)) / 100;
                        if (f < 0 || f > 1) {
                            return 0;
                        }
                        return f;
                    };
                    var fall = function (x, map) {
                        var f = ((map * 100) + 150 - (x * 100)) / 100;
                        if (f < 0 || f > 1) {
                            return 0;
                        }
                        return f;
                    };

                    var opacityR, opacityL;
                    var isLeftRaise;

                    //check what function (raise or fall) we need for left value
                    isLeftRaise = (value - indexLeft) > 0.5 ? false : true;

                    // special case: left ist last and right ist first
                    if (indexLeft === (this.layers.length - 1) && value < 0.5) {
                        isLeftRaise = false;
                    }

                    if (isLeftRaise) {
                        opacityL = raise(value, indexLeft);
                        opacityR = fall(value, indexRight);

                    } else {
                        // between full last and end of bar
                        if (indexRight === 0 && value > 0.5) {
                            var newvalue = value - (this.layers.length);
                            opacityL = fall(value, indexLeft);
                            opacityR = raise(newvalue, indexRight);

                            // between start of bar and full first
                        } else if (indexRight === 0 && value < 0.5) {
                            var newvalue = value + (this.layers.length);
                            opacityL = fall(newvalue, indexLeft);
                            opacityR = raise(value, indexRight);

                        } else {
                            opacityL = fall(value, indexLeft);
                            opacityR = raise(value, indexRight);
                        }

                    }

                    if (leftLayer) {
                        this._setAttributesOnLayer(leftLayer, opacityL);
                    }
                    if (rightLayer) {
                        this._setAttributesOnLayer(rightLayer, opacityR);
                    }

                    if (!this._timer) {

                        this._timer = setTimeout(d_lang.hitch(this, function () {

                            this.mapModel.fireModelNodeStateChanged({
                                source: this
                            });

                            this._timer = null;

                        }), 75)

                    }
                },
                _getAttributeFromLayer: function (layer, attr) {

                    if (layer.service) {
                        return layer.get(attr);
                    } else {
                        return layer.get("parent").get(attr);
                    }
                },
                _setAttributesOnLayer: function (layer, opacity) {

                    layer.set("enabled", true);

                    if (layer.service) {
                        layer.set("opacity", opacity);
                    } else {
                        layer.get("parent").set("opacity", opacity);
                    }
                },
                deactivate: function () {

                    if (this.crossFaderBar.playbutton.get("checked")) {
                        this.crossFaderBar.playbutton.set("iconClass", "icon-play");
                        this.crossFaderBar.emit("pause", {});
                        this.crossFaderBar.playbutton.set("checked", false)
                    }

                    if (this.forward) {
                        this.crossFaderBar.set("value", 0.5);
                    } else {
                        this.crossFaderBar.set("value", this._items.length - 0.5);
                    }

                    this.pauseEvent.remove();
                    this.startEvent.remove();
                    this.resetEvent.remove();
                    this.changeEvent.remove();
                    this.sliderEvent.remove();

                    this.imageSelector.clear();
                }
            }
            )
        }
);