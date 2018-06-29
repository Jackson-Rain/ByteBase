'use strict';

const fs = require('fs');
const ByteBuffer = require("bytebuffer");

module.exports = ByteBase;
function ByteBase(path) {
    module.exports.VERBOSE = false;
    this.writeStreams = {};
    this.tableNames = [];
    this.tableKeys = {};
    // format path before setting
    path = path.replace('\\', '/');
    if (!path.endsWith('/')) path += '/';
    this.path = path;
    
    // create path dirs
    let pfields = this.path.split('[\\/]');
    for (let i=0; i<pfields.length; i++) {
        let dir = "";
        for (let j=0; j<=i; j++) dir += pfields[j];
        try { fs.mkdirSync(dir); }
        catch (err) { if (err.code != 'EEXIST') throw(err); }
    }
}

module.exports = ByteBase;
// type enumerations
module.exports.TYPE_BYTE   = 0;
module.exports.TYPE_INT    = 1;
module.exports.TYPE_FLOAT  = 2;
module.exports.TYPE_LONG   = 3;
// 0 means null-terminated
module.exports.TYPE_SIZES = [1,4,4,8]; 

/** creates folder, and table key file */
ByteBase.prototype.createTable = function(name, labels, types) {
    let dir = this.path + "/" + name + "/";
    // err if table exists
    if (fs.existsSync(dir+'key.txt')) throw "Table \'"+name+"\' already exists!";

    // create dir and write labels+types to dir/key.txt
    try { fs.mkdirSync(dir); }
    catch (err) { if (err.code != 'EEXIST') throw(err); }
    
    // key.txt can just be a csv, lets be nice
    let o = labels[0];
    for (let i=1; i<labels.length; i++) o += ','+labels[i];
    for (let i=0; i<labels.length; i++) o += ','+types[i];
    fs.writeFileSync(dir+'key.txt', o);
};

/** loads key and opens requested streams for writing or reading */
ByteBase.prototype.initTable = function(name, writing) {
    let dir = this.path + name + '/';
    // parse table key
    let key = fs.readFileSync(dir+'key.txt', { encoding: 'utf8' });
    let fields = key.split(',');
    let labels = []; 
    let types = [];
    let rowSize = 0;
    let length = fields.length / 2;
    for (let i=0; i<length; i++) {
        labels.push(fields[i]);
        types.push(parseInt(fields[length+i], 10));
        rowSize += module.exports.TYPE_SIZES[types[i]];
    } 
    
    this.tableNames.push(name);
    this.tableKeys[name] = {
        labels: labels,
        types: types,
        rowSize: rowSize,
    };

    // open file writer
    if (writing && !this.writeStreams[name]) 
        this.writeStreams[name] = fs.createWriteStream(dir+'data.bin');
}

/** delete table folder including key.txt and data.bin */
ByteBase.prototype.deleteTable = function(name) {
    // the function is only named deleteTable for clarity
    const deleteRecursive = function(path) {
        if (!fs.existsSync(path)) return false;
        fs.readdirSync(path).forEach(function(file, index) {
            let curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) deleteRecursive(curPath);
            else fs.unlinkSync(curPath);
        });
        fs.rmdirSync(path);
        return true;
    };

    deleteRecursive(this.path + name);
};

/** add row(s) to table with given name */
ByteBase.prototype.append = function(tablename, values) {
    if (!this.writeStreams[tablename]) 
        throw 'Must call initTable(\'name\', true) before writing.';

    let key = this.tableKeys[tablename];
    let rows = values.length / key.labels.length;
    if (rows % 1 != 0) throw 'Wrong number of values.';
    let bb = new ByteBuffer();
    for (let i=0; i<values.length; i++) {
        switch (key.types[i % key.labels.length]) {
            case module.exports.TYPE_BYTE: bb.writeByte(values[i]); break;
            case module.exports.TYPE_INT: bb.writeInt(values[i]); break;
            case module.exports.TYPE_FLOAT: bb.writeFloat(values[i]); break;
            case module.exports.TYPE_LONG: bb.writeLong(values[i]); break;
        }
    } 
    bb.flip();

    // write
    let buf = bb.buffer;
    if (key.rowSize <= 16) buf = bb.buffer.slice(0, key.rowSize);
    this.writeStreams[tablename].write(buf);
};

/** iterate table with given name, calling callback on rows */
ByteBase.prototype.iterate = function(name, callback, rowOffset, numRows) {
    return new Promise((resolve, reject) => {
        let fpath = this.path + name + '/data.bin';
        let key = this.tableKeys[name];
        let data = '';

        // create stream options reflecting rowOffset/numRows
        let streamOptions = {};
        if (arguments.length > 2) {
            streamOptions.start = rowOffset * key.rowSize;
            if (arguments.length > 3) 
                streamOptions.end = streamOptions.start + numRows * key.rowSize - 1;
        } if (module.exports.VERBOSE) console.log('streamOptions: %j', streamOptions);

        let readStream = fs.createReadStream(
            this.path + name + '/data.bin',
            streamOptions);
        readStream.setEncoding('binary');
        readStream.on('data', function(chunk) {  
            if (module.exports.VERBOSE) console.log('CHUNK SIZE: '+chunk.length);
            data += chunk;
            let numRows = Math.floor(data.length / key.rowSize);
            if (numRows == 0) return 0;

            let rowData = Buffer.from(data.substring(0, numRows*key.rowSize), 'binary');
            let bb = ByteBuffer.wrap(rowData);
            for (let i=0; i<numRows; i++) {
                let vals = [];
                for (let j=0; j<key.types.length; j++)
                    switch (key.types[j]) {
                        case module.exports.TYPE_BYTE: vals.push(bb.readByte()); break;
                        case module.exports.TYPE_INT: vals.push(bb.readInt()); break;
                        case module.exports.TYPE_FLOAT: vals.push(bb.readFloat()); break;
                        case module.exports.TYPE_LONG: vals.push(bb.readLong()); break;
                    }
                callback(vals);
            }
            data = data.substring(numRows * key.rowSize);
        }).on('end', function() {
            if (module.exports.VERBOSE) console.log('Done iterating '+name+'!'+' '+data.length);
            if (data.length > 0) throw "Iterating table \'%s\' finished with trailing data of incomplete row";
            resolve("SUCCESS");
        });
        
    });
};

/** print column names and data types for all tables */
ByteBase.prototype.print = function() {
    let types = ['b', 'i', 'f', 'l'];
    let o = '~~~~~~~~ByteBase~~~~~~~~\n';
    o += 'path: ' + this.path + '\n';
    o += '--------\n';
    for (let k=0; k<this.tableNames.length; k++) {
        o += 'table: ' + this.tableNames[k] + '\n';
        let key = this.tableKeys[this.tableNames[k]];
        for (let l=0; l<key.types.length; l++) {
            o += ' ' + key.labels[l] + '(';
            o += types[key.types[l]] + ')\n';
        }
    }
    o += '~~~~~~~~~~~~~~~~~~~~~~~~';
    console.log(o);
};

/** end open writestreams */
ByteBase.prototype.endWriting = function(tablename) {
    // for specific tables, return promise
    if (tablename)
        return new Promise((resolve, reject) => {
            // ensure that writeStreams[name] is deleted before resolving
            let ended = false, done = false;
            this.writeStreams[tablename].on('finish', ()=>{ 
                ended = true;
                if (true || done) resolve();
            });
            this.writeStreams[tablename].end();
            delete this.writeStreams[tablename];
            done = true;
            //if (ended) resolve();
        });
    // or release all tables with no promises
    let keys = Object.keys(this.writeStreams);
    for (let i=0; i<keys.length; i++) {
        this.writeStreams[keys[i]].end();
        delete this.writeStreams[keys[i]];
    }
};
