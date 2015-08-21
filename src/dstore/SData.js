import declare from 'dojo/_base/declare';
import Store from 'dstore/Store';
import Deferred from 'dojo/Deferred';
import utility from '../Utility';
import convert from '../Convert';

export default declare('argos.dstore.SData', [Store], {
  doDateConversion: false,
  scope: null,
  where: null,
  select_: null,
  include: null,
  orderBy: null,
  service: null,
  request: null,
  queryName: null,
  queryArgs: null,
  entityName: null,
  contractName: null,
  resourceKind: null,
  resourceProperty: null,
  resourcePredicate: null,
  applicationName: null,
  dataSet: null,
  executeQueryAs: null,
  executeGetAs: null,

  // Store properties
  idProperty: '$key',
  Model: null,
  get: function get(id, options) {
    const def = new Deferred();
    const request = this._createEntryRequest(id, options || {});
    const method = this.executeGetAs ? request[this.executeGetAs] : request.read;
    method.call(request, {
      success: (entry) => {
        def.resolve(this.doDateConversion ? this._handleDateConversion(entry) : entry);
      },
      failure: (xhr, xhrOptions) => {
        const error = new Error('An error occurred getting: ' + xhrOptions.url);
        error.xhr = xhr;
        error.status = xhr.status;
        error.aborted = false;
        error.url = xhrOptions.url;
        def.reject(error);
      },
      aborted: (xhr, xhrOptions) => {
        const error = new Error('An error occurred getting: ' + xhrOptions.url);

        error.xhr = xhr;
        error.status = 0;
        error.responseText = null;
        error.aborted = true;

        def.reject(error);
      },
    });
    return def.promise;
  },
  add: function add(object, options = {}) {
    options.overwrite = false;
    return this.put(object, options);
  },
  put: function put(object, options) {
    const id = options.id || this.getIdentity(object);
    const entity = options.entity || this.entityName;
    const version = options.version || this.getVersion(object);
    const atom = !this.service.isJsonEnabled();

    if (id) {
      object.$key = id;
    }

    if (entity && atom) {
      object.$name = entity;
    }

    if (version) {
      object.$etag = version;
    }

    const def = new Deferred();
    const request = this._createEntryRequest(id, options);
    const method = options.overwrite ? request.update : request.create;

    method.call(request, object, {
      success: (entry) => {
        def.resolve(this.doDateConversion ? this._handleDateConversion(entry) : entry);
      },
      failure: (xhr, xhrOptions) => {
        const error = new Error('An error occurred putting: ' + xhrOptions.url);
        error.xhr = xhr;
        error.status = xhr.status;
        error.aborted = false;
        error.url = xhrOptions.url;
        def.reject(error);
      },
      aborted: (xhr, xhrOptions) => {
        const error = new Error('An error occurred putting: ' + xhrOptions.url);
        error.xhr = xhr;
        error.status = 0;
        error.responseText = null;
        error.aborted = true;
        def.reject(error);
      },
    });

    return def.promise;
  },
  remove: function remove(id) {
    console.dir(arguments);
  },
  fetch: function fetch() {
    const queryLog = this.queryLog || [];
    console.dir(arguments);
  },
  fetchRange: function fetchRange(options) {
    console.dir(arguments);
  },
  select: function select(props) {// eslint-disable-line
    console.dir(props);
  },
  _createEntryRequest: function _createEntryRequest(identity, getOptions) {
    let request = utility.expand(this, getOptions.request || this.request);
    let id = identity;
    if (request) {
      request = request.clone();
    } else {
      id = id || utility.expand(this.scope || this, getOptions.resourcePredicate || this.resourcePredicate);

      const contractName = utility.expand(this.scope || this, getOptions.contractName || this.contractName);
      const resourceKind = utility.expand(this.scope || this, getOptions.resourceKind || this.resourceKind);
      const dataSet = utility.expand(this.scope || this, getOptions.dataSet || this.dataSet);
      const resourceProperty = utility.expand(this.scope || this, getOptions.resourceProperty || this.resourceProperty);
      let resourcePredicate;

      if (id) {
        resourcePredicate = /\s+/.test(id) ? id : `'${id}'`;
      }

      if (resourceProperty) {
        request = new Sage.SData.Client.SDataResourcePropertyRequest(this.service)
          .setResourceProperty(resourceProperty)
          .setResourceSelector(resourcePredicate);
      } else {
        request = new Sage.SData.Client.SDataSingleResourceRequest(this.service)
          .setResourceSelector(resourcePredicate);
      }

      if (contractName) {
        request.setContractName(contractName);
      }

      if (resourceKind) {
        request.setResourceKind(resourceKind);
      }

      if (dataSet) {
        request.setDataSet(dataSet);
      }
    }

    const select = utility.expand(this.scope || this, getOptions.select || this.select);
    const include = utility.expand(this.scope || this, getOptions.include || this.include);

    if (select && select.length > 0) {
      request.setQueryArg('select', select.join(','));
    }

    if (include && include.length > 0) {
      request.setQueryArg('include', include.join(','));
    }

    return request;
  },
  _handleDateConversion: function _handleDateConversion(entry) {
    for (const prop in entry) {
      if (convert.isDateString(entry[prop])) {
        entry[prop] = convert.toDateFromString(entry[prop]);
      }
    }

    return entry;
  },
});
