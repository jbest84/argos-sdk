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


define('Sage/Platform/Mobile/Layout/_LayoutBase', [
    'dojo/_base/declare',
    'dojo/_base/lang',

], function(
    declare,
    lang

) {

    return declare('Sage.Platform.Mobile.Layout_LayoutBase', null, {
        
        
        /**
         * @property {String}
         * The unique (within the current form) name of the layout
         */
        name: 'layoutBase',
        displayName: 'layoutBase',
        entityName: null,
        model: null,
        actionItemTemplate: new Simplate([
            '<button data-action="invokeActionItem" data-id="{%= $.actionIndex %}" aria-label="{%: $.title || $.id %}">',
                '{% if ($.cls) { %}',
                    '<span class="{%= $.cls %}"></span>',
                '{% } else if ($.icon) { %}',
                    '<img src="{%= $.icon %}" alt="{%= $.id %}" />',
                '{% } else { %}',
                    '<span class="fa fa-level-down fa-2x"></span>',
                '{% } %}',
                '<label>{%: $.label %}</label>',
            '</button>'
        ]),
        constructor: function(o) {
            lang.mixin(this, o);
            this.init();
        },
        init: function () {
            this.model = App.ModelManager.getModel(this.entityName);            
        },
       
        getHTML: function(entity, template, view) {
            return template.apply(entity, view, this);
        },
        getActionsHTML: function () {
            var actions, actionsTemplate;
            actions = this.getActions();
            actionsTemplate = [];

            for (var i = 0; i < actions.length; i++) {
                var action = actions[i],
                    options = {
                        actionIndex: i,
                        hasAccess: (!actions.security || (action.security && App.hasAccessTo(this.expandExpression(action.security)))) ? true : false
                    },
                    actionTemplate = action.template || this.actionItemTemplate;

                lang.mixin(action, options);
                actionsTemplate.push(actionTemplate.apply(action, action.id));

               // domConstruct.place(actionTemplate.apply(action, action.id), this.actionsNode, 'replace');
            }
            if (!actionsTemplate[0]) {
                actionsTemplate.push('<div></div>');
            }
            return new Simplate(actionsTemplate).apply();

        },
        getActions:function(){
            if (this.model) {
                return this.model.actions;
            }
        }
    });
});
