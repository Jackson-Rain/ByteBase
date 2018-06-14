# ByteBase
A simple database framework that uses ByteBuffer to store data tables in binary.

## Usage
```javascript
var ByteBase = require('bytebase');
var bytebase = new ByteBase();
```

### Create and append to a new table
```javascript
let name = 'dogs';
let labels = ['legs', 'weight', 'height', 'length'];
let types = [ ByteBase.TYPE_INT,
              ByteBase.TYPE_FLOAT,
              ByteBase.TYPE_FLOAT,
              ByteBase.TYPE_FLOAT ];
bytebase.createTable(name, labels, types);
bytebase.initTable(name, true, false);
bytebase.print(); // prints table header to console

// append a one-legged dog and release bytebuffer
bytebase.append(name, [1, 23.1, 2.42, 3.68]);
bytebase.release();
```

### Access an existing table
```javascript
byteBase.initTable(name, false, true);
bytebase.iterate(name, (vals) => {
    for (let i=0; i<vals.length; i++)
        console.log(labels[i]+': '+vals[i]);
});
bytebase.release();
```
