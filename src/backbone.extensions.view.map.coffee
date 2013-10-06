Backbone = @Backbone or typeof require is 'function' and require 'backbone'

Backbone.extensions.view.map = (view, config) ->
  return unless @map

  for key, val of @map
    do (key, val) =>
      @set key, @lookup val
      # FIXME: if key is 'foo.bar' listen for changes on 'foo' too
      @on "parent:change:#{val}", (event, model, value) => @set key, value

  null