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
