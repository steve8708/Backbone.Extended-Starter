(function() {
  var Backbone;

  Backbone = this.Backbone || typeof require === 'function' && require('backbone');

  Backbone.extensions.all.computeProperties = function(context, config) {
    var key, value, _ref;
    _ref = _.extend(options.compute || {}, this.compute, config.compute);
    for (key in _ref) {
      value = _ref[key];
      this.computeProperty(key, value);
    }
    this.blacklist || (this.blacklist = []);
    return {
      computeProperty: function(name, args) {
        var callback, obj, split, trigger, _i, _len, _ref1,
          _this = this;
        args = _.clone(args);
        switch (type(args)) {
          case "object":
            obj = args;
            break;
          case "array":
            obj = {
              fn: args.pop(),
              triggers: args
            };
        }
        this.blacklist.push(name);
        callback = function() {
          var result, values;
          values = obj.triggers.map(function(trigger) {
            return _this.get(trigger);
          });
          result = obj.fn.apply(_this, values);
          return _this.set(name, result);
        };
        _ref1 = obj.triggers;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          trigger = _ref1[_i];
          this.on("change:" + trigger, callback);
          split = trigger.split('.');
        }
        try {
          return callback();
        } catch (_error) {}
      },
      toJSON: function(withBlacklist) {
        var json;
        json = this._super(withBlacklist);
        if (withBlacklist) {
          return json;
        } else {
          return _.omit(json, this.blacklist);
        }
      }
    };
  };

}).call(this);
