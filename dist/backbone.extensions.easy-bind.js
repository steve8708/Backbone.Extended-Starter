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
