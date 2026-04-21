const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
      const filepath = path.join(dir, file);
      fs.stat(filepath, (err, stats) => {
        if (stats.isDirectory()) {
          walk(filepath, callback);
        } else if (stats.isFile() && (filepath.endsWith('.tsx') || filepath.endsWith('.ts'))) {
          callback(filepath);
        }
      });
    });
  });
}

walk(path.join(__dirname, 'app'), (filepath) => {
  fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) throw err;
    if (data.includes('ลูกบ้าน')) {
      const result = data.replace(/ลูกบ้าน/g, 'ผู้เช่า/ร้าน/บริษัท');
      fs.writeFile(filepath, result, 'utf8', (err) => {
        if (err) throw err;
        console.log('Replaced in:', filepath);
      });
    }
  });
});
