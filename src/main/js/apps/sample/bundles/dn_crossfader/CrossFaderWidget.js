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
    "dojo/dom-geometry",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/CrossFaderWidget.html"
],
        function (declare, d_domgeom, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, templateString) {
            return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
                baseClass: "ctMapCrossfader",
                templateString: templateString,
                constructor: function () {

                },
                postCreate: function () {
                    this.inherited(arguments);
                    this.imageSelector.placeAt(this.imageSelectorNode);
                    this.crossFaderBar.placeAt(this.crossfaderSliderNode);
                },
                resize: function (dim) {
                    this.inherited(arguments);
                    if (this.imageSelector) {
                        this.imageSelector.resize(dim);
                    }
                    if (this.crossFaderBar) {
                        this.crossFaderBar.resize(dim);
                    }
                    if (this.imageSelectorNode && dim) {
                        d_domgeom.setMarginBox(this.imageSelectorNode, {w: dim.w, h: this.imageSelector.tileHeight});
                    }

                },
                startup: function () {
                    this.inherited(arguments);
                },
                hide: function () {
                    this.crossFaderBar.hide();
                },
                show: function () {
                }
            }
            )
        }
);