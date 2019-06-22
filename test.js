var fs = require('fs');
var babel = require('babel-core');
var vincePlugin = require('./plugin');

// read the code from this file
fs.readFile('index.js', function(err, data) {
  if(err) throw err;

  // convert from a buffer to a string
  var src = data.toString();

  // use our plugin to transform the source
  var out = babel.transform(src, {
    plugins: [
        [vincePlugin, {
            name: 'vince'
        }]
    ]
  });

  // print the generated code to screen
  console.log(out.code);
});