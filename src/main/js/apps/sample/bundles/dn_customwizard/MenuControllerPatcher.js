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
    "ct/array",
    "dojo/dom-construct",
    "dojo/query",
    "dojo/dom-geometry",
    "ct/_Connect",
    "ct/util/css",
    "dijit/form/Button",
    "dijit/form/CheckBox",
    "dijit/layout/ContentPane",
    "ct/util/LocalStorage",
    "dojo/on"
], function (declare, d_array, ct_array, domConstruct, query, domGeometry, _Connect, css, Button, CheckBox, ContentPane, LocalStorage, on) {
    var Menu = declare([ContentPane], {
        i18n: {
            title: "Hint",
            step1: "Click on the marked items to configure the widgets.",
            step2: "Once configured they are marked correspondingly.",
            step3: "To save an app press the button above.",
            reminder: "Do not remind me again",
            exitConfig: "Exit Live-Configuration",
            saveApp: "Save app"
        },
        startup: function () {
            var i18n = this.i18n;
            var localStorage = new LocalStorage({
                storageName: "map.app_custom_liveconfig",
                storageNamePrefix: this.prefix
            });
            this.inherited(arguments);
            var that = this;
            var btn1 = new Button({
                label: i18n.exitConfig,
                iconClass: "icon-editor-exit",
                "class": "ctConfigureButton",
                onClick: function () {
                    that.onExit();
                }
            });
            this.addChild(btn1);
            var btn2 = this._saveBtn = new Button({
                label: i18n.saveApp,
                iconClass: "icon-floppy",
                "class": "ctConfigureButton saved",
                onClick: function () {
                    that.onSave();
                }
            });
            this.addChild(btn2);
            var hideHint = localStorage.get() === "true";
            if (!hideHint) {

                var checkBox = new CheckBox({checked: false});
                checkBox.startup();
                var widgetId = checkBox.get("id");
                var labelNode = domConstruct.create("label", {innerHTML: i18n.reminder, "for": widgetId});
                var message = "<table>" +
                        "<tr><td>" + i18n.step1 + "</td><td valign=\"top\"><div class='ctConfigurableWidget notConfigured' style='width:50px; height:20px; position: relative; display: inline-block;'><span class='icon icon-cog'></span></div></td></tr>" +
                        "<tr><td>" + i18n.step2 + "</td><td valign=\"top\"><div class='ctConfigurableWidget configured' style='width:50px; height:20px; position: relative; display: inline-block;'><span class='icon icon-checkbox-checkmark'></span></div></td></tr>" +
                        "<tr><td colspan=\"2\">" + i18n.step3 + "</td></tr>" +
                        "<tr><td colspan=\"2\">&nbsp;</td></tr>" +
                        "</table>";

                var content = new ContentPane({
                    content: message
                });
                content.addChild(checkBox);
                content.domNode.appendChild(labelNode);

                this.windowManager.createInfoDialogWindow({
                    content: content,
                    showCancel: false,
                    title: i18n.title,
                    windowClass: "ctAppBuilderWindow",
                    marginBox: {
                        w: 320,
                        h: 240
                    }
                });
                this.own(on(checkBox, "change", function () {
                    localStorage.set(checkBox.get("checked"));
                }));
            }
        },
        _setUnsavedAttr: function (unsaved) {
            var btnNode = this._saveBtn.domNode;
            !unsaved ? css.replaceClass(btnNode, "unsaved", "saved") : css.replaceClass(btnNode, "saved", "unsaved");
        },
        onSave: function () {
        },
        onExit: function () {
        }
    });
    return declare([_Connect], {
        i18n: {
            configTitle: "Configuration",
            popup: {
                title: "Hint",
                step1: "Click on the marked items to configure the widgets.",
                step2: "Once configured they are marked correspondingly.",
                step3: "To save an app press the button above.",
                reminder: "Do not remind me again",
                exitConfig: "Exit Live-Configuration",
                saveApp: "Save app"
            }
        },
        activate: function () {
            var menuController = this._menuController;
            this._originalOpenConfigWindow = menuController._openConfigWindow;
            var that = this;
            var properties = this._properties || {};
            var configItems = properties.configItems || [];
            var i18n = this._i18n.get();
            menuController._openConfigWindow = function () {
                that._openConfigWindow(configItems, that, i18n);
            };
        },
        deactivate: function () {
            this.disconnect();
            this._menuController._openConfigWindow = this._originalOpenConfigWindow;
            this._originalOpenConfigWindow = null;
        },
        _openConfigWindow: function (configItems, patcherScope, i18n) {
            var appRoot = query(".ctAppRoot")[0];
            var menuController = this._menuController;
            var btn = menuController._button;
            btn && css.switchHidden(btn.domNode, true);
            var nodes = [];
            var appName = patcherScope._appCtx.getApplicationName();
            var menu = new Menu({
                "class": "ctConfigureButton noPadding",
                windowManager: this._windowManager,
                i18n: i18n.popup,
                prefix: appName
            });
            menu.placeAt(btn.domNode.parentNode);
            d_array.forEach(configItems, function (item) {
                var domNodes = query(item.query);
                if (!domNodes.length) {
                    return;
                }
                var domNode = domNodes[0];
                var marginBox = domGeometry.position(domNode);
                var widgetId = item.widgetId;
                var rootNode = appRoot;
                var node = domConstruct.create(
                        "div", {
                            "class": "ctConfigurableWidget ctConfigurableWidget_" + widgetId + " notConfigured", style: {
                                width: marginBox.w + "px",
                                height: marginBox.h + "px",
                                left: marginBox.x + "px",
                                top: marginBox.y + "px"
                            },
                            innerHTML: "<span class=\"icon icon-cog\"></span>"
                        },
                rootNode, "first");
                var menuContentWidget = item.menuContentWidget = item.menuContentWidget || patcherScope._getMenuContentWidget(widgetId);
                nodes.push(node);
                var window;
                patcherScope.connect(node, "onclick", this, function () {
                    window = patcherScope._itemClicked(menuContentWidget);
                });
                patcherScope.connect(menuContentWidget.get("contentWidget"), "updateConfig", function () {
                    window.hide();
                    css.replaceClass(node, "notConfigured", "configured");
                    css.replaceClass(node.firstChild, "icon-cog", "icon-checkbox-checkmark");
                    menu.set("unsaved", true);
                });
            }, this);
            patcherScope.connect(menu, "onExit", function () {
                d_array.forEach(nodes, function (node) {
                    domConstruct.destroy(node);
                });
                patcherScope.disconnect();
                btn && css.switchHidden(btn.domNode, false);
                nodes = [];
                menu.destroyRecursive();
            });
            patcherScope.connect(menu, "onSave", function () {
                menuController._eventService.postEvent("builder/wizard/SAVE_APP", {
                    src: this
                });
                menu.set("unsaved", false);
            });
        },
        _getMenuContentWidget: function (widgetId) {
            var menuController = this._menuController;
            var menuNode = ct_array.arraySearchFirst(menuController._menueEntryNodes, function (node) {
                return node.widget === widgetId;
            });
            var widget = menuController._configWidgets[widgetId];
            var menuContentWidget = menuController._createMenuContent(widgetId + "_menu", menuNode, widget);
            // hide save button
            css.switchHidden(menuContentWidget._footerSaveButton.domNode, true);
            menuContentWidget.set("shown", true);
            menuContentWidget.resize();
            return menuContentWidget;
        },
        _itemClicked: function (widget) {
            var menuController = this._menuController;
            var window = this._window = this._windowManager.createWindow({
                windowClass: "ctAppBuilderWindow",
                minimizeOnClose: true,
                content: widget,
                closable: true,
                title: this.i18n.configTitle,
                marginBox: {
                    "w": "50%",
                    "h": "60%"
                },
                minSize: {
                    "w": 700,
                    "h": 480
                },
                attachToDom: menuController._builderWindowRoot,
                modal: true
            });
            window.show();
            return window;
        }
    });
}
);