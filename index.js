const tool = require('./lib/tool');
module.exports = {
    ...tool,
    is: require('is-type-of'),
    dirFiles: require('./lib/dir_files'),
};
