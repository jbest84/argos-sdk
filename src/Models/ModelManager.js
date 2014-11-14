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

/**
 * @class Sage.Platform.Mobile.ModelManager
 * Field Manager is a registry for field types that enables the Edit View layouts to
 * simply define `type: 'myFieldType'`.
 * @alternateClassName FieldManager
 * @singleton
 */
define('Sage/Platform/Mobile/Models/ModelManager', [
    'dojo/_base/lang',
    'Sage/Platform/Mobile/Models/_ModelBase'
], function(
    lang,
    _ModelBase
) {
    var _store = {};
    return lang.setObject('Sage.Platform.Mobile.Models.ModelManager', {
        /**
         * @property {Object}
         * The type map that translates string type names to constructor functions
         */
        
        types: _store,
        /**
         * Registers a field type by providing a unique name and the constructor to be called
         * @param {String} name Unique string name of field, will be what is used in Edit View layouts.
         * @param {Function} ctor Constructor function of field
         */
        register: function(name, ctor) {
            _store[name] ={ctor: ctor, instance: null};
            return ctor;
        },
        /**
         * Retrieves a constructor for the given field name
         * @param name Unique name of field
         * @return {Function} Constructor for the given field type
         */
        get: function(name) {
            return _store[name];
        },
        init: function() {

        },
        getModel:function(name){
            var instance, model;
            instance = null;
            model = _store[name];
            if (!model) {
                model = _store['_Base'];
                if (!model) {
                    instance = new _ModelBase();
                    instance.init();
                    _store['_Base'] = { instance: instance };
                } else {
                    instance = model.instance;
                }
            }
            else if (model.instance) {
                instance = model.instance;
            } else {
                if (model.ctor) {
                    instance = new model.ctor();
                    instance.init();
                    model.instance = instance;
                    _store[name] = model;
                }
            }
            return instance;
        }
    });
});
