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


define('Sage/Platform/Mobile/Layout/ListLayout', [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'Sage/Platform/Mobile/Layout/LayoutManager',
    'Sage/Platform/Mobile/Layout/_LayoutBase'

], function(
    declare,
    lang,
    LayoutManager,
    _LayoutBase

) {

    var layout =  declare('Sage.Platform.Mobile.Layout.ListLayout', _LayoutBase, {

        /**
         * @property {String}
         * The unique (within the current form) name of the layout
         */
        name: 'List',
        displayName: 'List Layout',

        init: function() {
            this.model = App.ModelManager.getModel(this.entityName);
        },
        getHTML: function(entity, template, view) {
            var entityTemplete = this.getEntityTemplate(entity);
            var html = entityTemplete.apply(entity, this);
            return html;
        },
        getEntityTemplate: function(entity) {
            var template=[], propTemplate, options;
            options = {forList: true};
            this.model.properties.forEach(function(prop){
                if (prop.showInList) {
                    propTemplate = this.model.getPropertyTemplate(prop,entity, options);
                    if (propTemplate) {
                        template.push(propTemplate);
                    }
                }
            }.bind(this));
            return new Simplate(template);
        },
        getActions:function(){
            return this.model.getListActions();
        }
    });
    return LayoutManager.register('List', layout);
});
