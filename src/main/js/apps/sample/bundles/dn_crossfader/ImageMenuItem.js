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
    "dojo/_base/lang",
    "dojo/dom-class",
    "ct/util/css",
    "dijit/MenuItem",
    "dojo/dom-style",
    "dojo/text!./templates/ImageMenuItem.html"
],
        function (declare, d_lang, domClass, ct_css, MenuItem, domStyle, templateString) {
            return declare([MenuItem], {
                templateString: templateString,
                overlayLabel: "",
                unselected: null,
                constructor: function () {
                },
                postCreate: function () {
                    this.set("unselected", true);
                },
                _onFocus: function () {
                    //important! override because of the double click selection problem!
                },
                _setOverlayLabelAttr: function (val) {
                    this._set("overlayLabel", val);
                    this.overlayLabelNode.innerHTML = val;
                },
                _setUnselectedAttr: function (unselected) {
                    /*if (unselected) {
                        domClass.add(this.overlayNode, "unselected");
                    } else {
                        domClass.remove(this.overlayNode, "unselected");
                    }*/
                    ct_css.toggleClass(this.overlayNode, "unselected", unselected);
                },
                _setSelected: function (selected) {
                    this.inherited(arguments);
                    //ct_css.toggleClass(this.overlayLabelNode, "dijitHidden", !selected);
                    //ct_css.toggleClass(this.overlayNode, "dijitHidden", !selected);
                },
                _setIconUrlAttr: function (src) {
                    domStyle.set(this._iconCellNode, {
                        "background-position": "0px 0px",
                        "background-image": "url('" + src + "')"
                    });
                }
            });
        });