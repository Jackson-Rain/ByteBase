# ByteBase
A simple database framework that uses ByteBuffer to store data tables in binary.

## Usage
```javascript
var ByteBase = require('bytebase');
var bytebase = new ByteBase('database'); // 'database' is any directory name
```

### Create and append to a new table
```javascript
let tablename = 'dogs';
let labels = ['legs', 'weight', 'height', 'length'];
let types = [ ByteBase.TYPE_INT,
              ByteBase.TYPE_FLOAT,
              ByteBase.TYPE_FLOAT,
              ByteBase.TYPE_FLOAT ];
let scruffy = [1, 23.1, 2.42, 3.68];
let wiggles = [4, 13.6, 1.01, 7.9];
let bartholomew = [2, 180.6, 6.12, 2.4];

// create and open table for writing
bytebase.createTable(tablename, labels, types);
bytebase.initTable(tablename, true);
bytebase.print(); // prints all table keys to console

// append a bunch of dogs and then end the writeStream
bytebase.append(tablename, scruffy);
bytebase.append(tablename, wiggles);
bytebase.append(tablename, bartholomew);
bytebase.endWriting(tablename).then((result) => {
    // called when writing finishes
});
```

### Access an existing table
```javascript
let start = 1, numRows = 2;
byteBase.initTable(tablename);
bytebase.iterate(tablename, (vals) => {
    for (let i=0; i<vals.length; i++)
        console.log(labels[i]+': '+vals[i]);
}, start, numRows);
```
