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
 * @class Sage.Platform.Mobile.Models.Properties.Property
 
 * @alternateClassName _PropertylBase
 * @requires Sage/Platform/Mobile/Models/Properties/_PropertyBase
 */
define('Sage/Platform/Mobile/Models/Properties/Email', [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'Sage/Platform/Mobile/Models/Properties/_PropertyBase',
    'Sage/Platform/Mobile/Models/PropertyManager'
], function(
    declare,
    lang,
    _PropertyBase,
    PropertyManager
) {

    var prop = declare('Sage.Platform.Mobile.Models.Properties.Email', _PropertyBase, {
        
        
        /**
         * @property {String}
         * The unique (within the current form) name of the model
         */
        name: 'Email',
        displayName: 'Email',
        dataType: 'String',
        size:64,
        constructor: function(o) {
            lang.mixin(this, o);

        }
    });
    return PropertyManager.register('Email', prop);
});
