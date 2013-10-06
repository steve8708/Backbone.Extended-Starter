(function() {
  var Backbone, ExtendedState, State,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  Backbone = this.Backbone || typeof require === 'function' && require('backbone');

  State = (function(_super) {
    __extends(State, _super);

    function State(defaults, options) {
      State.__super__.constructor.apply(this, arguments);
      this.parent || (this.parent = options.parent);
    }

    return State;

  })(Backbone.Model);

  ExtendedState = (function(_super) {
    __extends(ExtendedState, _super);

    function ExtendedState(defaults, options) {
      ExtendedState.__super__.constructor.apply(this, arguments);
      this.parent || (this.parent = options.parent);
    }

    return ExtendedState;

  })(Backbone.Extended.Model);

  Backbone.extensions.all.state = function(context, config, options, modelOptions) {
    var method, res, stateOptions, _fn, _i, _len, _ref,
      _this = this;
    if (this instanceof State || this instanceof ExtendedState) {
      return;
    }
    stateOptions = _.extend({}, config.options, this.stateOptions, {
      parent: this
    });
    if (config.extendedModel) {
      this.state = new ExtendedState(null, stateOptions);
    } else {
      this.state = new State(null, stateOptions);
    }
    res = {};
    if (this instanceof Backbone.Router || this instanceof Backbone.View) {
      _ref = ['get', 'set', 'toJSON', 'has', 'unset', 'escape', 'changed', 'clone', 'keys', 'values', 'pairs', 'invert', 'pick', 'omit', 'clear', 'toggle'];
      _fn = function(method) {
        return res[method] != null ? res[method] : res[method] = function() {
          var _ref1;
          return (_ref1 = this.state)[method].apply(_ref1, arguments);
        };
      };
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        method = _ref[_i];
        _fn(method);
      }
      return this.listenTo(this.state, 'all', function() {
        return _this.trigger.apply(_this, arguments);
      });
    } else {
      return this.listenTo(this.state, 'all', function() {
        var args, eventName;
        eventName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return _this.trigger.apply(_this, ["state:" + eventName].concat(__slice.call(args)));
      });
    }
  };

}).call(this);
