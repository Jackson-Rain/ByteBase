var ByteBase = require('./bytebase.js');
var bytebase = new ByteBase('database');

let name = 'dogs';
let labels = ['legs', 'weight', 'height', 'length'];
let types = [ ByteBase.TYPE_INT,
              ByteBase.TYPE_FLOAT,
              ByteBase.TYPE_FLOAT,
              ByteBase.TYPE_FLOAT ];
bytebase.createTable(name, labels, types);
bytebase.initTable(name, true, true);
bytebase.print();

// populate
for (let i=0; i<10; i++)
    bytebase.append(name, [Math.round(Math.random()*4), Math.random()*40, Math.random()*3, Math.random()*5]);

// iterate and print
bytebase.iterate(name, (vals) => {
    for (let i=0; i<vals.length; i++)
        console.log(labels[i]+': '+vals[i]);
});

bytebase.release();
