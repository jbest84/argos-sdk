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
 * @class Sage.Platform.Mobile.LayoutManager
 *  Manages offline resources.
 * 
 * @alternateClassName LayoutManager
 * @singleton
 */
define('Sage/Platform/Mobile/Layout/LayoutManager', [
    'dojo/_base/lang'
], function(
    lang
) {
    var layouts = {};
    return lang.setObject('Sage.Platform.Mobile.Layout.LayoutManager', {
        
        types: layouts,
        
        register: function(name, ctor) {
            layouts[name] = ctor;
            return ctor;
        },
        init: function() {

        },
        getLayout: function(name, entityName) {
            var layout, ctor = layouts[name];
            layout = null;
            if (ctor) {
                layout = new ctor({ entityName: entityName });
            }
            return layout;
        }
    });
});
