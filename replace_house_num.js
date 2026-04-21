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
    let modified = false;
    let result = data;
    
    if (result.includes('บ้านเลขที่ ')) {
      result = result.replace(/บ้านเลขที่ /g, 'สถานที่/ห้อง ');
      modified = true;
    }
    if (result.includes('บ้านเลขที่:')) {
      result = result.replace(/บ้านเลขที่:/g, 'สถานที่/ห้อง:');
      modified = true;
    }
    if (result.includes('ตามบ้านเลขที่')) {
      result = result.replace(/ตามบ้านเลขที่/g, 'ตามสถานที่/ห้อง');
      modified = true;
    }
    if (result.includes('บ้านเลขที่')) {
      result = result.replace(/บ้านเลขที่/g, 'รหัสสถานที่/ห้อง');
      modified = true;
    }
    
    if (modified) {
      fs.writeFile(filepath, result, 'utf8', (err) => {
        console.log('Replaced in:', filepath);
      });
    }
  });
});
