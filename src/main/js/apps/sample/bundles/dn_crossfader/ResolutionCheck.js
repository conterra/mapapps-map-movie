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
    "dojo/window"],
    function(declare, d_lang, d_window) {
        return declare([],
            {
                constructor: function() {
                },

                activate: function() {
                    var viewPort = d_window.getBox();
                    setTimeout(d_lang.hitch(this, function() {
                        if (viewPort && viewPort.w < 1024) {
                            this.showMessage();
                        }
                    }), 100);
                },

                showMessage: function() {
                    this.ui = this._i18n.get().notifier;
                    this._wm.createInfoDialogWindow({
                        message: this.ui.resolutionMessage,
                        marginBox: {
                            w: 350,
                            h: 180
                        },
                        title: this.ui.title,
                        i18n: {
                            okButton: this.ui.okButton
                        },
                        showOk: true,
                        showCancel: false
                    });
                }
            });
    });