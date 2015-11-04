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
    "dojo/dom-geometry",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "ct/_Connect",
    "dojo/Evented",
    "dijit/Tooltip",
    "dojo/text!./templates/CrossFaderBarWidget.html",
    "dijit/form/HorizontalSlider",
    "dijit/form/ToggleButton",
    "dijit/form/HorizontalRule",
    "dijit/form/HorizontalRuleLabels"

],
    function (declare, d_lang, d_array, d_domgeom, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, Connect, Evented, d_tooltip, templateString) {
        return declare([_Widget,_TemplatedMixin, _WidgetsInTemplateMixin, Evented],
            {
                baseClass: "crossfaderSliderBar",
                templateString:templateString,
                stopOnClose: null,
                resetOnClose: null,

                baselayerCount : 1,

                constructor: function () {

                    this._listener = new Connect({
                        defaultConnectScope:this
                    });

                },

                postCreate: function () {
                    this.inherited(arguments);

                    this._listener.connect("slider", this.slider, "onChange", "onSliderChange");

                    this._listener.connect("play", this.playbutton, "onClick", "onClick");
                    
                    this._listener.connect("reset", this.resetbutton, "onClick", "onReset");
                    
                    this._listener.connect("forward", this.ffbutton, "onClick", "onForward");
                    
                    this._listener.connect("reverse", this.fbbutton, "onClick", "onReverse");
                    
                    this.ffbutton.set("checked", true);


                },

                resize : function(dim) {
                    this.inherited(arguments);

                },

                _setValueAttr : function(val) {
                    this.slider.set("value",val);
                },

                _setMaximumAttr : function(val) {
                    this._set("maximum",val);
                    this.slider.set("maximum",val);
                },
                _getMaximumAttr:function() {
                    return this.maximum;
                },
                _setMinimumAttr : function(val) {
                    this._set("minimum",val);
                    this.slider.set("minimum",val);
                },
                _getMinimumAttr : function() {
                    return this.minimum;
                },

                _getValueAttr : function() {
                    return this.slider.get("value");
                },

                onClick:function(){

                    if (this.playbutton.get("checked")) {

                        this.playbutton.set("iconClass","icon-pause");
                        this.emit("start",{});

                    } else {

                        this.playbutton.set("iconClass","icon-play");
                        this.emit("pause",{});

                    }

                },
                
                onReset : function(){
                    
                    this.resetbutton.set("checked", false);
                    
                    this.playbutton.set("checked", false);
                    this.onClick();
                    
                    this.emit("reset", {});
                },
                
                onForward : function(){
                    
                    if (!this.ffbutton.get("checked")) {
                        
                        // Do nothing, keep direction
                        this.ffbutton.set("checked", true);
                    
                    } else {
                        
                        // Change direction if slider is running
                        if(this.playbutton.get("checked")){
                            // Stop slider
                            this.playbutton.set("checked", false);
                            this.onClick();
                            this.fbbutton.set("checked", false);
                            
                            // Change direction
                            this.emit("changeDirection", {});
                            
                            // Start slider
                            this.playbutton.set("checked", true);
                            this.onClick();
                            
                        // Change direction if slider is paused
                        } else {
                            this.fbbutton.set("checked", false);
                            this.emit("changeDirection", {});
                        }
                    }
                    
                },
                
                onReverse : function(){
                    
                    if (!this.fbbutton.get("checked")) {
                        
                        // Do nothing, keep direction
                        this.fbbutton.set("checked", true);
                    
                    } else {
                        
                         // Change direction if slider is running
                        if(this.playbutton.get("checked")){
                            // Stop slider
                            this.playbutton.set("checked", false);
                            this.onClick();
                            this.ffbutton.set("checked", false);
                            
                            // Change direction
                            this.emit("changeDirection", {});
                            
                            // Start slider
                            this.playbutton.set("checked", true);
                            this.onClick();
                            
                        // Change direction if slider is paused
                        } else {
                            this.ffbutton.set("checked", false);
                            this.emit("changeDirection", {});
                        }
                        
                    }
                    
                },

                onSliderChange : function(value) {

                    this.emit("sliderChange",{value:value});

                },
                
                hide : function(){
                    // pause and reset CrossFader 
                    if(this.stopOnClose){
                    
                        this.playbutton.set("checked", false);
                        this.onClick();
                    }
                    
                    if(this.resetOnClose){
                        
                        this.onReset();
                        
                        if(!this.stopOnClose){
                            
                            this.playbutton.set("checked", true);
                            this.onClick();
                        }
                    }
                }
            }
        )
    }
);