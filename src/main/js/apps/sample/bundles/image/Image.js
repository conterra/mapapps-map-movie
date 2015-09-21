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
    "dojo/_base/declare", "dojo/dom-construct", "dijit/_WidgetBase"
], function(declare, domConstruct, _WidgetBase) {

    return declare([_WidgetBase], {
        baseClass: "ctImage",
        src: null,
        postCreate: function() {
            this.inherited(arguments);
            var hasSource = !!this.src;
            if (!hasSource) {
                domConstruct.create("div", {innerHTML: this.msg, 'class': "msg"}, this.domNode);
            }
        },
        _setSrcAttr: function(src) {
            domConstruct.create("img", {src: src}, this.domNode);
        }
    });
});