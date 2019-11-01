const fs = require('fs');
const path = require('path');

function dirFiles(dir) {
    const list = fs.readdirSync(dir);
    const files = [];
    list.forEach(f => {
        const _path = path.resolve(dir, f);
        const stat = fs.statSync(_path);
        if (stat.isDirectory()) {
            const subDirFiles = dirFiles(_path);
            files.push(...subDirFiles);
        } else {
            files.push(_path);
        }
    });
    return files;
}
module.exports = dirFiles;