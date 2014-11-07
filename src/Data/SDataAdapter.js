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
 * @class Sage.Platform.Mobile.Data._DataAdpaterBase
 * Model is the base class for all data models. It describes all the functions a model should support giving no implementation itself, merely a shell. The one function that `_Field` does provide that most fields leave untouched is `validate`.
 *
 * 
 * @alternateClassName _DataAdapterBase

 */
define('Sage/Platform/Mobile/Data/SDataAdapter', [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'Sage/Platform/Mobile/Data/_DataAdapterBase',
    'Sage/Platform/Mobile/Data/DataManager',
    'dojo/promise/all',
    'dojo/when',
    'dojo/_base/Deferred',
    'dojo/string',
    'Sage/Platform/Mobile/Store/SData'
], function(
    declare,
    lang,
    _DataAdapterBase,
    DataManager,
    all,
    when,
    Deferred,
    string,
    SData
) {

   var adpater = declare('Sage.Platform.Mobile.Data.SDataAdapter', _DataAdapterBase, {
        /**
         * @property {String}
         * The unique (within the current form) name of the model
         */
        name: 'SData',
        displayName: 'SData',
        serviceName: false,
       /**
         * @cfg {String} resourceKind
         * The SData resource kind the view is responsible for.  This will be used as the default resource kind
         * for all SData requests.
         */
        resourceKind: '',
       /**
        * @cfg {String[]}
        * A list of fields to be selected in an SData request.
        */
        querySelect: null,
       /**
        * @cfg {String[]?}
        * A list of child properties to be included in an SData request.
        */
        queryInclude: null,
       /**
        * @cfg {String?/Function?}
        * The default resource property for an SData request.
        */
        resourceProperty: null,

       /**
        * @cfg {String?/Function?}
        * The default resource predicate for an SData request.
        */

        resourcePredicate: null,
        entityName: null,
        model: null,
        store: null,
        itemsProperty: '$resources',
        idProperty: '$key',
        labelProperty: '$descriptor',
        entityProperty: '$name',
        versionProperty: '$etag',
        constructor: function(o) {
            lang.mixin(this, o);
            this.init();
        },
        init: function(){
           var queryOptions;
           this.model = App.ModelManager.getModel(this.entityName);
           queryOptions = this.getBaseQueryOptions(this.model);
           this.service = App.services['crm'],
           this.contractName = queryOptions.contractName;
           this.resourceKind = queryOptions.resourceKind;
           this.queryInclude = queryOptions.queryInclude;
           this.querySelect = queryOptions.querySelect;
          
           this.store = new SData({
               service: this.service,
               contractName: this.contractName,
               resourceKind: this.resourceKind,
               resourceProperty: this.resourceProperty,
               resourcePredicate: this.resourcePredicate,
               include: this.queryInclude,
               select: this.querySelect,
               itemsProperty: this.itemsProperty,
               idProperty: this.idProperty,
               labelProperty: this.labelProperty,
               entityProperty: this.entityProperty,
               versionProperty: this.versionProperty,
               scope: this
           });


        },
        getEntity: function(entityId, includeRelated){
            var queryResults, relatedRequests, queryOptions, def = new Deferred();
            
            if(this.store){
                queryOptions = {
                };
                relatedRequests = [];
                queryResults = this.store.get(entityId, queryOptions);
                if (includeRelated){
                    relatedRequests = this.getRelatedRequests(entityId);
                }
                when(queryResults, function(relatedFeed) {
                    var odef = def;
                    var entity = queryResults.results[0];
                    if (relatedRequests.length > 0) {
                        all(relatedRequests).then(
                            function(relatedResults) {
                                this.applyRelatedResults(entity, relatedResults);
                                odef.resolve(entity);
                            }.bind(this),
                            function(err) {
                                odef.resolve(entity);

                            }.bind(this));
                    } else {
                        def.resolve(entity);

                    }
                }.bind(this), function(err) {
                    def.reject(err);
                }.bind(this));

                return def.promise;
            }
        },
        saveEntity: function(entity){
        
        },
        getEntities: function(options) {
            var queryResults, queryOptions, def = new Deferred();
            if (this.store) {
                queryOptions = {
                    count: (options.count) ? options.count : null,
                    start:(options.start) ? options.start : null,
                    where: (options.where) ? options.where : null,
                    sort: (options.orderBy) ? options.orderBy : null
                };

                queryResults = this.store.query(null, queryOptions);

                when(queryResults, function(entities) {
                    var results = {
                        entityName: this.entityName,
                        entities: entities
                    }
                    def.resolve(results);
                }.bind(this), function(err) {
                    def.reject(err);
                }.bind(this));

                return def.promise;
            }
        },
        getRelatedRequests:function(entityId){
            var self =  this, requests = [];
            this.model.relationships.forEach(function(rel){
                var request = null;
                if(rel.includeInParent){
                    request = self.getRelatedRequest(entityId, rel);
                    if(request){
                        requests.push(request);
                    }
                }
            });
            return requests;
        },
        getRelatedRequest: function(entityId, relationship, options) {
            var adapter, queryOptions;

            adapter = App.DataManager.getAdapter('SData', relationship.childEntity);
            if (adapter && adapter.model) {
                queryOptions = this.getRelatedQueryOptions(entityId, relationship, options);
                return adapter.getEntities(queryOptions);
            }
        },
        getRelatedQueryOptions: function(entityId, relationship, options) {
            var queryOptions, relatedPath;
            if (!options) {
                options = {};
            }
            queryOptions = {
                count: (options.count) ? options.count : null,
                start: (options.start) ? options.start : null,
                where: (options.where) ? options.where : null,
                sort: (options.orderBy) ? options.orderBy : null
            };
            relatedPath = relationship.childProperty;
            if (relationship.adapterMap && relationship.adapterMap['SData']) {
                relatedPath = relationship.adapterMap['SData'].dataPath;

            }
            queryOptions.where = string.substitute("${0} eq '${1}'", [relatedPath, entityId]);
            return queryOptions;
        },
        getBaseQueryOptions: function(model) {
            var selectOptions, queryOptions;
            selectOptions = this.getSelectOptions(model);
            queryOptions = {
                resourceKind: this.getResourceKind(model),
                contractName: this.getContract(model),
                queryInclude: selectOptions.include,
                querySelect: selectOptions.select
               
            };
            return queryOptions;

        },
        getSelectOptions: function(model) {
            var select, include, options;
            select = [];
            include = [];
            model.properties.forEach(function(prop) {
                if(prop.adapterMap){
                    map = prop.adapterMap['SData'];
                    if (map) {
                        if (prop.Type === 'Id') {
                            select.push(map.dataPath);
                        } else {
                            select.push(map.dataPath);
                        }
                    }
                } else {
                    if (!prop.isPrimaryKey) {
                        select.push(prop.propertyName);
                    }
                }
            });
            options = {
                select: select,
                include: include
            };
            return options;
        },
        getResourceKind: function(model) {
            var resourceKind = ((model.adapterMap)&&(model.adapterMap['SData']))? model.adapterMap['SData'].resourceKind : null;
            return resourceKind;
        },
        getContract: function(model) {
            var contract = ((model.adapterMap) && (model.adapterMap['SData'])) ? model.adapterMap['SData'].contractName : null;
            if (!contract) {
                contract = 'dynamic';
            }
            return contract;
        },
        applyRelatedResults: function(entity, relatedResults) {
            var relatedEntities,self;
            self= this;
            relatedEntities = [];
            relatedResults.forEach(function(result) {
                var relationship = null;
                self.model.relationships.forEach(function(rel) {
                    if(result.entityName === rel.childEntity ){
                        relationship = rel;
                    }
                });
                if (relationship) {
                    relatedEntities.push(result);
                }

            });
            entity['relatedEntities'] = relatedEntities
        },
   });
   return DataManager.register('SData', adpater);
});
