json-file-object
================

A mockup of a db for a single "JSON"-able object, periodically stored
in a file so it can be recovered after restart.

To install, do

    > npm install json-file-object

Example
-------

    var json_file_object = require("json-file-object");
    var my_obj = json_file_object();

The reference stored in variable `my_obj` is saved to the file
`file_object.json` every 5 secs.  If the file exists, the object under
the reference is initialized with the JSON parsed content of the file,
if not it is initialized to `{}`.

The above defaults (for the file name, the interval, or the initial value) can be
specified by the parameters passed to the constructor function
returned by `json_file_object = require("json-file-object")`. I.e.,
`var my_obj = json_file_object()` really means:

    var my_obj = json_file_object({value:{}, file:"json_file_object.json", saveEverySecs:5, forceNew:false});

If flag `forceNew` is set, the old content of the file is ignored and the initial value of the returned object is set by the first argument.

The generator function returned by `require("json-file-object")`, called
here `json_file_object`, has following methods:

* `json_file_object.stop(obj)` - stops recording `obj` to its file
* `json_file_object.stopAll()` - stops all recordings
* `json_file_object.erase(obj)` - stops recording `obj` and erases the corresponding file
* `json_file_object.eraseAll()` - stops all recordings and erases all corresponding files


For more info, look into the code `index.coffee` and tests
`test.coffee`, `re_test.coffee`, which are probably shorter than that
document.

Warnings!
--------

You ___can not___ reassign a new reference to `my_obj` and hope that the new value will be persisted. For example, if you do

    my_obj = ["Hey"];

the old reference kept by `my_obj` is lost, so any change to `my_obj`, such as

    my_obj.push("Ho");

will not be persisted (because the value under the old reference is being persisted). The logic here is somehow similar to `exports` and  `module.exports`.

Also, notice that in order to properly terminate the `node` process
using `json-file-object` you will need to stop "persisting", e.g., by
calling `json_file_object.stopAll()`.
