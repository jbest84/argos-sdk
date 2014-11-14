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

define('Sage/Platform/Mobile/Data/LocalAdapter', [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'Sage/Platform/Mobile/Data/_DataAdapterBase',
    'Sage/Platform/Mobile/Data/DataManager',
    'Sage/Platform/Mobile/Store/PouchDB',
    'dojo/promise/all',
    'dojo/when',
    'dojo/_base/Deferred'

], function(
    declare,
    lang,
    _DataAdapterBase,
     DataManager,
     PouchDB,
     all,
     when,
     Deferred

) {
    var adpater = declare('Sage.Platform.Mobile.Data.LocalAdapter', _DataAdapterBase, {
      
        name: 'Local',
        displayName: 'Local',
        entityName: null,
        model: null,
        store: null,
        databaseName: '',
        constructor: function(o) {
            lang.mixin(this, o);
            this.init();
        },
        init: function(){
          
            this.model = App.ModelManager.getModel(this.entityName);
            this.store = new PouchDB({databaseName: this.databaseName});

        },
        getEntityId: function(entity) {
            return this.model.getEntityId(entity);
        },
        saveEntity:function(entity){
            if(entity.relatedEntities){
                this.saveRelatedEntities(entity.relatedEntities);
                entity.relatedEntities = null;
            }
            var doc = this.model.wrap(entity);
            this.store.add(doc);
        },
        getEntity: function(entityId) {
            var returnPromise, options;  def = new Deferred();
            options = {};
            this.store.get(entityId, options).then(function(doc) { 
                var entity = this.model.unwrap(doc.key);
                def.resolve(entity);
            }.bind(this), function(err) {
                def.reject(err);
            }.bind(this));
            return def;
        },
        saveRelatedEntities: function(relatedEntities) {
            relatedEntities.forEach(function(related) {
                var adapter = App.DataManager.getAdapter('Local', related.entityName);
                if (adapter && adapter.model) {
                    related.entities.forEach(function(entity){
                        adapter.saveEntity(entity);
                    });
                }
            });
        },
        removeEntity: function(entityId){
            return store.remove(id);
        
        },
        getEntities: function(expression, queryOptions) {
            var options; def = new Deferred();
            options = {};
            this.store.query(expression, queryOptions).then(function(results) {
                var self, i, queryResults = { total: 0, entities: [] };
                self = this
                i = 0;
                results.forEach(function(doc) {
                    var entity = self.model.unwrap(doc.key);
                    i++;
                    queryResults.entities.push(entity);
                });
                queryResults.total = i;
                def.resolve(queryResults);
            }.bind(this), function(err) {
                def.reject(err);
            }.bind(this));
            return def;
        },
        getEntityDescription: function(entity) {
            if (this.model) {
                return this.model.getEntityDescription(entity);
            }
            return entity && entity['$descriptor'];
        }

    });
    return DataManager.register('Local', adpater);
});
