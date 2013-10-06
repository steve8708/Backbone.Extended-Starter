Backbone = @Backbone or typeof require is 'function' and require 'backbone'
store =
  getItem: (name) -> JSON.parse localStorage.getItem name
  setItem: (name, val) -> localStorage.setItem name, JSON.stringify val
  extendItem: (name, val) -> @lsSetItem _.extend @lsGetItem(name) or {}, val

Backbone.extensions.all.localStore = (context, config, options) ->
  name = config.id or @name # Maybe prefix names with module name
  attrs = config.attributes
  omit = config.omit

  getStore = (fullStateStore) =>
    currentStore = store.getItem 'stateStore' or {}
    thisStore = currentStore[name] ?= {}
    if fullStateStore then currentStore else thisStore

  setStore = =>
    currentStore = getStore true
    data = @toJSON()
    if attrs then data = _.pick data, attrs
    if omit  then data = _.omit attrs, data
    _.extend currentStore[name], data
    store.setItem 'stateStore', currentStore

  @set getStore()
  # FIXME: this may have performance issues on some browsers, mauy need to
  # use window unload or an interval instead if the browser is trying to
  # write to disk on every localStore.setItem
  @on 'change', setStore
