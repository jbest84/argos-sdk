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
 * @class Sage.Platform.Mobile._OfflineViewMixin
 *
 * Extends view
 *
 * @alternateClassName _OfflineViewMixin
**/
define('Sage/Platform/Mobile/_OfflineViewMixin', [
    'dojo/_base/declare',
     'dojo/_base/lang',

], function(
    declare,
    lang
) {
    return declare('Sage.Platform.Mobile._OfflineViewMixin', null, {
        dataAdapter:null,
        
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
            }

            if (this.options.title) {
                this.set('title', this.options.title);
            } else {
                if (this.dataAdapter && this.dataAdapter.model) {
                    this.set('title', (this.dataAdapter.model.displayName + ' [Offline]' || this.titleText));
                } else {
                    this.set('title', (this.entityName + ' [Offline]' || get('title') || this.titleText));
                }
            }
           
            tag = this.getTag();
            data = this.getContext();

            transitionOptions = lang.mixin(transitionOptions || {}, { tag: tag, data: data });
            ReUI.show(this.domNode, transitionOptions);
        },
        

    });
});

