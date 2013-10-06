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

(function() {
  var Backbone, DOMEventList, bindEvents, camelize, capitalize, dasherize,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Backbone = this.Backbone || typeof require === 'function' && require('backbone');

  DOMEventList = 'blur focus focusin focusout load resize scroll\
  unload click dblclick mousedown mouseup mousemove mouseover\
  mouseout mouseenter mouseleave change select submit keydown\
  keypress keyup error touchstart touchend touchmove'.split(/\s+/);

  camelize = function(str) {
    return str.replace(/[^\d\w]+(.)?/g, function(match, chr) {
      if (chr) {
        return chr.toUpperCase();
      } else {
        return '';
      }
    });
  };

  capitalize = function(str) {
    if (str) {
      return str[0].toUpperCase() + str.substring(1);
    } else {
      return '';
    }
  };

  dasherize = function(str) {
    return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/_/g, '-').toLowerCase();
  };

  Backbone.EasyBind = {};

  bindEvents = function(context) {
    var $document, $window, ctx, eventBindingName, eventName, eventNamespace, key, val, value, _ref,
      _this = this;
    $window = $(window);
    $document = $(document);
    eventNamespace = "easyBindEvents-" + context.cid;
    _ref = {
      document: $document,
      window: $window
    };
    for (ctx in _ref) {
      val = _ref[ctx];
      for (key in context) {
        value = context[key];
        if (key.indexOf(("on" + (capitalize(ctx))) === 0)) {
          eventName = key.substring(ctx.length + 2).toLowerCase();
          eventBindingName = "" + eventName + "." + eventNamespace;
          val.on(eventBindingName, value && value.bind(context));
        }
      }
    }
    context.on('destroy', function() {
      $window.off(eventNamespace);
      return $document.off(eventNamespace);
    });
    return conext.on('all', function() {
      var args, camelized, event, method, methodName;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      camelized = camelize(event);
      methodName = "on" + (camelized[0].toUpperCase()) + (camelized.substring(1));
      method = context[methodName];
      if (method) {
        return method.apply(context, args);
      }
    });
  };

  Backbone.extensions.all.easyBind = function(context, config) {
    var _this = this;
    bindEvents(this);
    if (this instanceof Backbone.View) {
      return this.on('all', function() {
        var args, callback, camelSplit, event, key, selector, value, _ref, _results;
        event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        _results = [];
        for (key in _this) {
          value = _this[key];
          if (key.indexOf('on') === 0) {
            camelSplit = key.match(/[A-Z][a-z]+/);
            event = camelSplit[0];
            if (event && (_ref = event.toLowerCase, __indexOf.call(DOMEventList, _ref) >= 0)) {
              callback = typeof value === 'function' ? value : _this[value];
              if (callback && key.length === event.length + 2) {
                _results.push(_this.$el.on("" + event + ".delegateEvents", callback));
              } else {
                selector = dasherize(camelSplit.slice(1));
                _results.push(_this.$el.on("" + event + ".delegateEvents", "." + selector, callback));
              }
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
    }
  };

}).call(this);

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

(function() {
  var Backbone;

  Backbone = this.Backbone || typeof require === 'function' && require('backbone');

  Backbone.extensions.view.inherit = function(view, config) {
    var attr, _i, _len, _ref, _results,
      _this = this;
    _ref = config.bind;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      attr = _ref[_i];
      _results.push((function(attr) {
        var domAttr;
        domAttr = dasherize(attr);
        _this.$el.attr("data-" + domAttr, _this.get(attr));
        return _this.on("change:" + attr, function(model, value) {
          return _this.$el.attr("data-" + domAttr, value);
        });
      })(attr));
    }
    return _results;
  };

}).call(this);

(function() {
  var Backbone, components;

  Backbone = this.Backbone || typeof require === 'function' && require('backbone');

  components = Backbone.extensions.view.components = function(context, config, options) {
    var key, namespace, value, _ref, _results,
      _this = this;
    namespace = config.namespace || 'x-';
    _ref = Backbone.extensions.view.components;
    _results = [];
    for (key in _ref) {
      value = _ref[key];
      _results.push(this.$el.find("" + namespace + key).each(function(index, el) {
        var $el, attr, attrs, _i, _len, _ref1;
        $el = $(el);
        attrs = {};
        _ref1 = el.attributes;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          attr = _ref1[_i];
          attrs[camelize(attr.name)] = attr.value;
        }
        return value.call(_this, $el, _this, attrs);
      }));
    }
    return _results;
  };

  components.registerComponent = function(key, value) {
    return components[key] = value;
  };

  _.extend(components, {
    collection: function($el, view, attrs) {
      var View, bindCollection, collection, collectionViews, html, insertView, name, path,
        _this = this;
      if (attrs == null) {
        attrs = {};
      }
      path = attrs.path || attrs.collection;
      name = attrs.name;
      View = config.views[attrs.view];
      html = $el.html();
      collectionViews = [];
      $el.empty();
      if (!View) {
        throw new Error("No view with name " + viewName + " found in 'views' config");
      }
      insertView = function(model) {
        var newView;
        newView = new View(_.extend({
          data: model,
          html: html,
          view: view,
          parent: _this,
          name: name,
          path: path,
          model: model
        }, attrs));
        if (newView.model == null) {
          newView.model = model;
        }
        newView.set('model', model);
        _this.subView(newView);
        newView.render(true);
        collectionViews.push(newView);
        return $el.append(newView.$el);
      };
      bindCollection = function(collection) {
        if (!collection) {
          return;
        }
        collection.each(insertView);
        _this.listenTo(collection, 'add', insertView);
        _this.listenTo(collection, 'remove', function(model) {
          return _this.childView(function(view) {
            return view.model === model;
          }).destroy();
        });
        return _this.listenTo(collection, 'reset', function(models, options) {
          var _i, _len;
          for (_i = 0, _len = collectionViews.length; _i < _len; _i++) {
            view = collectionViews[_i];
            view.destroy();
          }
          collectionViews = [];
          return models.each(insertView);
        });
      };
      collection = this.get(path);
      if (collection) {
        return bindCollection(collection);
      } else {
        return this.once("change:" + path, function() {
          return bindCollection(_this.get(path));
        });
      }
    },
    view: function($el, view, attrs) {
      var View, data, html, name, newView, viewName;
      viewName = attrs.view || attrs.type;
      View = config.views[viewName];
      name = attrs.name;
      data = this.get(attrs.data) || view.state;
      if (!View) {
        throw new Error("No view with name " + viewName + " found in 'views' config");
      }
      html = $el.html();
      $el.empty();
      newView = new View(_.extend({
        html: html,
        view: view,
        name: name,
        data: data
      }, attrs));
      newView.render(true);
      this.subView(newView);
      return $el.append(newView.$el);
    },
    icon: function($el, view, attrs) {},
    "switch": function($el, view, attrs) {},
    log: function($el, view, attrs) {
      var key, out, value;
      out = {};
      for (key in attrs) {
        value = attrs[key];
        out[key] = this.get(value);
      }
      console.info('base-log:', out);
      return $el.remove();
    }
  });

}).call(this);

(function() {
  var Backbone;

  Backbone = this.Backbone || typeof require === 'function' && require('backbone');

  Backbone.extensions.view.inherit = function(view, config) {
    var path, _fn, _i, _len, _ref,
      _this = this;
    if (!this.inherit) {
      return;
    }
    _ref = this.inherit;
    _fn = function(path) {
      _this.set(path, _this.lookup(path));
      return _this.on("parent:change:" + path, function(event, model, value) {
        return _this.set(path, value);
      });
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      path = _ref[_i];
      _fn(path);
    }
    return null;
  };

}).call(this);

(function() {
  var Backbone, Children, Event, method, _i, _j, _len, _len1, _ref, _ref1,
    __slice = [].slice;

  Backbone = this.Backbone || typeof require === 'function' && require('backbone');

  Backbone.extensions.view.manage = function(context, config, options) {
    var _this = this;
    this.on('all', function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _this.broadcast.apply(_this, args);
      return _this.emit.apply(_this, args);
    });
    if (this.children == null) {
      this.children = new Children(this.options.children || []);
    }
    return {
      emit: function() {
        var args, event, eventName, name, newEvent, parent, _i, _len, _ref, _results;
        eventName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        parent = this.parent;
        if (parent) {
          if (/^(child:|request:)/.test(eventName)) {
            event = args[0];
            if (event == null) {
              event = new Event({
                type: eventName,
                target: this
              });
            }
            if (!event.propagationStopped) {
              event.currentTarget = parent;
              return parent.trigger.apply(parent, arguments);
            }
          } else if (!/^(app:|parent:|firstChild:|firstParent:)/.test(eventName)) {
            name = uncapitalize(this.name);
            event = new Event({
              name: eventName,
              target: this,
              currentTarget: parent
            });
            _ref = ["child:" + eventName, "child:" + name + ":" + eventName, "firstChild:" + eventName, "firstChild:" + name + ":" + eventName];
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              newEvent = _ref[_i];
              _results.push(parent.trigger.apply(parent, [newEvent, event].concat(__slice.call(args))));
            }
            return _results;
          }
        }
      },
      broadcast: function() {
        var args, child, event, eventName, name, newEvent, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
        eventName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if (this.children) {
          if (/^(parent:|app:)/.test(eventName)) {
            event = args[0] || new Event({
              type: eventName,
              target: this
            });
            if (!event.propagationStopped) {
              event.currentTarget = child;
              _ref = this.children;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                child = _ref[_i];
                if (event.propagationStopped) {
                  return;
                }
                child.trigger.apply(child, arguments);
              }
            }
          } else if (!/^(child:|request:|firstParent:|firstChild:)/.test(eventName)) {
            name = uncapitalize(this.name);
            event = new Event({
              name: eventName,
              target: this
            });
            _ref1 = this.children;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              child = _ref1[_j];
              event.currentTarget = child;
              _ref2 = ["parent:" + eventName, "parent:" + name + ":" + eventName, "firstParent:" + eventName, "firstParent:" + name + ":" + eventName];
              for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                newEvent = _ref2[_k];
                if (event.propagationStopped) {
                  return;
                }
                child.trigger.apply(child, [newEvent, event].concat(__slice.call(args)));
              }
            }
          }
        }
      },
      destroy: function() {
        this.trigger('destroy');
        if (this.cleanup) {
          this.cleanup();
        }
        this.$el.removeData('view');
        this.$el.off();
        this.off();
        this.stopListening();
        this.undelegateEvents();
        this.remove();
        if (this.parent) {
          return this.parent.children.splice(this.parent.children.indexOf(this), 1);
        }
      },
      subView: function() {
        var args, name, view;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (!args[1]) {
          if (typeof args[0] === 'string') {
            return this.childView(args[0]);
          } else {
            view = args[0];
          }
        } else {
          view = args[1];
          name = args[0];
        }
        if (!view) {
          console.warn('No view passed to subView', args, arguments);
          return;
        }
        if (!(view instanceof Backbone.View)) {
          view = new view;
        }
        view.__viewName__ = name;
        view.parent = this;
        this.children.push(view);
        return view;
      },
      insertView: function(selector, view) {
        if (!view) {
          view = selector;
          selector = null;
        }
        this.subView(view);
        if (selector) {
          this.$(selector).append(view.$el);
        } else {
          this.$el.append(view.$el);
        }
        return this;
      },
      parentView: function(arg, findOne) {
        return this.parentViews(arg, findOne);
      },
      findView: function(arg) {
        return this.findViews(arg, true);
      },
      childView: function(arg) {
        return this.childViews(arg, true);
      },
      destroyView: function(arg, all) {
        var child;
        child = all ? this.findView(arg) : this.childView(arg);
        if (child) {
          child.destroy();
        }
        return child;
      },
      destroyViews: function(arg, all) {
        var child, children, _i, _len;
        children = all ? this.findViews(arg) : this.childViews(arg);
        for (_i = 0, _len = children.length; _i < _len; _i++) {
          child = children[_i];
          child.destroy();
        }
        return children;
      },
      childViews: function(arg, findOne) {
        return this.findViews(arg, findOne, true);
      },
      parentViews: function(arg, findOne) {
        var parent, res;
        res = [];
        if (!arg) {
          if (findOne) {
            return this.parent;
          } else {
            res.push(this.parent);
          }
        } else {
          parent = this;
          while (parent = parent.parent) {
            if (parent.is && parent.is(arg)) {
              if (findOne) {
                return parent;
              } else {
                res.push(parent);
              }
            }
          }
        }
        return res;
      },
      findViews: function(arg, findOne, shallow) {
        var foundView, recurse, views;
        views = [];
        foundView = void 0;
        recurse = function(view) {
          var childView, _i, _len, _ref, _results;
          _ref = view.children;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            childView = _ref[_i];
            if (childView.is(arg)) {
              views.push(childView);
              if (findOne) {
                foundView = childView;
                break;
              }
            }
            if (childView && !shallow) {
              _results.push(recurse(childView));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
        recurse(this);
        if (findOne) {
          return foundView;
        } else {
          return views;
        }
      },
      is: function(arg) {
        var key, name, str, strip, thisKey, value;
        if (!arg || arg === this) {
          return true;
        }
        switch (typeof arg) {
          case 'string':
            strip = function(str) {
              return str.toLowerCase().replace(/view$/i, '');
            };
            str = strip(arg);
            name = this.__viewName__;
            return strip(this.name || "") === str || strip(name || '') === str;
          case 'function':
            return !!arg(this);
          default:
            for (key in arg) {
              value = arg[key];
              thisKey = this.get(key);
              if (thisKey == null) {
                thisKey = this[key];
              }
              if (value !== thisKey) {
                return false;
              }
            }
            return true;
        }
      },
      lookup: function(keypath) {
        var parent, value;
        parent = this;
        while (parent = parent.parent) {
          value = parent.get(keypath);
          if (value != null) {
            return value;
          }
        }
      }
    };
  };

  Event = (function() {
    function Event(options) {
      this.options = options;
      _.extend(this, this.options);
      if (this.currentTarget == null) {
        this.currentTarget = this.target;
      }
    }

    Event.prototype.preventDefault = function() {
      return this.defaultPrevented = true;
    };

    Event.prototype.stopPropagation = function() {
      return this.propagationStopped = true;
    };

    return Event;

  })();

  Children = (function() {
    function Children(items, options) {
      if (options == null) {
        options = {};
      }
      this.reset(items, options);
      if (!options.noState) {
        addState(this);
      }
      if (_.isFunction(this.initialize)) {
        this.initialize.apply(this, arguments);
      }
    }

    Children.prototype.unshift = function() {
      var item, items, _i, _len, _ref, _results;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = items.reverse();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _results.push(this.add(item, {
          at: 0
        }));
      }
      return _results;
    };

    Children.prototype.push = function() {
      var item, items, _i, _len, _results;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        _results.push(this.add(item, {
          at: this.length
        }));
      }
      return _results;
    };

    Children.prototype.shift = function() {
      return this.remove(null, {
        at: 0
      });
    };

    Children.prototype.pop = function() {
      return this.remove(null, {
        at: this.length - 1
      });
    };

    Children.prototype.empty = function() {
      return this.splice(0, Infinity);
    };

    Children.prototype.eventNamespace = 'child:';

    Children.prototype.bubbleEvents = true;

    Children.prototype.reset = function(items, options) {
      if (options == null) {
        options = {};
      }
      this.splice(this.length, this.length);
      this.push.apply(this, items);
      if (!options.silent) {
        return this.trigger('reset', this, options);
      }
    };

    Children.prototype.add = function(item, options) {
      var at,
        _this = this;
      if (options == null) {
        options = {};
      }
      at = options.at != null ? options.at : options.at = this.length;
      if (this.bubbleEvents && item && _.isFunction(item.on)) {
        this.listenTo(item, 'all', function() {
          var args, eventName;
          eventName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          if (_this.bubbleEvents) {
            return _this.trigger.apply(_this, ["" + _this.eventNamespace + _this.eventName].concat(__slice.call(args)));
          }
        });
      }
      if (this.model) {
        item = new this.model(item);
      }
      this.splice(at, null, item);
      if (!options.silent) {
        return this.trigger('add', item, this, options);
      }
    };

    Children.prototype.remove = function(item, options) {
      var index;
      if (options == null) {
        options = {};
      }
      index = options.at || this.indexOf(item);
      if (item == null) {
        item = this[index];
      }
      this.splice(index, 1);
      if (!options.silent) {
        this.trigger('remove', item, this, options);
      }
      item;
      return this.stopChildrenening(item);
    };

    return Children;

  })();

  _.extend(Children.prototype, Backbone.Events);

  _ref = ['splice', 'indexOf', 'lastIndexOf', 'join', 'reverse', 'sort', 'valueOf', 'map', 'forEach', 'every', 'reduce', 'reduceRight', 'filter', 'some'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    method = _ref[_i];
    if (!Children.prototype[method]) {
      Children.prototype[method] = arr[method];
    }
  }

  _ref1 = ['each', 'contains', 'find', 'filter', 'reject', 'contains', 'max', 'min', 'sortBy', 'groupBy', 'sortedIndex', 'shuffle', 'toArray', 'size', 'first', 'last', 'initial', 'rest', 'without', 'isEmpty', 'chain', 'where', 'findWhere', 'clone', 'pluck', 'invoke'];
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    method = _ref1[_j];
    if (!Children.prototype[method]) {
      Children.prototype[method] = _[method];
    }
  }

}).call(this);

(function() {
  var Backbone;

  Backbone = this.Backbone || typeof require === 'function' && require('backbone');

  Backbone.extensions.view.map = function(view, config) {
    var key, val, _fn, _ref,
      _this = this;
    if (!this.map) {
      return;
    }
    _ref = this.map;
    _fn = function(key, val) {
      _this.set(key, _this.lookup(val));
      return _this.on("parent:change:" + val, function(event, model, value) {
        return _this.set(key, value);
      });
    };
    for (key in _ref) {
      val = _ref[key];
      _fn(key, val);
    }
    return null;
  };

}).call(this);

(function() {
  var Backbone, global;

  Backbone = this.Backbone || typeof require === 'function' && require('backbone');

  global = this;

  Backbone.extensions.view.ractive = function(context, config, options) {
    var adaptor, filters, key, parent, parentName, parents, template, templateName, templateObject, val, value, _i, _len, _ref,
      _this = this;
    filters = _.clone(config.filters);
    for (key in filters) {
      value = filters[key];
      if (value && value.bind) {
        filters[key] = value.bind(this);
      }
    }
    templateName = "src/templates/views/" + (dasherize(this.name)) + ".html";
    templateObject = config.templateObject || {};
    template = this.template || templateObject[templateName] || this.$el.html();
    this.ractive = new Ractive({
      el: this.el,
      template: template,
      data: _.extend(this.toJSON(), {
        $view: this,
        $filter: filters
      })
    });
    for (key in this) {
      val = this[key];
      if (typeof val === 'function' && key[0] !== '_') {
        (function(key, val) {
          return _this.ractive.on(key, function(event, argString) {
            var argArray, args, stringRe;
            if (argString == null) {
              argString = '';
            }
            if (key === 'set' && !event.original) {
              return;
            }
            if (typeof argString !== 'string') {
              argString = '';
            }
            stringRe = /^(?:'(.*?)'|"(.*?)")$/;
            argArray = _.compact(argString.split(/\s*[:,]+\s*/));
            args = argArray.map(function(arg, index) {
              var deserialized, isString, keyPath, keypath;
              arg = arg.trim();
              isString = stringRe.test(arg);
              if (isString) {
                return RegExp.$1 || RegExp.$2;
              }
              deserialized = deserialize(arg);
              if (typeof deserialized !== 'string') {
                return deserialized;
              }
              if (arg === '.') {
                keypath = event.keyPath;
              } else if (arg && arg[0] === '.') {
                keypath = "" + event.keyPath + arg;
              } else {
                keyPath = arg;
              }
              return _this.get(arg);
            });
            args.push(event.original);
            return val.apply(_this, args);
          });
        })(key, val);
      }
    }
    adaptor = Ractive.adaptors.backboneAssociatedModel;
    this.ractive.bind(adaptor(this.state));
    this.ractive.bind(adaptor(currentApp.state, '$app'));
    if (currentApp.router) {
      this.ractive.bind(adaptor(currentApp.router.state, '$router'));
    }
    parents = [];
    parent = this;
    while (parent = parent.parent) {
      parents.push(parent);
    }
    for (_i = 0, _len = parents.length; _i < _len; _i++) {
      parent = parents[_i];
      parentName = uncapitalize(parent.name);
      this.ractive.bind(adaptor(parent.state, "$parent." + parentName));
    }
    _ref = currentApp.singletons;
    for (key in _ref) {
      val = _ref[key];
      if (val instanceof Base.Model || val instanceof Base.Collection) {
        this.ractive.bind(adaptor(val, "$" + key));
      }
    }
    return this.on('restroy', function() {
      _this.ractive.teardown();
      return _this.ractive.unbind();
    });
  };

}).call(this);
