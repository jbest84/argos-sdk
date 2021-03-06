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
 * @class argos._ServiceMixin
 * @alternateClassName _ServiceMixin
 * @deprecated
 */
import declare from 'dojo/_base/declare';
import lang from 'dojo/_base/lang';

const __class = declare('argos._ServiceMixin', null, {
  serviceMap: null,
  constructor: function constructor() {
    const map = this.serviceMap;
    if (map) {
      for (const property in map) {
        if (map.hasOwnProperty(property)) {
          if (this[property]) {
            continue; /* skip any that were explicitly mixed in */
          }

          this[property] = this._resolveService(map[property]);
        }
      }
    }
  },
  _resolveService: function _resolveService(specification) {
    if (specification && specification.type === 'sdata') {
      return App.getService(specification.name);
    }

    return App.getService(specification);
  },
});

lang.setObject('Sage.Platform.Mobile._ServiceMixin', __class);
export default __class;
