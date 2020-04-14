const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
var Promise = require('bluebird');
const readFilePromise = Promise.promisify(fs.readFile);

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////
// now save in items
// save t0 dataDir
exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    //#00001 #00002  //      path/00001.txt   path/00002.tx
    fs.writeFile(exports.dataDir + `/${id}.txt`, text, (err) => {
      if (err) {
        throw ('error writing counter');
      } else {
        callback(null, { id, text }); //to make an object
      }
    });
  });
};

exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      throw ('err');
    }
    var todos = _.map(files, (file) => {
      var filePath = path.join(exports.dataDir, file);
      var id = path.basename(file, '.txt');
      return readFilePromise(filePath).then(fileData => {
        return {
          id: id,
          text: fileData.toString()
        };
      });
    });
    Promise.all(todos)
      .then(items => callback(null, items), err => callback(err));
  });
};

exports.readOne = (id, callback) => {
  //exports.dataDir + `/${id}.txt`
  fs.readFile(exports.dataDir + `/${id}.txt`, (err, fileData) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, {
        id: id,
        text: fileData.toString()
      });
    }
  });
};

exports.update = (id, text, callback) => {
  // readFile & writeFile
  // single file,
  // callback text with new text at the end.
  fs.readFile(exports.dataDir + `/${id}.txt`, (err, fileData) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(exports.dataDir + `/${id}.txt`, text, (err) => {
        callback(null, {
          id,
          text: text
        });
      });
    }
  });
};

exports.delete = (id, callback) => {
  //Remove file using Node.js
  var filepath = path.join(exports.dataDir, `${counter.reformatId(id)}.txt`);
  fs.unlink(filepath, (err) => {
    callback(err);
  });
  //The asynchronous one is fs.unlink()
  //The synchronous one is fsunlinkSync()
  // fs.readFile(exports.dataDir + `/${id}.txt`, (err, fileData) => {
  //   if (err) {
  //     callback(new Error(`No item with id: ${id}`));
  //   } else {
  //     fs.unlink(exports.dataDir + `/${id}.txt`, (err) => {
  //       callback(new Error(`No item with id: ${id}`));
  //     });
  //   }
  // });
};



// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
