Backbone = @Backbone or typeof require is 'function' and require 'backbone'

Backbone.extensions.all.computeProperties = (context, config) ->
  for key, value of _.extend options.compute or {}, @compute, config.compute
    @computeProperty key, value

  @blacklist or= []

  computeProperty: (name, args) ->
    args = _.clone args
    switch type args
      when "object" then obj = args
      when "array"  then obj = fn: args.pop(), triggers: args

    @blacklist.push name

    # TODO: don't parse all items on every update
    #    should save contexts and property getter strings
    callback = =>
      values = obj.triggers.map (trigger) => @get trigger
      result = obj.fn.apply @, values
      @set name, result

    for trigger in obj.triggers
      @on "change:#{trigger}", callback
      split = trigger.split '.'

    try
      callback()

  toJSON: (withBlacklist) ->
    json = @_super withBlacklist
    if withBlacklist then json else _.omit json, @blacklist
