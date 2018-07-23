var ByteBase = require('./bytebase.js');
var bytebase = new ByteBase('path/to/database');
bytebase.VERBOSE = true;

let name = 'dogs';
let labels = ['legs', 'weight', 'height'];
let types = [ ByteBase.TYPE_INT,
              ByteBase.TYPE_FLOAT,
              ByteBase.TYPE_FLOAT, ];

  bytebase.deleteTable(name);
  bytebase.createTable(name, labels, types);
  bytebase.initTable(name, true);
  bytebase.print();

// populate
let pop = 10;
for (let i=0; i<pop; i++)
    bytebase.append(name, [i, Math.random()+i*2, Math.random()+i]);

// set callback and end writing
bytebase.endWriting(name)
    .then((result) => {
        return bytebase.iterate(name, (vals) => {
            for (let i=0; i<vals.length; i++)
                console.log(labels[i]+':\t'+vals[i]);
        });
    }).then((result) => {
        console.log('someone let the dogs out');
    });
