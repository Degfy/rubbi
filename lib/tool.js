const is = require('is-type-of');
const debuglog = require('util').debuglog('rubbi:tool');
const Readline = require('readline');
const Fs = require('fs');

function readline(question = '', opts) {
    opts = Object.assign({
        input: process.stdin,
        output: process.stdout,
    }, opts);

    const rl = Readline.createInterface(opts);
    return new Promise(resolve => {
        rl.question(question, ans => {
            resolve(ans);
            rl.close();
        });
    });
}

function writeFile(file, data, {
    isJson = false,
    flag = 'a+',
    encoding = 'utf8',
} = {
    isJson: false,
    flag: 'a+',
    encoding: 'utf8',
}) {
    return new Promise(resolve => {
        let str = data;
        if (isJson) {
            str = ',\n' + JSON.stringify(data);
        }
        Fs.writeFile(file, str, {
            encoding,
            flag,
        }, err => {
            resolve(err);
        });
    });
}

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function toCamel(input) {
    if (!is.string(input)) {
        throw Error('param must be string');
    }
    return input.replace(/_([a-z])/g, (_, m1) => m1.toUpperCase());
}

function toDownLine(input) {
    if (!is.string(input)) {
        throw Error('param must be string', input);
    }
    return input.replace(/([A-Z])/g, (_, m1) => '_' + m1.toLowerCase());
}


function capitalize(input) {
    return input.replace(/^[a-z]/, m => m.toUpperCase());
}

function unCapitalize(input) {
    return input.replace(/^[A-Z]/, m => m.toLowerCase());
}


function stringArray(param, sep = /\s+/) {
    if (is.string(param)) {
        return param.split(sep);
    }
    if (!is.array(param)) {
        throw new Error('param must be string or array');
    }
    return param;
}

function pathProperty(obj, path) {
    const keys = stringArray(path, '.');
    return keys.reduce((pre, cur) => pre && pre[cur], obj);
}



module.exports = {
    readline,
    writeFile,
    sleep,
    toCamel,
    toDownLine,
    capitalize,
    unCapitalize,
    stringArray,
    pathProperty,



}
