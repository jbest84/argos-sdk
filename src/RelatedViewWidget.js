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


define('Sage/Platform/Mobile/RelatedViewWidget', [
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
    return declare('Sage.Platform.Mobile.RelatedViewWidget', [_Widget, _CustomizationMixin,_ActionMixin, _Templated], {
       
        cls: null,
        nodataText: 'no records found ...',
        selectMoreDataText: 'see ${0} more of ${1} ... ',
        selectMoreDataText2: 'see ${0} more ... ',
        navToListText:'see list',
        loadingText: 'loading ... ',
        refreshViewText: 'refresh',
        itemOfCountText: ' ${0} of ${1}',
        totalCountText: ' ${0}',
        deleteText: 'Delete',
        editText: 'Edit',

        owner: null,
        parentProperty: '$key',
        parentEntry: null,
        relatedProperty: '$key',
        relatedItemKeyProperty:'$key', 
        relatedEntry: null,
        itemsNode: null,
        loadingNode: null,
        id: 'related-view',
        iconDrillToDetail: 'content/images/icons/drilldown_24.png',
        icon: 'content/images/icons/ContactProfile_48x48.png',
        itemIcon: 'content/images/icons/ContactProfile_48x48.png',
        title: 'Related View',
        detailViewId: null,
        editViewId: null,
        listViewId: null,
        listViewWhere: null,
        enabled: false,
        parentCollection: false,
        parentCollectionProperty: null,
        resourceKind: null,
        contractName: 'dynamic',
        select: null,
        where: null,
        sort: null,
        store: null,
        relatedData: null,
        queryOptions: null,
        isLoaded: false,
        autoLoad: false,
        wait: false,
        startIndex: 1,
        pageSize: 3,
        relatedResults: null,
        itemCount: 0,
        _isInitLoad: true,
        showTab: true,
        showTotalInTab: true,
        showItemIcon: true,
        showItemHeader: true,
        showItemFooter: true,
        showItemDetail: true,
        showNavigateToList: true,
        showRefresh: true,
        showAdd: false,
        showEdit: false,
        showDelete: false,
        showDrillToDetail: true,
        showSelectMore: true,
        onlyDrillToListView: false,
        hideWhenNoData: false,
        enabled:true,
        enableItemActions: false,
        enableActions: true,
        autoScroll:false,
        _subscribes: null,
        _itemEntrys: null,

        /**
         * @property {Simplate}
         * Simple that defines the HTML Markup
         */
        widgetTemplate: new Simplate([
            '<div class="related-view-widget {%: $$.cls %}">',
                '<div data-dojo-attach-point="containerNode">',
                    '<div  id="tab" data-dojo-attach-point="tabNode" class="',
                    '{% if ($$.autoLoad) { %}',
                     'tab ',
                    '{% } else { %}',
                       'tab collapsed',
                    '{% } %}',
                    '" >',
                    '<div data-dojo-attach-event="onclick:toggleView" class="tab-items">',
                       '{%! $$.relatedViewTabItemsTemplate %}',
                    '</div>',
                    '</div>',
                    '<div class="panel">',
                        '<div data-dojo-attach-point="actionsNode" class="action-items"></div>',
                        '<div data-dojo-attach-point="headereNode" class="header">',
                           '{%! $$.relatedViewHeaderTemplate %}',
                        '</div>',
                        '<div  data-dojo-attach-point="relatedViewNode"></div>',
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
        relatedViewTabItemsTemplate: new Simplate([
            '<div class="tab-item tab-icon">',
               '<img src="{%= $.icon %}" alt="{%= $.title %}"  />',
            '</div>',
            '<div data-dojo-attach-point="titleNode" class="tab-item title" >{%= $.title %}</div>',
            '<div data-dojo-attach-point="toggleIndicator" class="collapsed-indicator">',
            '</div>'
        ]),
        relatedViewHeaderTemplate: new Simplate([
            '<div class="line-bar"></div>'
        ]),
        relatedViewFooterTemplate: new Simplate([
                 '<div  data-dojo-attach-point="selectMoreNode" class="action" data-dojo-attach-event="onclick:onSelectMoreData"></div>',
                 '<div  data-dojo-attach-point="navtoListFooterNode" class="action" data-dojo-attach-event="onclick:onNavigateToList">{%: $$.navToListText %}</div>'

        ]),
        relatedViewRowTemplate: new Simplate([
            '<div class="row {%: $$.cls %}"  data-relatedkey="{%: $.$key %}" data-descriptor="{%: $.$descriptor %}">',
                 '<div class="item  {%: $$.getRowItemCls($) %}">',
                      '{%! $$.relatedItemTemplate %}', 
                 '</div>',
            '</div>'
        ]),
        relatedItemIconTemplate: new Simplate([
            '<img src="{%: $$.itemIcon %}" />'
        ]),
        relatedItemHeaderTemplate: new Simplate([
              '<div><h3><strong>{%: $.$descriptor %}<strong></h3></div>'
        ]),
        relatedItemDetailTemplate: new Simplate([
              '<div></div>'
        ]),
        relatedItemFooterTemplate: new Simplate([
             '<div></div>'
        ]),
        relatedItemRightTemplate: new Simplate([
               '<div></div>',
        ]),
        relatedItemLeftTemplate: new Simplate([
               '{% if ($$.showItemIcon) { %}',
               '<div class="item-icon">',
                   '{%! $$.relatedItemIconTemplate %}',
               '</div>',
               '{% } %}'
        ]),
        relatedItemTemplate: new Simplate([

            '{%! $$.relatedItemLeftTemplate %}</td>',
             '{% if ($$.showItemHeader) { %}',
             '<div class="item-header">',
                 '{%! $$.relatedItemHeaderTemplate %}',
             '</div>',
             '{% } %}',
             '<div class="item-detail ',
             '{% if (!$$.showItemDetail) { %}',
                   'hidden',
             '{% } %}',
             '">',
                '{%! $$.relatedItemDetailTemplate %}',
             '</div>',
              '{% if ($$.showItemFooter) { %}',
             '<div class="item-footer">',
                 '{%! $$.relatedItemFooterTemplate %}',
             '</div>',
             '{% } %}'
        ]),
        loadingTemplate: new Simplate([
           '<div class="loading-indicator"><div>{%= $.loadingText %}</div></div>'
        ]),
        relatedActionTemplate: new Simplate([
           '<span class="action-item" action-id="{%= $.actionIndex %}">',
                 '<img src="{%= $.icon %}" alt="{%= $.label %}" />',
           '</span>'
        ]),
        relatedItemActionsTemplate: new Simplate([
            '<div class="item-actions hidden"></div>'
        ]),
        relatedItemActionTemplate: new Simplate([
                '<button  data-action="{%= $.name %}" data-action-index="{%= $.actionIndex %}" data-item-key="{%: $.itemKey %}" data-enabled="{%: $.enabled %}" class="action-item-with-button {%: $.cls %}">',
                     '{% if ($.icon) { %}',
                          '<img src="{%= $.icon %}" alt="{%= $.label %}" />',
                      '{% } %}',
                     '<span> {%= $.label %}</span>',
                '</button>',
        ]),
        constructor: function(options) {
            lang.mixin(this, options);
            this._subscribes = [];
            this._subscribes.push(connect.subscribe('/app/refresh', this, this._onAppRefresh));
            this.setDefaultActions();
            this.setDefaultItemActions();
        },
        postCreate:function(){
            if (!this.showTab) {
                domClass.toggle(this.tabNode, 'hidden');
            } 
            if (this.enableActions) {
                this.createActions(this._createCustomizedLayout(this.createActionLayout(), 'relatedview-actions'));
            }
            if (this.enableItemActions) {
                this.itemActions = this._createCustomizedLayout(this.createItemActionLayout(), 'relatedview-item-actions');
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
                if (this.showNavigateToList) {
                    this.actions.push({
                        id: 'navtoListView',
                        icon: 'content/images/icons/drilldown_24.png',
                        label: this.viewContactsActionText,
                        action: 'onNavigateToList',
                        isEnabled: true,
                        fn: this.onNavigateToList.bindDelegate(this)
                    });
                }
                if (this.showAdd) {
                    this.actions.push({
                        id: 'add',
                        icon: 'content/images/icons/Add_24.png',
                        label: this.addViewText,
                        action: 'onAddItem',
                        isEnabled: true
                    });
                }
            }
        },
        setDefaultItemActions: function() {

            if (!this.itemActions)
            {
                this.itemActions = [];
                if (this.showDrillToDetail) {
                    this.itemActions.push({
                        id: 'drillToDetialView',
                        label: '',
                        icon: 'content/images/icons/drilldown_24.png',
                        action: 'onDrillToDetailView',
                        cls:'clear',
                        isEnabled: true,
                        fn: this.onDrillToDetailView.bindDelegate(this)
                    });
                }
                if (this.showEdit) {
                    this.itemActions.push({
                        id: 'edit',
                        label: '',
                        icon: 'content/images/icons/edit_24.png',
                        action: 'onEditItem',
                        cls:'clear',
                        isEnabled: true,
                        fn: this.onEditItem.bindDelegate(this)
                    });
                }
                if (this.showDelete) {
                    this.itemActions.push({
                        id: 'delete',
                        label: '',
                        icon: 'content/images/icons/del_24.png',
                        action: 'onDeleteItem',
                        cls:'clear',
                        isEnabled: true,
                        fn: this.onDeleteItem.bindDelegate(this)
                    });
                }
            }
            
        },
        createActionLayout: function() {
            return this.actions || (this.actions = []);
        },
        createItemActionLayout: function() {
            return this.itemActions || (this.itemActions = []);
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
        createItemActions: function(actions, itemNode, itemEntry ) {
            var i, action, actionNode, actionTemplate, options, actionIcon, actionOptions, actionClss, enabled, modeClss, applyClss, itemActionNode;
            itemActionNode = domConstruct.toDom(this.relatedItemActionsTemplate.apply(itemEntry));
            domConstruct.place(itemActionNode, itemNode, 'last');
            for (i = 0; i < actions.length; i++) {
                applyClss = false;
                enabled = false;
                actionClss = '';
                actionIcon = '';
                actionOptions = {};
                action = actions[i];
                options = {
                    actionIndex: i,
                    itemKey: itemEntry[this.relatedItemKeyProperty],
                    itemEntry: itemEntry,
                };

                if (action.options) {
                    if (typeof action.options === 'function') {
                        try {
                            actionOptions = action.options.call(this, itemEntry);
                        } catch (error) {

                        }
                    } else {
                        actionOptions = action.options;
                    }
                }
                lang.mixin(options, action);
                lang.mixin(options, actionOptions);
                actionTemplate = options.template || this.relatedItemActionTemplate;
                if (options.enabled) {
                    if (typeof options.enabled === 'function') {
                        try{
                            enabled = options.enabled.call(this, itemEntry);
                        } catch (error) {

                        }
                    } else {
                        enabled = true;
                    }
                } else {
                    enabled = true;
                }
                modeClss = '';
                if(!enabled){
                    modeClss = " disabled";
                }
                   
                options.enabled = enabled;
                options.cls =  options.cls + " "+ modeClss;

                actionNode = domConstruct.toDom(actionTemplate.apply(options, this));
                on(actionNode, 'click', lang.hitch(this, this.onInvokeItemActionItem));
                domConstruct.place(actionNode, itemActionNode, 'last');
            }

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
        onInvokeItemActionItem: function(evt) {
            var action, parameters, itemEntry, itemEntryKey, index, el;
            el = evt.currentTarget;
            index = evt.currentTarget.attributes['data-action-index'].value;
            itemEntryKey = evt.currentTarget.attributes['data-item-key'].value;
            itemEntry = this.getItemEntry(itemEntryKey);
            action = this.itemActions[index];
            if (action) {
                if (action.isEnabled) {
                    if (action['fn']) {
                        action['fn'].call(action['scope'] || this, action, itemEntryKey, itemEntry);
                    }
                    else {

                        if (typeof this[action['action']] === 'function') {
                            this[action['action']](action, itemEntryKey, itemEntry);
                        }
                    }
                }
            }
            event.stop(evt);
        },
        getStore: function() {
            var store = new SDataStore({
                service: App.services['crm'],
                resourceKind: this.resourceKind,
                contractName: this.contractName,
                scope: this
            });
            return store;
        },
        getQueryOptions: function() {
            var whereExpression = '', startIndex;
            if (this.hasOwnProperty('where')) {
                if (typeof this.where === 'function') {
                    whereExpression = this.where(this.parentEntry);
                } else {
                    whereExpression = this.where;
                }
            }
            
            var queryOptions = {
                count: this.pageSize || 1,
                start: 0,
                select: this.select || '',
                where: whereExpression,
                sort: this.sort || ''
            };
            
            return queryOptions;
        },
        fetchData: function() {
            var queryResults, startIndex;
            if (this.startIndex < 1) {
                this.startIndex = 1;
            }
            this.queryOptions.start = this.startIndex-1;
            queryResults = this.store.query(null, this.queryOptions);
            this.startIndex = this.startIndex > 0 && this.pageSize > 0 ? this.startIndex + this.pageSize : 1;
            return queryResults;
        },
        onInit: function() {
            this._isInitLoad = true;
            this.store = this.store || this.getStore();
            this.queryOptions = this.queryOptions || this.getQueryOptions();

            if (this.autoLoad) {
                this.onLoad();
            }
        },
        getItemEntry: function(entryid){
            var i, len, entry;
            entry = null;
            if (this._itemEntries) {
                len = this._itemEntries.length;
                for (i = 0; i < len; i++) {
                    if (this._itemEntries[i][this.relatedItemKeyProperty] === entryid) {
                        entry = this._itemEntries[i];
                        return entry;
                    }
                }
            }
            return entry;
        },
        getItemDescriptor: function(entry) {
            return (entry)? entry.$descriptor: '';
        },
        getRowItemCls: function(entry) {

        },
        insertItem: function(entry, options) {
            var store, addOptions, request;
            store = this.get('store');
            if (store) {
                addOptions = {
                    overwrite: false
                };
                Deferred.when(store.add(entry, addOptions),
                    lang.hitch(this, this.onInsertSuccess, entry, options),
                    lang.hitch(this, this.onInsertFailed, options)
                );
            }
        },
        onInsertSuccess: function(entry, options, result) {
            if (options && options.onSuccess) {
                options.onSuccess.call(options.scope || this, entry);
            }

        },
        onInsertFailed: function(options, result) {
            if (options && options.onFailed) {
                options.onFailed.call(options.scope || this, result);
            }
        },
        UpdateItem: function(entry, options) {
            var store, putOptions;
            store = this.get('store');
            if (store) {
                putOptions = {
                    overwrite: true,
                    id: store.getIdentity(entry)
                };
                Deferred.when(store.put(entry, putOptions),
                    lang.hitch(this, this.onUpdateSuccess, entry, options),
                    lang.hitch(this, this.onUpdateFailed, options)
                );
            }
        },
        onUpdateSuccess: function(entry, options, result) {
            if (options && options.onSuccess) {
                options.onSuccess.call(options.scope || this, entry);
            }

        },
        onUpdateFailed: function(options, result){
            if (options && options.onFailed) {
                options.onFailed.call(options.scope || this, result);
            }
        },
        onLoad: function() {
            var data;
            if (this.relatedData) {

                if (typeof this.relatedData === 'function') {
                    data = this.relatedData(this.parentEntry);
                } else {
                    data = this.relatedData;
                }
                if (data) {
                    this.relatedResults = { total: data.length };
                    this.pageSize = data.length;
                    this.onApply(data);
                }

            }else if(this.parentCollection) {
                this.relatedResults = { total: this.parentEntry[this.parentCollectionProperty]['$resources'].length };
                this.pageSize = this.relatedResults.total;
                this.onApply(this.parentEntry[this.parentCollectionProperty]['$resources']);
            } else {

                if (!this.loadingNode) {
                    this.loadingNode = domConstruct.toDom(this.loadingTemplate.apply(this));
                    domConstruct.place(this.loadingNode, this.relatedViewNode, 'last', this);
                }
                domClass.toggle(this.loadingNode, 'loading');
                if (this.wait) {
                    return;
                }
                this.relatedResults = this.fetchData();
                (function(context, relatedResults) {

                    try {
                        when(relatedResults, lang.hitch(context, function(relatedFeed) {
                            this.onApply(relatedFeed);
                        }));
                    }
                    catch (error) {
                        console.log('Error fetching related view data:' + error);
                    }
                })(this, this.relatedResults);
            }
            this.isLoaded = true;
        },
        onApply: function(relatedFeed) {
            var i, relatedHTML, itemEntry, itemNode, headerNode, footerNode, itemsNode, itemHTML, moreData, restCount, moreCount ;
            try {

                if (!this._itemEntries) {
                    this._itemEntries = [];
                }
                this._itemEntries = this._itemEntries.concat(relatedFeed);
                if (!this.itemsNode) {
                    this.itemsNode = domConstruct.toDom("<div id='itemsNode' class='items'><div>");
                    domConstruct.place(this.itemsNode, this.relatedViewNode, 'last', this);
                }
                if (relatedFeed.length > 0) {
                    domClass.remove(this.containerNode, 'hidden');
                    domClass.remove(this.tabNode, 'collapsed');
                    this.itemCount = this.itemCount + relatedFeed.length;
                    restCount = this.relatedResults.total - this.itemCount;
                    if (restCount > 0) {
                        moreCount = (restCount >= this.pageSize) ? this.pageSize : restCount;
                        moreData = string.substitute(this.selectMoreDataText, [moreCount, this.relatedResults.total]);
                    } else {
                        moreData = '';
                    }
                    if (this.showSelectMore) {
                        domAttr.set(this.selectMoreNode, { innerHTML: moreData });
                    } else {
                        domAttr.set(this.selectMoreNode, { innerHTML: '' });

                    }
                    if (this.showTotalInTab) {
                        domAttr.set(this.titleNode, { innerHTML: this.title + "  " + string.substitute(this.totalCountText, [this.relatedResults.total]) });
                    }
                    for (i = 0; i < relatedFeed.length; i++) {
                        itemEntry = relatedFeed[i];
                        itemEntry['$descriptor'] = itemEntry['$descriptor'] || relatedFeed['$descriptor'];
                        itemHTML = this.relatedViewRowTemplate.apply(itemEntry, this);
                        itemNode = domConstruct.toDom(itemHTML);
                        on(itemNode, 'click', lang.hitch(this, this.onSelectViewRow));
                        domConstruct.place(itemNode, this.itemsNode, 'last', this);
                        if ((this.enableItemActions )&&(this.itemActions)) {
                            this.createItemActions(this.itemActions, itemNode, itemEntry);
                        }
                    }
                    
                } else {
                    if (this.hideWhenNoData) {
                        domClass.add(this.containerNode, 'hidden');
                    }
                    else {
                        domClass.remove(this.containerNode, 'hidden');
                    }
                    domConstruct.place(this.nodataTemplate.apply(this.parentEntry, this), this.itemsNode, 'last');
                    if (this.showTotalInTab) {
                        domAttr.set(this.titleNode, { innerHTML: this.title + "  " + string.substitute(this.totalCountText, [0, 0]) });
                    }
                    domAttr.set(this.selectMoreNode, { innerHTML: "" });
                    if (this._isInitLoad) {
                        this._isInitLoad = false;
                        domClass.toggle(this.tabNode, 'collapsed');
                    }
                }
                domClass.toggle(this.loadingNode, 'loading');
                if (this.autoScroll) {
                    this.footerNode.scrollIntoView();
                }
            }
            catch (error) {
                console.log('Error applying data for related view widget:' + error);
            }

        },
        toggleView: function(evt) {

            if (this.onlyDrillToListView) {

                this.onNavigateToList();
            }

            domClass.toggle(this.tabNode, 'collapsed');

            if (!this.isLoaded) {
                this.onLoad();
            }
            this.footerNode.scrollIntoView();
            evt.stopPropagation();
        },
        onSelectViewRow: function(evt) {
            var relatedKey, descriptor, options, view;

            relatedKey = evt.currentTarget.attributes['data-relatedkey'].value;
            descriptor = evt.currentTarget.attributes['data-descriptor'].value; 

            options = {
                descriptor: descriptor,
                key: relatedKey,
                title: descriptor
            };

            if (this.enableItemActions) {
                this.onDrillToDetail(evt);
            } else {
                this.navigateToDetailView(relatedKey, descriptor, descriptor);
            }
            
            evt.stopPropagation();
        },
        onDrillToDetail: function(evt) {
            var el = evt.currentTarget;
            array.forEach(
                 query('.item-actions', el),
                function(node) {
                    domClass.toggle(node, 'hidden');
                });
            this.onShowItemDetail(evt);
        },
        onShowItemDetail: function(evt) {
            if (!this.showItemDetail) {
                var el = evt.currentTarget;
                array.forEach(
                     query('.item-detail', el),
                    function(node) {
                        domClass.toggle(node, 'hidden');
                    });
            }
            
        },
       onViewItemActions: function(evt) {
            array.forEach(
                 query('.item-actions', this.domNode),
                function(node) {
                    domClass.toggle(node, 'hidden');
                });
            // evt.stopPropagation();
        },
        onSelectMoreData: function(evt) {
            this.onLoad();
            evt.stopPropagation();
        },
        onRefreshView: function(evt) {
            this._onRefreshView();
            evt.stopPropagation();
        },
        onAddItem: function() {

           this.navigateToInsertView();

        }, 
        onDeleteItem: function() {

        },
        onEditItem: function(action, entryKey, entry) {
            var view = App.getView(this.editViewId);

            if (view) {
                view.show({ title: this.getItemDescriptor(entry), key: entryKey });
            }
        },
        onDrillToDetailView: function(action, entryKey, entry) {
          
            this.navigateToDetailView(entryKey, entry.$descriptor, entry.$descriptor);

        },
        navigateToDetailView: function(entrykey, descriptor, title) {
            var view, options;

             view = App.getView(this.detailViewId);
             options = {
                key: entrykey,
                descriptor: descriptor,
                title: title
            };

            if (view) {
                view.show(options);
            } 
        },
        navigateToInsertView: function() {
            var view, options;

            view = App.getView(this.insertViewId);
            options = {
                insert:true
            };

            if (view) {
                view.show(options);
            }
        },
        onNavigateToList: function(evt) {
            var options, view, whereExpression;

            if (this.hasOwnProperty('listViewWhere')) {
                if (typeof this.listViewWhere === 'function') {
                    whereExpression = this.listViewWhere(this.parentEntry);
                } else {
                    whereExpression = this.listViewWhere;
                }
            } else {
                if (this.hasOwnProperty('where')) {
                    if (typeof this.where === 'function') {
                        whereExpression = this.where(this.parentEntry);
                    } else {
                        whereExpression = this.where;
                    }
                }
            }

            options = {
                descriptor: this.title,
                where: whereExpression,
                title: this.title
            };

            view = App.getView(this.listViewId);
            if (view) {
                view.show(options);
            }
            evt.stopPropagation();
        },
       _onRefreshView: function() {
            var view, nodes;

            if (this.itemsNode) {
                domConstruct.destroy(this.itemsNode);
                this.itemsNode = null;
            }
            this.startIndex = 1;
            this.itemCount = 0;
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
            this.inherited(arguments);
        }
    });
});
