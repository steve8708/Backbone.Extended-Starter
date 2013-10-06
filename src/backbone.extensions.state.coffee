Backbone = @Backbone or typeof require is 'function' and require 'backbone'

class State extends Backbone.Model
  constructor: (defaults, options) ->
    super
    @parent or= options.parent

class ExtendedState extends Backbone.Extended.Model
  constructor: (defaults, options) ->
    super
    @parent or= options.parent

Backbone.extensions.all.state = (context, config, options, modelOptions) ->
  return if @ instanceof State or @ instanceof ExtendedState

  stateOptions = _.extend {}, config.options, @stateOptions, parent: @
  if config.extendedModel
    @state = new ExtendedState null, stateOptions
  else
    @state = new State null, stateOptions

  res = {}
  if @ instanceof Backbone.Router or @ instanceof Backbone.View
    for method in [
      'get', 'set', 'toJSON', 'has', 'unset', 'escape', 'changed',
      'clone', 'keys', 'values', 'pairs', 'invert', 'pick', 'omit', 'clear',
      'toggle'
    ]
      do (method) -> res[method] ?= -> @state[method] arguments...

    @listenTo @state, 'all', => @trigger arguments...
  else
    @listenTo @state, 'all', (eventName, args...) =>
      @trigger "state:#{eventName}", args...
