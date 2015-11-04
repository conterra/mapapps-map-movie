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
define(["dojo/_base/lang", "dojo/_base/declare", "./DataFormBuilderWidget", "wizard/DataFormBuilderWidgetFactory"],
        function(d_lang, declare, DataFormBuilderWidget, DataFormBuilderWidgetFactory) {
            return declare([DataFormBuilderWidgetFactory], {
                _createWrapperWidget: function(properties) {
                    var chk = d_lang.hitch(this, "_chk");
                    var id = chk("id");
                    var description = properties.description;
                    var hint = properties.hint;
                    var errorMessage = properties.errorMessage;
                    var baseClass = properties.styleClass || "ctDataFormBuilderWidget";
                    var dataformFile = properties.dataformFile;
                    var defaultProperties = properties.defaultProperties;
                    var i18n = this._i18n.get();
                    var widget = new DataFormBuilderWidget({
                        baseClass: baseClass,
                        configAdminService: this._configAdminService,
                        dataformService: this._dataformService,
                        dataFormJson: dataformFile,
                        defaultProperties: defaultProperties,
                        i18n: i18n,
                        id: id,
                        description: description,
                        hint: hint,
                        errorMessage: errorMessage
                    });
                    return widget;
                }
            });
        });