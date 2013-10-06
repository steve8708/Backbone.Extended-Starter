Backbone = @Backbone or typeof require is 'function' and require 'backbone'
global = @

Backbone.extensions.view.ractive = (context, config, options) ->
  filters = _.clone config.filters
  for key, value of filters
    filters[key] = value.bind @ if value and value.bind

  templateName = "src/templates/views/#{dasherize @name}.html"
  templateObject = config.templateObject or {}
  template = @template or templateObject[templateName] or @$el.html()
  @ractive = new Ractive
    el: @el
    template: template
    data: _.extend @toJSON(), $view: @, $filter: filters

  for key, val of @
    if typeof val is 'function' and key[0] isnt '_'
      do (key, val) =>
        @ractive.on key, (event, argString = '') =>
          return if key is 'set' and not event.original

          argString = '' if typeof argString isnt 'string'
          stringRe = /^(?:'(.*?)'|"(.*?)")$/
          argArray = _.compact argString.split /\s*[:,]+\s*/
          args = argArray.map (arg, index) =>
            arg = arg.trim()

            isString = stringRe.test arg
            return RegExp.$1 or RegExp.$2 if isString

            deserialized = deserialize arg
            return deserialized if typeof deserialized isnt 'string'

            if arg is '.'
              keypath = event.keyPath
            else if arg and arg[0] is '.'
              keypath = "#{event.keyPath}#{arg}"
            else
              keyPath = arg

            @get arg

          args.push event.original
          val.apply @, args

  adaptor = Ractive.adaptors.backboneAssociatedModel
  @ractive.bind adaptor @state
  @ractive.bind adaptor currentApp.state, '$app'

  if currentApp.router
    @ractive.bind adaptor currentApp.router.state, '$router'

  parents = []
  parent = @
  parents.push parent while parent = parent.parent
  for parent in parents
    parentName = uncapitalize parent.name
    @ractive.bind adaptor parent.state, "$parent.#{parentName}"

  for key, val of currentApp.singletons
    if val instanceof Base.Model or val instanceof Base.Collection
      @ractive.bind adaptor val, "$#{key}"

  @on 'restroy', =>
    @ractive.teardown()
    @ractive.unbind()