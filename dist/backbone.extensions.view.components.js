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
