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
