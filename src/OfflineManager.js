/* Copyright (c) 2014, SalesLogix, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @class Sage.Platform.Mobile.OfflineManager
 *  Manages offline resources.
 * 
 * @alternateClassName OfflineManager
 * @singleton
 */
define('Sage/Platform/Mobile/OfflineManager', [
    'dojo/_base/lang',
     'Sage/Platform/Mobile/Views/DefaultOfflineView',
    'Sage/Platform/Mobile/OfflineList',
    'Sage/Platform/Mobile/_ListBase',
     'Sage/Platform/Mobile/OfflineEdit'
], function(
    lang,
    DefaultOfflineView,
    OfflineList,
    _ListBase,
    OfflineEdit
) {
    var _defaultMap = { contextViewId: '*', viewId: 'default_offline_view', viewCtor: DefaultOfflineView };
    var _offLineState = { isOffLine: false };
    var _offLineViews = [_defaultMap];
    return lang.setObject('Sage.Platform.Mobile.OfflineManager', {
        
        _state: _offLineState,
        _views: _offLineViews,
        init: function() {
            var self = this;
            window.addEventListener("offline", function(e) {
                self.setOffline(true);
            }, false);

            window.addEventListener("online", function(e) {
                self.setOffline(false);
            }, false);

            window.applicationCache.addEventListener("error", function(e) {
                self.setOffline(true);
            });
        },
        toggleOffline: function() {
            this._state.isOffLine = !this._state.isOffLine;
        },
        setOffline:function(offline) {
            this._state.isOffLine = offline;
        },
        isOffline: function() {
            return this._state.isOffLine;
        },
        getOfflineView: function(contextView) {
            var viewMap,defaultViewMap, offlineView;
            offlineView = null;
            viewMap = null;
            this._views.forEach(function(_viewMap) {
                if (_viewMap.contextViewId === "*") {
                    if (!viewMap) {
                         defaultViewMap = _viewMap;

                        if ((contextView) && (contextView.entityName) && (contextView.isInstanceOf(_ListBase))) {
                            defaultViewMap = { contextViewId: '_ListBase', viewId: 'offlineList', viewCtor: OfflineList }
                        }
                    }
                }
                if (_viewMap.contextViewId === contextView.id) {
                    viewMap = _viewMap;
                }

            });
            if (!viewMap) {
                viewMap = defaultViewMap;
                if (contextView.entityName) {
                    viewMap.viewId = viewMap.viewId + "_" + contextView.entityName;
                }
            }
            if(viewMap){
                offlineView = App.getView(viewMap.viewId);
                if (!offlineView) {
                    if(viewMap.viewCtor){
                        App.registerView(new viewMap.viewCtor({
                            id: viewMap.viewId,
                            expose: false
                        }));
                        offlineView =  App.getView(viewMap.viewId);
                    }
                }
            }
            return offlineView;
        },
        getEditView: function (context) {
            var view, viewId;
            viewId = "offlineEdit_" + context.entityName;
            view = App.getView(viewId);
            if (!view) {
                App.registerView(new OfflineEdit({
                    id: viewId,
                    entityName: context.entityName,
                    expose: false
                }));
                view = App.getView(viewId);
            }
            return view;
        },
        registarView:function(contextId, viewId, viewCtor){
            this._views.push({ contextViewId: contextViewId, viewId: viewId, viewCtor: viewCtor });
        },
        saveOffline: function(contextView) {
            var SADapter, LAdpater, resultPromise;
            SADapter = App.DataManager.getAdapter('SData', contextView.entityName);
            LAdpater = App.DataManager.getAdapter('Local', contextView.entityName);

            entityPromise = SADapter.getEntity(contextView.entry.$key, true);
            entityPromise.then(function(entity) {
                if (entity) {
                    LAdpater.saveEntity(entity);
                }
            });
        }
        
    });
});
