/* Copyright (c) 2014, Saleslogix Software, Inc. All rights reserved.
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
 * @class Sage.Platform.Mobile.OfflineList
 * List extends _ListBase and mixes in _OfflineListMixin to provide offline support.
 * @extends Sage.Platform.Mobile._ListBase
 * @alternateClassName OfflineList
 * @requires Sage.Platform.Mobile._ListBase
 * @requires Sage.Platform.Mobile._OfflineListMixin
 */
define('Sage/Platform/Mobile/OfflineList', [
    'dojo/_base/declare',
    './_ListBase',
    './_OfflineViewMixin',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/connect',
    'dojo/query',
    'dojo/dom-attr',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/dom-geometry',
    'dojo/dom',
    'dojo/string',
    'dojo/Deferred',
    'dojo/promise/all',
    'dojo/when'

], function(
    declare,
    _ListBase,
    _OfflineViewMixin,
    lang,
    array,
    connect,
    query,
    domAttr,
    domClass,
    domConstruct,
    domGeom,
    dom,
    string,
    Deferred,
    all,
    when

) {
    return declare('Sage.Platform.Mobile.OfflineList', [_ListBase,_OfflineViewMixin], {
        actionsApplied: false,
        rowTemplate: new Simplate([
            '<li data-action="activateEntry" data-key="{%: $$.getKey($) %}" data-descriptor="{%: $$.getDescriptor($) %}">',
                '<button data-action="selectEntry" class="list-item-selector button">',
                    '{% if ($$.selectIconClass) { %}',
                        '<span class="{%= $$.selectIconClass %}"></span>',
                    '{% } else if ($$.icon || $$.selectIcon) { %}',
                        '<img src="{%= $$.icon || $$.selectIcon %}" class="icon" />',
                    '{% } %}',
                '</button>',
                '<div class="list-item-content" data-snap-ignore="true">{%! $$.itemTemplate %}</div>',
                '<div id="list-item-content-related"></div>',
            '</li>'
        ]),
        getKey: function (entity) {
            return this.layout.model.getEntityId(entity);
        },
        getDescriptor: function (entity) {
            return this.layout.model.getDescriptor(entity);
        },
        beforeTransitionTo: function () {
            this.inherited(arguments);
        },
        show: function(options, transitionOptions) {
            var tag, data;

            if (this.onShow(this) === false) {
                return;
            }

            if (this.refreshRequiredFor(options)) {
                this.refreshRequired = true;
            }

            this.options = options || this.options || {};

            this.entityName = options.entityName;
            if (this.entityName) {
                this.dataAdapter = App.DataManager.getAdapter('Local', this.entityName);
                this.layout = App.LayoutManager.getLayout('List', this.entityName);
                this.applyLayoutActions();
            }

            if (this.options.title) {
                this.set('title', this.options.title);
            } else {
                if (this.dataAdapter && this.dataAdapter.model) {
                    this.set('title', (this.dataAdapter.model.displayNamePlural + ' [Offline]' || this.titleText));
                } else {
                    this.set('title', (this.entityName + ' [Offline]' || get('title') || this.titleText));
                }
            }

            tag = this.getTag();
            data = this.getContext();

            transitionOptions = lang.mixin(transitionOptions || {}, { tag: tag, data: data });
            ReUI.show(this.domNode, transitionOptions);
        },
        requestData: function() {
            var queryOptions, queryExpression;

            domClass.add(this.domNode, 'list-loading');
            this.listLoading = true;
           
            queryOptions = {
                count: this.pageSize,
                start: this.position
            };
              
            if (this.dataAdapter) {
                this._applyStateToQueryOptions(queryOptions);
                queryExpression = this._buildQueryExpression() || null,
                queryResults = this.dataAdapter.getEntities(queryExpression, queryOptions);
                when(queryResults,
                        this._onQueryComplete.bind(this, queryResults),
                        this._onQueryError.bind(this, queryOptions)
                    );

                return queryResults;
            } else {
                console.warn('Error requesting data, no local adapter defined.');
            }
        },
        _buildQueryExpression: function() {
            self = this;
            return function(doc, emit) {
                if(doc.type === self.entityName){
                    emit(doc);
                }
            }
        },
        processData: function(data) {
            var entries,
                rowHTML,
                rowNode,
                output,
                docfrag,
                key,
                entry,
                i,
                count;

            entries = data.entities;
            count = entries.length;

            if (count > 0) {
                output = [];

                docfrag = document.createDocumentFragment();
                for (i = 0; i < count; i++) {
                    entry = this._processEntry(entries[i]);
                    // If key comes back with nothing, check that the store is properly
                    // setup with an idProperty
                    key = this.dataAdapter.getEntityId(entry);
                    this.entries[key] = entry;

                    try {
                        this.setItemTemplate(entry);
                        rowNode = domConstruct.toDom(this.rowTemplate.apply(entry, this));
                    } catch (err) {
                        console.error(err);
                        rowNode = domConstruct.toDom(this.rowTemplateError.apply(entry, this));
                    }

                    docfrag.appendChild(rowNode);
                    this.onApplyRowTemplate(entry, rowNode);
                    if (this.relatedViews.length > 0) {
                        this.onProcessRelatedViews(entry, rowNode, entries);
                    }
                }

                if (docfrag.childNodes.length > 0) {
                    domConstruct.place(docfrag, this.contentNode, 'last');
                }
            }
        },
        setItemTemplate: function (entity) {
            this.itemTemplate = new Simplate(this.layout.getHTML(entity, this));
        },
        applyLayoutActions: function() {
            if (this.actionsApplied)
            {
                return;
            }
            this.actionsApplied = true;
            var actionHtml = this.layout.getActionsHTML();
            domConstruct.place(actionHtml, this.actionsNode, 'last');
            this.actions = this.layout.getActions();
            this.enableActions = (this.actions.length > 0)?  true: false;
            
        }
        

    });
});
 
