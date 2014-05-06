/* Copyright (c) 2010, Sage Software, Inc. All rights reserved.
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


define('Sage/Platform/Mobile/RelatedViewDetailWidget', [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/event',
    'dojo/on',
    'dojo/string',
    'dojo/dom-class',
    'dojo/when',
    'dojo/_base/Deferred',
    'dojo/dom-construct',
    'dojo/query',
    'dojo/dom-attr',
    'dojo/_base/connect',
    'dojo/_base/array',
    'Sage/Platform/Mobile/Store/SData',
    'Sage/Platform/Mobile/Utility',
    'dijit/_Widget',
    'Sage/Platform/Mobile/_CustomizationMixin',
    'Sage/Platform/Mobile/_ActionMixin',
    'Sage/Platform/Mobile/_Templated'
], function(
    declare,
    lang,
    event,
    on,
    string,
    domClass,
    when,
    Deferred,
    domConstruct,
    query,
    domAttr,
    connect,
    array,
    SDataStore,
    Utility,
    _Widget,
    _CustomizationMixin,
    _ActionMixin,
    _Templated
) {
    return declare('Sage.Platform.Mobile.RelatedViewDetailWidget', [_Widget, _CustomizationMixin,_ActionMixin, _Templated], {
       
       
        loadingText: 'loading ... ',
        refreshViewText: 'refresh',
        editText: 'Edit',
        relatedDetailWidget: null,
        relatedViewInstance: null,
        parentProperty: '$key',
        parentEntry: null,
        relatedProperty: '$key',
        itemsNode: null,
        loadingNode: null,
        id: 'related-detail-view',
        iconDrillToDetail: 'content/images/icons/drilldown_24.png',
        icon: 'content/images/icons/ContactProfile_48x48.png',
        editViewId: null,
        isLoaded: false,
        _isInitLoad: true,
        showTab: true,
        showRefresh: true,
        showEdit: true,
        enabled:true,
        enableActions: true,
        _subscribes: null,
        /**
         * @property {Simplate}
         * Simple that defines the HTML Markup
         */
        widgetTemplate: new Simplate([
            '<div class="related-view-widget {%: $$.cls %}">',
                '<div data-dojo-attach-point="containerNode">',
                   '<div class="panel">',
                        '<div data-dojo-attach-point="actionsNode" class="action-items"></div>',
                        '<div data-dojo-attach-point="headereNode" class="header">',
                           '{%! $$.relatedViewHeaderTemplate %}',
                        '</div>',
                        '<div data-dojo-attach-point="relatedViewNode"></div>',
                        '<div data-dojo-attach-point="footerNode" class="footer">',
                           '{%! $$.relatedViewFooterTemplate %}',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'
        ]),
        nodataTemplate: new Simplate([
             '<div class="nodata"> {%: $$.nodataText %}</div>'
        ]),
        relatedViewHeaderTemplate: new Simplate([
            '<div class="line-bar"></div>'
        ]),
        relatedViewFooterTemplate: new Simplate([
             '<div class="line-bar"></div>'
        ]),       
        loadingTemplate: new Simplate([
           '<div class="loading-indicator"><div>{%= $.loadingText %}</div></div>'
        ]),
        relatedActionTemplate: new Simplate([
           '<span class="action-item" action-id="{%= $.actionIndex %}">',
                 '<img src="{%= $.icon %}" alt="{%= $.label %}" />',
           '</span>'
        ]),
        constructor: function(options) {
            lang.mixin(this, options);
            this._subscribes = [];
            this._subscribes.push(connect.subscribe('/app/refresh', this, this._onAppRefresh));
            this.setDefaultActions();
        },
        postCreate:function(){
            if (!this.showTab) {
                domClass.toggle(this.tabNode, 'hidden');
            } 
            if (this.enableActions) {
                this.createActions(this._createCustomizedLayout(this.createActionLayout(), 'related-detail-view-actions'));
            }

        },
        setDefaultActions: function() {
            if(!this.actions){
                this.actions = [];
                if (this.showRefresh) {
                    this.actions.push({
                        id: 'refresh',
                        icon: 'content/images/icons/Recurring_24x24.png',
                        label: this.refreshViewText,
                        action: 'onRefreshView',
                        isEnabled: true
                    });
                }
                if (this.showEdit) {
                    this.actions.push({
                        id: 'edit',
                        label: '',
                        icon: 'content/images/icons/edit_24.png',
                        action: 'navigateToEditView',
                        cls: 'clear',
                        isEnabled: true,
                        fn: this.navigateToEditView.bindDelegate(this)
                    });
                }
               
            }
        },
        
        createActionLayout: function() {
            return this.actions || (this.actions = []);
        },
        createActions: function(actions) {
            var i,action, actionNode, actionTemplate, options;
            for (i = 0; i < actions.length; i++) {
                action = actions[i];
                options = {
                    actionIndex: i
                };
                actionTemplate = action.template || this.relatedActionTemplate;

                lang.mixin(action, options);
                actionNode = domConstruct.toDom(actionTemplate.apply(action, action.id));
                on(actionNode, 'click', lang.hitch(this, this.onInvokeActionItem));
                domConstruct.place(actionNode, this.actionsNode, 'last');
            }

            this.actions = actions;
        },
        onInvokeActionItem: function(evt) {
            var action , parameters, index;
            index = evt.currentTarget.attributes['action-id'].value;
            action = this.actions[index];
            if (action) {
                if (action.isEnabled) {
                    if (action['fn']) {
                        action['fn'].call(action['scope'] || this, action);
                    }
                    else {

                        if(typeof this[action['action']] === 'function'){
                            this[action['action']](evt); 
                        }
                    }
                }
            }
            event.stop(evt);
        },
        onInit: function() {
            this._isInitLoad = true;
          //  if (this.autoLoad) {
               this.onLoad();
          //  }
        },
        onLoad: function() {
            var options, rw;

            if (!this.loadingNode) {
                this.loadingNode = domConstruct.toDom(this.loadingTemplate.apply(this));
                domConstruct.place(this.loadingNode, this.relatedViewNode, 'last', this);
            }

            domClass.toggle(this.loadingNode, 'loading');
                        
            rw = new this.relatedDetailWidget({id:this.id + '_rwd'});
            if (rw && !rw._started) {
                rw.init();
                rw._started = true;
            }
            rw.placeAt(this.relatedViewNode, 'last');
            options = {
                key: Utility.getValue(this.parentEntry, this.relatedProperty, '')
            };
            rw.options = options;
            rw.activate();
            rw.requestData();
            this.relatedViewInstance = rw;
            this.isLoaded = true;
            domClass.toggle(this.loadingNode, 'loading');
        },
        navigateToEditView: function(el) {
            if (this.relatedViewInstance.navigateToEditView) {
                this.relatedViewInstance.navigateToEditView();
            }

        },
        onRefreshView: function(evt) {
            this._onRefreshView();
            evt.stopPropagation();
        },
       _onRefreshView: function() {
           if (this.relatedViewInstance) {
               this.relatedViewInstance.destroy();
               this.relatedViewInstance = null;
            }

            this.isLoaded = false;
            this.onLoad();
        },
        _onAppRefresh: function(data) {
            if (data && data.data) {
                if(data.resourceKind === this.resourceKind){
                    if (this.parentEntry && (this.parentEntry[this.parentProperty] === Utility.getValue(data.data, this.relatedProperty, ''))) {
                        this._onRefreshView();
                    } else {
                        if(this.editViewId === data.id){
                            this._onRefreshView();
                        }
                        if (this.editViewId === data.id) {
                            this._onRefreshView();
                        }
                    }
                }
            }
        },
        destroy: function() {
            array.forEach(this._subscribes, function(handle) {
                connect.unsubscribe(handle);
            });
            this.relatedViewInstance.destroy();
            this.inherited(arguments);
        }
    });
});
