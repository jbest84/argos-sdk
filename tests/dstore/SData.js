define('tests/dstore/SData', [
  'dojo/_base/lang',
  'moment',
  'argos/dstore/SData'
], function(lang, moment, Store) {

  // Create a mock SData service
  function MockService(options) {
    var defaultOptions = {};
    if (!options) {
      defaultOptions = {
        callSuccess: true,
        callFailure: false,
        callAbort: false,
        data: {
          data: '123'
        }
      };
    }

    lang.mixin(this, defaultOptions, options);
  }

  MockService.prototype.readEntry = function(request, options) {
    if (this.callSuccess) {
      options.success.call(options.scope || this, this.data);
    } else if (this.callFailure) {
      options.failure.call(options.scope || this, request, options);
    } else if (this.callAbort) {
      options.aborted.call(options.scope || this, request, options);
    }
  };
  MockService.prototype.readFeed = function(request, options) {
    if (this.callSuccess) {
      options.success.call(options.scope || this, this.data);
    } else if (this.callFailure) {
      options.failure.call(options.scope || this, request, options);
    } else if (this.callAbort) {
      options.aborted.call(options.scope || this, request, options);
    }

    return this.data;
  };
  MockService.prototype.getVersion = function() {};
  MockService.prototype.getIncludeContent = function() {};
  MockService.prototype.getVirtualDirectory = function() {};
  MockService.prototype.getProtocol = function() {};
  MockService.prototype.getServerName = function() {};
  MockService.prototype.getPort = function() {};
  MockService.prototype.getApplicationName = function() {};
  MockService.prototype.getContractName = function() {};
  MockService.prototype.getDataSet = function() {};
  MockService.prototype.isJsonEnabled = function() {
    return true;
  };
  MockService.prototype.getCompact = function() {
    return true;
  };
  MockService.prototype.createEntry = function(request, data, options) {
    options.success.call(options.scope || this, data);
    return data;
  };
  MockService.prototype.updateEntry = function(request, data, options) {
    if (this.callSuccess) {
      options.success.call(options.scope || this, data);
    } else if (this.callFailure) {
      options.failure.call(options.scope || this, request, options);
    } else if (this.callAbort) {
      options.aborted.call(options.scope || this, request, options);
    }

    return data;
  };

  function MockRequest(service) {
    this.service = service || new MockService();
  }
  MockRequest.prototype.clone = function() {
    return this;
  };
  MockRequest.prototype.read = function(options) {
    this.service.readEntry(this, options);
  };
  MockRequest.prototype.setQueryArg = function() {};

  return describe('argos.dstore.SData', function() {});
});
