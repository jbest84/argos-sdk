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
    'dojo/_base/lang',
    'Sage/Platform/Mobile/Models/PropertyManager',

], function(
    declare,
    lang,
    PropertyManager
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
        actions: null,

        constructor: function(o) {
            lang.mixin(this, o);

        },
        init: function(){

            this._initProperties();
            this._initRelationships();
            this._initActions();
        },
        _initProperties: function() {
            this.createProperties();
            if (!this.properties) {
                this.properties = [];
            }
            this.properties.push({
                name: 'CreateUser',
                displayName: 'CreateUser',
                propertyName: 'CreateUser',
                type: 'User',
                //adapterMap: { 'SData': { dataPath: 'CreateUser' } },
            });
            this.properties.push({
                name: 'CreateDate',
                displayName: 'CreateDate',
                propertyName: 'CreateDate',
                type: 'DateTime'
            });
            this.properties.push({
                name: 'ModifyUser',
                displayName: 'ModifyUser',
                propertyName: 'ModifyUser',
                type: 'User',
                //adapterMap: { 'SData': { dataPath: 'ModifyUser' } },
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
        _initActions: function () {
            this.createActions();

        },
        createRelationships: function(){
            if (!this.relationships) {
                this.relationships = [];
            }
        },
        createProperties: function() {

        },
        createActions: function () {
            if (!this.actions) {
                this.actions = [];
            }
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
        getDescriptor: function(entity) {
            var self = this
            if(!this._desciptorProperties){
                this._desciptorProperties = [];
                this.properties.forEach(function(prop) {
                    if (!prop.disabled && prop.isDescriptor) {
                        self._desciptorProperties.push(prop);
                    }
                });
            }
            var description = [];
            this._desciptorProperties.forEach(function(prop) {
                if (entity[prop.propertyName]) {
                    description.push( entity[prop.propertyName]);
                }
            });
            if (description.length > 0) {
                return description.join(' ');
            }
            return entity && entity['$descriptor'];
        },
        getPropertyType: function(prop){
            var propType = null;
            if (!this._propertyTypes) { 
                this._propertyTypes = {};
            }
            propType = this._propertyTypes[prop.type];
            if(!propType){
                propType = PropertyManager.getProperty(prop.type);
            }
            return propType;
        },
        getPropertyValue: function(property, entity) {
            var relationship, value = null;            
            value = entity[property.propertyName];
            return value;
        },
        getRelationship:function(name){
            var relationship = null;
            this.relationships.forEach(function(rel){
                if(rel.name === name){
                    relationship = rel;
                }
            
            }.bind(this));
            return relationship;
        },
        getPropertyTemplate: function(prop, entity, options) {
            var template, value, propType;
            propType = this.getPropertyType(prop);
            value = this.getPropertyValue(prop, entity);
            if (value) {
                if (prop.relationship) {
                    template = this.getRelatedTemplate(prop, propType, value, options);
                } else {
                    template = propType.getTemplate(value);
                }
            }
            return template;
        },
        getRelatedTemplate: function(prop, propType, relatedEntity, options) {
            var model, rel, template, value, propType;
            rel = this.getRelationship(prop.relationship);
            template = [];
            if (rel && rel.type === 'ManyToOne') {
                relModel = App.ModelManager.getModel(rel.childEntity);
                if (relModel) {
                    relModel.properties.forEach(function(prop) {
                        var include= false, _template = null;
                        
                        if (options.forList && prop.showInList) {
                            include = true;
                        }
                        if (options.forDetail && prop.showInDetail) {
                            include = true;
                        }
                        if (include) {
                            _template = relModel.getPropertyTemplate(prop, relatedEntity, options)
                            if (_template) {
                                template.push(_template);
                            }
                        }

                    }.bind(this));
                }
            }
            return new Simplate(template).apply();
        },
        getListActions: function(){
            var actions = [];
            this.actions.forEach(function (action) {
                if (action.showInList) {
                    actions.push(action);
                }
            });
            return actions;
        },
        getDetailActions: function () {
            var actions = [];
            this.actions.forEach(function (action) {
                if (action.showInDetail) {
                    actions.push(action);
                }
            });
            return actions;
        },
        createNewEntity:function(){
            var entity = {
                entityName: this.entityName,
                tranType: 'Insert'
            };
            this.properties.forEach(function (prop) {
                if (!prop.disabled) {
                    entity[prop.propertyName] = (prop.defaultValue) ? prop.defaultValue : null;
                }
            });
            return entity;
        },
        validateEntry: function(entry) {
            
            return false;
        },
        containsEntry:function(id){
        
        }
        
        
    });
});
