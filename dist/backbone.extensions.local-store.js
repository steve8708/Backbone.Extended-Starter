(function() {
  var Backbone, store;

  Backbone = this.Backbone || typeof require === 'function' && require('backbone');

  store = {
    getItem: function(name) {
      return JSON.parse(localStorage.getItem(name));
    },
    setItem: function(name, val) {
      return localStorage.setItem(name, JSON.stringify(val));
    },
    extendItem: function(name, val) {
      return this.lsSetItem(_.extend(this.lsGetItem(name) || {}, val));
    }
  };

  Backbone.extensions.all.localStore = function(context, config, options) {
    var attrs, getStore, name, omit, setStore,
      _this = this;
    name = config.id || this.name;
    attrs = config.attributes;
    omit = config.omit;
    getStore = function(fullStateStore) {
      var currentStore, thisStore;
      currentStore = store.getItem('stateStore' || {});
      thisStore = currentStore[name] != null ? currentStore[name] : currentStore[name] = {};
      if (fullStateStore) {
        return currentStore;
      } else {
        return thisStore;
      }
    };
    setStore = function() {
      var currentStore, data;
      currentStore = getStore(true);
      data = _this.toJSON();
      if (attrs) {
        data = _.pick(data, attrs);
      }
      if (omit) {
        data = _.omit(attrs, data);
      }
      _.extend(currentStore[name], data);
      return store.setItem('stateStore', currentStore);
    };
    this.set(getStore());
    return this.on('change', setStore);
  };

}).call(this);
