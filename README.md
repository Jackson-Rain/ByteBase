# ByteBase
A simple database framework that uses ByteBuffer to store data tables in binary.

## Usage
```javascript
var ByteBase = require('bytebase');
var bytebase = new ByteBase();
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

// create and open table for writing
bytebase.createTable(tablename, labels, types);
bytebase.initTable(tablename, true);
bytebase.print(); // prints table header to console
// append a one-legged dog and release bytebuffer
bytebase.append(tablename, scruffy);
bytebase.release();
```

### Access an existing table
```javascript
byteBase.initTable(tablename);
bytebase.iterate(tablename, (vals) => {
    for (let i=0; i<vals.length; i++)
        console.log(labels[i]+': '+vals[i]);
});
bytebase.release();
```
