Backbone = @Backbone or typeof require is 'function' and require 'backbone'

Backbone.extensions.view.inherit = (view, config) ->
  for attr in config.bind
    do (attr) =>
      domAttr = dasherize attr
      @$el.attr "data-#{domAttr}", @get attr
      @on "change:#{attr}", (model, value) =>
        @$el.attr "data-#{domAttr}", value