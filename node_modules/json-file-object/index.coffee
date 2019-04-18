fs = require 'fs'
ld = require 'lodash'

created_db = {}
module.exports = ({value, file, saveEverySecs, forceNew} = {}) ->
    value ?= {}
    file ?= "json_file_object.json"
    saveEverySecs ?= 5
    forceNew ?= false

    if not created_db[file]
        if not forceNew
            try
                value = JSON.parse fs.readFileSync file, 'utf8'
            catch error
                console.warn error
        interval = setInterval ->
            writeFile file, value
        , saveEverySecs * 1000
        created_db[file] = {obj:value, interval}

    return created_db[file].obj

writeFile = (file,obj) ->
    fs.writeFile file, JSON.stringify(obj, null, 2), (err) ->
        console.log err if err

module.exports.stop = (obj) ->
    file = find_file obj
    if file
        writeFile file, created_db[file].obj
        stop file

module.exports.stopAll = ->
    for file of created_db
        writeFile file, created_db[file].obj
        stop file

module.exports.erase = (obj) ->
    file = find_file obj
    erase file if file

module.exports.eraseAll = ->
    for file of created_db
        erase file

stop = (file) ->
    {interval} = created_db[file]
    clearInterval interval
    delete created_db[file]

erase = (file) ->
    stop file
    fs.unlink file

find_file = (obj) ->
    for file, val of created_db when obj is val.obj
        return file
    undefined
