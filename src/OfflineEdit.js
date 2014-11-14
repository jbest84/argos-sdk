/* Copyright (c) 2014, Saleslogix Software, Inc. All rights reserved.
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
 * @class Sage.Platform.Mobile.OfflineList
 * List extends _ListBase and mixes in _OfflineListMixin to provide offline support.
 * @extends Sage.Platform.Mobile._DetailBase
 * @alternateClassName _OfflineDetail
 * @requires Sage.Platform.Mobile._DetailBase
 * @requires Sage.Platform.Mobile._OfflineDetailMixin
 */
define('Sage/Platform/Mobile/OfflineEdit', [
    'dojo/_base/declare',
    './_EditBase',
    './_OfflineViewMixin'
], function(
    declare,
    _EditBase,
    _OfflineViewMixin
) {
    return declare('Sage.Platform.Mobile.OfflineEdit', [_EditBase, _OfflineViewMixin], {

        

        init: function () {

            if (this.entityName) {
                this.dataAdapter = App.DataManager.getAdapter('Local', this.entityName);
                this.initLayout();
            }

            this.inherited(arguments);

        },
        requestData: function () {
            var store, getOptions, getExpression, getResults;
            store = this.get('store');

            if (store) {
                getOptions = {};

                this._applyStateToGetOptions(getOptions);

                getExpression = this._buildGetExpression() || null;
                getResults = store.get(getExpression, getOptions);

                Deferred.when(getResults,
                    this._onGetComplete.bind(this),
                    this._onGetError.bind(this, getOptions)
                );

                return getResults;
            }

            console.warn('Error requesting data, no store was defined. Did you mean to mixin _SDataEditMixin to your edit view?');
        },
        initLayout: function () {

            this.layout = [];



        }


    });
});
 
