var ByteBase = require('./bytebase.js');
var bytebase = new ByteBase('database');

let name = 'dogs';
let labels = ['legs', 'weight', 'height', 'length', 'borks'];
let types = [ ByteBase.TYPE_INT,
              ByteBase.TYPE_FLOAT,
              ByteBase.TYPE_FLOAT,
              ByteBase.TYPE_FLOAT,
              ByteBase.TYPE_FLOAT, ];

  bytebase.createTable(name, labels, types);
  bytebase.initTable(name, true);
  bytebase.print();

// populate
let pop = 10;
for (let i=0; i<pop; i++)
    bytebase.append(name, [i, Math.random()*40, Math.random()*3, Math.random()*5, Math.random()*9001]);

// set callback and end writing
bytebase.endWriting(name, ()=>{
    // iterate from dog 1 to dog 4
    bytebase.iterate(name, (vals) => {
        for (let i=0; i<vals.length; i++)
            console.log(labels[i]+': '+vals[i]);
    }, 1, 4);
});
