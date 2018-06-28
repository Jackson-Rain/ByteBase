var ByteBase = require('./bytebase.js');
var bytebase = new ByteBase('database');
bytebase.VERBOSE = true;

let name = 'dogs';
let labels = ['legs', 'weight', 'height', 'length'];
let types = [ ByteBase.TYPE_INT,
              ByteBase.TYPE_FLOAT,
              ByteBase.TYPE_FLOAT,
              ByteBase.TYPE_FLOAT, ];

  bytebase.createTable(name, labels, types);
  bytebase.initTable(name, true);
  bytebase.print();

// populate
let pop = 10;
for (let i=0; i<pop; i++)
    bytebase.append(name, [i, Math.random()+1, Math.random()+2, Math.random()+3]);

// set callback and end writing
bytebase.endWriting(name, ()=>{
    // iterate from dog 1 to dog 4
    bytebase.iterate(name, (vals) => {
        for (let i=0; i<vals.length; i++)
            console.log(labels[i]+': '+vals[i]);
    }, 0, 9);
});
