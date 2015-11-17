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
    "dojo/_base/array",
    "dojo/keys",
    "dojo/dom-geometry",
    "ct/util/css",
    "dijit/_MenuBase",
    "dijit/layout/_ContentPaneResizeMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/Evented",
    "dojo/text!./templates/ImageSelectorWidget.html",
    "dijit/form/Button"
],
    function (declare, d_lang, d_array,d_keys, d_domgeom, ct_css, _MenuBase, _ContentPaneResizeMixin,_WidgetsInTemplateMixin,Evented,templateString) {
        return declare([_MenuBase, _ContentPaneResizeMixin,_WidgetsInTemplateMixin,Evented],
            {

                templateString: templateString,
                baseClass: "dijitMenu ctImageSelectorWidget",
                _viewportsize:5,
                tileHeight: 150,
                startup: function () {
                },

                postCreate: function () {
                    this.inherited(arguments);
                    this.connectKeyNavHandlers([], [],[]);
                },

                connectKeyNavHandlers: function(/*keys[]*/ prevKeyCodes, /*keys[]*/ nextKeyCodes, /*keys[]*/ closeKeyCodes){
//                    this.inherited(arguments);
//                    var keyCodes = this._keyNavCodes,
//                        close = d_lang.hitch(this,function(){
//                            this.onClose();
//                        });
//                    d_array.forEach(closeKeyCodes, function(code){ keyCodes[code] = close; });

                },


                clear : function() {

                    var c = this.getChildren();
                    d_array.forEach(c,function(child){
                        this.removeChild(child);
                    },this);

                },

                getImageMarginBox : function() {
                    var child = this.getChildren()[0];
                    if (child) {
                        return d_domgeom.getMarginBox(child.domNode);
                    }else {
                        return {};
                    }

                },

                onClose:function() {},

                resize: function (dim) {
                    this.inherited(arguments);
                    var tileHeight = this.tileHeight;
                    if (dim){

                        d_domgeom.setMarginBox(this.domNode,{w:dim.w,h:tileHeight});
                        
                        d_domgeom.setMarginBox(this.containerNode,{w:dim.w, h:tileHeight});
                        
                        var imageBox = d_domgeom.getMarginBox((this.containerNode));
                        
                        var numberOfChildren = this.getChildren().length;
                        
                        var w = imageBox.w / numberOfChildren;
                        
                        d_array.forEach(this.getChildren(), function (child) {
                            //-11 is the height of the image Slider
                            d_domgeom.setMarginBox(child.domNode, {w: w, h: tileHeight});
                        });
                        
                    // Function manually called from CrossFaderController
                    } else {
                        var imageBox = d_domgeom.getMarginBox((this.containerNode));
                        
                        var numberOfChildren = this.getChildren().length;
                        
                        var w = imageBox.w / numberOfChildren;
                        
                        d_array.forEach(this.getChildren(), function (child) {
                            d_domgeom.setMarginBox(child.domNode, {w: w, h: tileHeight});
                        });
                    }

                },

                //OVERRIDE
                _layoutChildren: function () {
                    // Call _checkIfSingleChild() again in case app has manually mucked w/the content
                    // of the ContentPane (rather than changing it through the set("content", ...) API.
                    if (this.doLayout) {
                        this._checkIfSingleChild();
                    }
                    var cb = this._contentBox || d_domgeom.getContentBox(this.containerNode);
                    if (this._singleChild && this._singleChild.resize) {

                        // note: if widget has padding this._contentBox will have l and t set,
                        // but don't pass them to resize() or it will doubly-offset the child
                        this._singleChild.resize({w: cb.w, h: cb.h});
                    } else {
                        // All my child widgets are independently sized (rather than matching my size),
                        // but I still need to call resize() on each child to make it layout.
                        d_array.forEach(this.getChildren(), function (widget) {
                            if (widget.resize) {
                                widget.resize({w: cb.w, h: cb.h});
                            }
                        });
                    }
                },

                _cleanUp: function(/*Boolean*/ clearSelectedItem){
                    // summary:
                    //		Called when the user is done with this menu.  Closes hierarchy of menus.
                    // tags:
                    //		private

                    this._closeChild(); // don't call this.onClose since that's incorrect for MenuBar's that never close
                    if(typeof this.isShowingNow === 'undefined'){ // non-popup menu doesn't call onClose
                        this.set("activated", false);
                    }

//                    if(clearSelectedItem){
//                        this.set("selected", null);
//                    }
                }
            }
        )
    }
);