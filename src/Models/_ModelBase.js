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
 * @class Sage.Platform.Mobile.Models._ModelBase
 * Model is the base class for all data models. It describes all the functions a model should support giving no implementation itself, merely a shell. The one function that `_Field` does provide that most fields leave untouched is `validate`.
 *
 * 
 * @alternateClassName _ModelBase
 * @requires Sage.Platform.Mobile.ModelManager
 */
define('Sage/Platform/Mobile/Models/_ModelBase', [
    'dojo/_base/declare',
    'dojo/_base/lang'
    //'Sage/Platform/Mobile/Models/PropertyManager'

], function(
    declare,
    lang
    //PropertyManager
) {

    return declare('Sage.Platform.Mobile.Models._ModelBase', null, {
        
        
        /**
         * @property {String}
         * The unique (within the current form) name of the model
         */
        name: 'baseModel',
        dispalyName: 'entity',
        displayNamePlural: 'entitities',
        entityName: 'entityName',
        properties: null,
        relationships: null,

        constructor: function(o) {
            lang.mixin(this, o);

        },
        init: function(){

            this._initProperties();
            this._initRelationships();
        },
        _initProperties: function() {
            this.createProperties();
            if (!this.properties) {
                this.properties = [];
            }
            this.properties.push({
                name: 'CreateUserId',
                displayName: 'CreateUserId',
                propertyName: 'CreateUserId',
                type: 'Id',
                adapterMap: { 'SData': { dataPath: 'CreateUser' } },
            });
            this.properties.push({
                name: 'CreateDate',
                displayName: 'CreateDate',
                propertyName: 'CreateDate',
                type: 'DateTime'
            });
            this.properties.push({
                name: 'ModifyUserId',
                displayName: 'ModifyUserId',
                propertyName: 'ModifyUserId',
                type: 'Id',
                adapterMap: { 'SData': { dataPath: 'ModifyUser' } },
            });
            this.properties.push({
                name: 'ModifyDate',
                displayName: 'ModifyDate',
                propertyName: 'ModifyDate',
                type: 'DateTime'
            });
            

        },
        _initRelationships: function() {
            this.createRelationships();

        },
        createRelationships: function(){
        
        },
        createProperties: function() {

        },
        wrap: function(entity) {
            var doc = {
                entityId: this.getEntityId(entity),
                type: this.getEntityType(entity),
                entity: entity,
                lastUpdated:  moment().toDate(),
                transType: this.getEntityTransType(entity)
            };
            return doc;
        },
        unwrap: function(doc) {
            var entity = doc['entity'];
            return entity;
        },




        getProperty: function(name) {

        },
        getRealtionship: function(name) {



        },
        getEntityId: function(entity) {
            return entity['$key']; //could be a diffrent query the metadata
        },
        getEntityType: function(entity) {
            return this.entityName;
        },
        getEntityTransType: function(entity) {
            return entity['transType'];
        },
        validateEntry: function(entry) {
            
            return false;
        },
        containsEntry:function(id){
        
        }
        
        
    });
});
