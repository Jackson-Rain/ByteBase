const VERBOSE = true;

const ByteBase = require('./bytebase.js');
var bb = new ByteBase('test', {littleEndian: false});
bb.VERBOSE = true;

let testing = false;
let queue = [];
// test loop
function testLoop() {
  setTimeout(testLoop, 1000);
  if (testing) return;
  
  testing = true;
  if (queue.length > 0) {
    test(queue[0].types, queue[0].multi, true);
    queue.shift();
  } else {
    //random test 
    let numTypes = Math.floor(Math.random() * ByteBase.TYPE_SIZES.length);
    let types = [];
    for (;numTypes >= 0; numTypes--) types.push(Math.floor(Math.random() * ByteBase.TYPE_SIZES.length));
    let mul = 1 + Math.floor(Math.random()*5);
    test(types, mul, true); // mul of 1-5
  }
}

// test some different combinations of data types and a range of rowsizes
function test(types, mult, clear) {
  let typestr = ByteBase.TYPES;
  if (!mult) mult = 1;
  let name = '';
  for (let m=0; m<mult; m++)
    for (let i=0; i<types.length; i++) 
      name += typestr[types[i]];
  name += '_'+mult;

  let labels = [];
  for (let i=0; i<types.length; i++) labels.push(typestr[types[i]]);
  bb.deleteTable(name, labels, types);
  bb.createTable(name, labels, types);
  bb.initTable(name, true);
  if (VERBOSE) bb.print();
  
  // write 32 rows to table
  for (let i=0; i<32; i++) {
    let vals = [];
    for (let j=0; j<types.length; j++)
        vals.push(i+types[j]);
    bb.append(name, vals);
  }

  // end writing & test
  bb.endWriting(name)
    .then((result) => {
    
      let broke = false;
      let n = 0;
      bb.iterate(name, (vals) => {
        for (let i=0; i<types.length; i++)
          if (!broke && vals[i] != n + types[i]) {
            broke = true;
            console.log("Types broke: %d + %d != %d", n, types[i], vals[i]);
          }
        n++;
      }).then((result) => {
        if (broke) console.log(name+" failed at row: "+n);
        testing = false;
      });

    }).then((res) => {

    });
}


testLoop();
