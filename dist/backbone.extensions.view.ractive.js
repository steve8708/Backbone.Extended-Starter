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
