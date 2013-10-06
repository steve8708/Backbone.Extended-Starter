Backbone = @Backbone or typeof require is 'function' and require 'backbone'

Backbone.extensions.view.inherit = (view, config) ->
  return unless @inherit

  for path in @inherit
    do (path) =>
      @set path, @lookup path
      @on "parent:change:#{path}", (event, model, value) => @set path, value

  null