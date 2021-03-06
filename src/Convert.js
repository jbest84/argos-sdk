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
 * @class argos.Convert
 * Convert provides a number of type transformation functions.
 * @alternateClassName convert
 * @singleton
 */
import lang from 'dojo/_base/lang';

const trueRE = /^(true|T)$/i;
const isoDate = /(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|(-|\+)(\d{2}):(\d{2})))?/;
const jsonDate = /\/Date\((-?\d+)(?:(-|\+)(\d{2})(\d{2}))?\)\//;
let __class;

function pad(n) {
  return n < 10 ? '0' + n : n;
}

__class = lang.setObject('argos.Convert', {
  /**
   * Takes a string and checks to see if it is `true` or `T`, else returns false
   * @param {String} value String bool value
   * @return {Boolean} Returns true if string is `true` or `T`.
   */
  toBoolean: function toBoolean(value) {
    return trueRE.test(value);
  },
  /**
   * Takes a string and checks to see if it is an ISO formatted date or a JSON-string date
   *
   * ISO Date: `'2012-08-28'` or `'2012-05-28T08:30:00Z'`
   * JSON-string: `'/Date(1346189868885)/'`
   *
   * @param {String} value String to be checked to see if it's a date.
   * @return {Boolean} True if it matches ISO or JSON formats, false if not a string or doesn't match.
   */
  isDateString: function isDateString(value) {
    if (typeof value !== 'string') {
      return false;
    }

    return isoDate.test(value) || jsonDate.test(value);
  },
  /**
   * Takes a Date object and converts it to a ISO 8601 formatted string
   * @param {Date} value Date to be formatted
   * @return {String} ISO 8601 formatted date string
   */
  toIsoStringFromDate: function toIsoStringFromDate(value) {
    // adapted from: https://developer.mozilla.org/en/JavaScript/Reference/global_objects/date
    return value.getUTCFullYear() + '-' + pad(value.getUTCMonth() + 1) + '-' + pad(value.getUTCDate()) + 'T' + pad(value.getUTCHours()) + ':' + pad(value.getUTCMinutes()) + ':' + pad(value.getUTCSeconds()) + 'Z';
  },
  /**
   * Takes a Date object and returns it in JSON-string format: `'/Date(milliseconds)/'`
   * @param {Date} value Date to stringify
   * @return {String} JSON string: `'/Date(milliseconds)/'`
   */
  toJsonStringFromDate: function toJsonStringFromDate(value) {
    return '/Date(' + value.getTime() + ')/';
  },
  /**
   * Takes a string and tests it to see if its an ISO 8601 string or a JSON-string.
   * If a match is found it is parsed into a Date object and returned, else the original value is returned.
   * @param {String} value String in the ISO 8601 format `'2012-08-28T08:30:00Z'` or JSON-string format `'/Date(milliseconds)/'`
   * @return {Date} Date object from string or original object if not convertable.
   */
  toDateFromString: function toDateFromString(v) {
    let value = v;

    if (typeof value !== 'string') {
      return value;
    }

    let match;
    let utc;

    if ((match = jsonDate.exec(value))) {
      utc = new Date(parseInt(match[1], 10));

      // todo: may not be needed
      /*
      if (match[2])
      {
          h = parseInt(match[3]);
          m = parseInt(match[4]);

          if (match[2] === '-')
              utc.addMinutes((h * 60) + m);
          else
              utc.addMinutes(-1 * ((h * 60) + m));
      }
      */

      value = utc;
    } else if ((match = isoDate.exec(value))) {
      utc = moment(new Date(Date.UTC(
        parseInt(match[1], 10),
        parseInt(match[2], 10) - 1, // zero based
        parseInt(match[3], 10),
        parseInt(match[4] || 0, 10),
        parseInt(match[5] || 0, 10),
        parseInt(match[6] || 0, 10)
      )));

      if (match[8] && match[8] !== 'Z') {
        const h = parseInt(match[10], 10);
        const m = parseInt(match[11], 10);

        if (match[9] === '-') {
          utc.add({
            minutes: ((h * 60) + m),
          });
        } else {
          utc.add({
            minutes: (-1 * ((h * 60) + m)),
          });
        }
      }

      value = utc.toDate();
    }

    return value;
  },
});

lang.setObject('Sage.Platform.Mobile.Convert', __class);
export default __class;
