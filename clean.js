const fs=require('fs');
const path=require('path')

var uploadsDir =path.join(__dirname+'/upload');
var pdf_qr =path.join(__dirname+'/pdf_qr');
var img_qr =path.join(__dirname+'/img_qr');

//upload papkani tozalash
setInterval(function() {
    walkDir(uploadsDir, function(filePath) {
    fs.stat(filePath, function(err, stat) {
    var now = new Date().getTime();
    var endTime = new Date(stat.mtime).getTime() + 10800000; // 3 saotdagi fayllar ochadi

    if (err) { return console.error(err); }

    if (now > endTime) {
        //console.log('DEL:', filePath);
      return fs.unlink(filePath, function(err) {
        if (err) return console.error(err);
      });
    }
  })  
});
}, 6000000); // har 100 minutda

//pdf qr papkani tozalash
setInterval(function() {
  walkDir(pdf_qr, function(filePath) {
  fs.stat(filePath, function(err, stat) {
  var now = new Date().getTime();
  var endTime = new Date(stat.mtime).getTime() + 10800000; // 3 saotdagi fayllar ochadi

  if (err) { return console.error(err); }

  if (now > endTime) {
      //console.log('DEL:', filePath);
    return fs.unlink(filePath, function(err) {
      if (err) return console.error(err);
    });
  }
})  
});
}, 6000000); // har 100 minutda

//img_qr papkani tozalash
setInterval(function() {
  walkDir(img_qr, function(filePath) {
  fs.stat(filePath, function(err, stat) {
  var now = new Date().getTime();
  var endTime = new Date(stat.mtime).getTime() + 10800000; // 3 saotdagi fayllar ochadi

  if (err) { return console.error(err); }

  if (now > endTime) {
      //console.log('DEL:', filePath);
    return fs.unlink(filePath, function(err) {
      if (err) return console.error(err);
    });
  }
})  
});
}, 6000000); // har 100 minutda


function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
};