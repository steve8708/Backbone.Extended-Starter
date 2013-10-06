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
