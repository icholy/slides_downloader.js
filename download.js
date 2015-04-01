
var cheerio = require("cheerio"),
    http    = require("http-request"),
    fs      = require("fs"),
    path    = require("path");

var fileName = "slides-typescript.html",
    imgDir   = "images/";

function downloadImage(src, callback) {
  var options = { url: src },
      dst     = path.join(imgDir, path.basename(src));
  console.log("downloading:", src, "to", dst);
  http.get(src, dst, function (err, data) {
    if (err) {
      callback(err, null);
      return
    }
    else {
      callback(null, data.file);
    }
  });
}

function replaceImage(img, callback) {
  var src = img.attribs['data-src'];
  if (src) {
    downloadImage(src, function (err, fileName) {
      if (err) {
        callback(err);
      }
      else {
        img.attribs['data-src'] = fileName;
        callback(null);
      }
    })
  }
  else {
    console.log("img doesn't have an src ... skipping");
    callback(null);
  }
}

fs.readFile(fileName, function (err, data) {
  if (err) {
    throw err;
  }
  var $ = cheerio.load(data);
  var loadingCount = 0;
  $('img').each(function (index, img) {
    loadingCount++;
    replaceImage(img, function (err) {
      if (err) {
        throw err;
      }
      loadingCount--;
      if (loadingCount === 0) {
        console.log("writing to out.html");
        fs.writeFile('out.html', $.html(), function (err) {
          if (err) {
            throw err;
          }
        });
      }
    })
  });
});



