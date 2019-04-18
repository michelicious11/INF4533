json_file_object = require("./")

my_obj  = json_file_object file: "test.json"


console.log "\n Running 're_test' ...\n"
console.log "Value of 'my_obj': #{JSON.stringify my_obj}"

setTimeout ->
    json_file_object.stop(my_obj)
, 3000

console.log "The program will end in seconds, once we `stop` backing up ..."
   
