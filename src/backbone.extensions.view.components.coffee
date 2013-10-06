Backbone = @Backbone or typeof require is 'function' and require 'backbone'

components = Backbone.extensions.view.components = (context, config, options) ->
  namespace = config.namespace or 'x-'
  for key, value of Backbone.extensions.view.components
    @$el.find("#{namespace}#{key}").each (index, el) =>
      $el = $ el
      attrs = {}
      for attr in el.attributes
        attrs[camelize attr.name] = attr.value
      value.call @, $el, @, attrs

components.registerComponent = (key, value) ->
  components[key] = value

_.extend components,
  collection: ($el, view, attrs = {}) ->
    path = attrs.path or attrs.collection
    name = attrs.name
    View = config.views[ attrs.view ]
    html = $el.html()
    collectionViews = []
    $el.empty()

    unless View
      throw new Error "No view with name #{viewName} found in 'views' config"

    insertView = (model) =>
      newView = new View _.extend { data: model, html: html, view: view, \
          parent: @,  name: name, path: path, model: model }, attrs

      newView.model ?= model
      newView.set 'model', model
      @subView newView
      newView.render true

      collectionViews.push newView
      $el.append newView.$el

    bindCollection = (collection) =>
      return if not collection
      collection.each insertView
      @listenTo collection, 'add', insertView
      @listenTo collection, 'remove', (model) =>
        @childView( (view) => view.model is model ).destroy()

      @listenTo collection, 'reset', (models, options) =>
        view.destroy() for view in collectionViews
        collectionViews = []
        models.each insertView

    collection = @get path
    if collection
      bindCollection collection
    else
      @once "change:#{path}", => bindCollection @get path


  view: ($el, view, attrs) ->
    viewName = attrs.view or attrs.type
    View = config.views[ viewName ]
    name = attrs.name
    # FIXME: reactie templates won't work here beacuse no relations
    data = @get(attrs.data) or view.state

    unless View
      throw new Error "No view with name #{viewName} found in 'views' config"

    html = $el.html()
    $el.empty()

    newView = new View _.extend {
      html: html
      view: view
      name: name
      data: data
    }, attrs

    newView.render true
    @subView newView
    $el.append newView.$el

  icon: ($el, view, attrs) ->

  switch: ($el, view, attrs) ->

  log: ($el, view, attrs) ->
    out = {}
    for key, value of attrs
      out[key] = @get value
    console.info 'base-log:', out
    $el.remove()
