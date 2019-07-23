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

async function asyncAll(list, fn) {
    if (!is.array(list)) {
        throw Error('list must be array!');
    }
    if (!is.function(fn)) {
        throw Error('fn must be function');
    }
    return await Promise.all(list.map(fn));
}

async function asyncEach(list, fn) {
    if (!is.array(list)) {
        throw Error('list must be array!');
    }
    if (!is.function(fn)) {
        throw Error('fn must be function');
    }
    const out = [];
    for (let i = 0; i < list.length; i++) {
        let it = fn(list[i], i);
        if (is.promise(it)) {
            it = await it;
        }
        out.push(it);
    }
    return out;
}

async function multiExec(list, fn, {
    multi = 10,
    catcher,
    process,
    returning,
} = {
    multi: 10,
}) {
    if (!is.array(list)) {
        throw Error('list must be array!');
    }
    if (!is.asyncFunction(fn)) {
        throw Error('fn must be async function');
    }

    return await new Promise((resolve, reject) => {
        let i = 0;
        let execJobCount = 0;
        let executedCount = 0;

        const addJob = () => {
            debuglog('add job', i);
            if (i < list.length) {
                const item = list[i];
                item.i = i;
                warp(item, i);
                i++;
            }
        };

        let stop = false;
        const out = [];
        const warp = async (item, curIndex) => {
            if (stop) {
                return;
            }
            execJobCount++;
            try {
                const rst = await fn(item, curIndex);
                if (returning) {
                    out[curIndex] = rst;
                }
            } catch (err) {
                if (is.function(catcher)) {
                    catcher(err, item.curIndex)
                } else {
                    stop = true;
                    reject(err);
                }
            }
            execJobCount--;
            executedCount++;

            if (is.function(process)) {
                try {
                    process(item, curIndex, executedCount);
                } catch (e) {
                    console.error(e);
                }
            }
            item = null;

            addJob();
            if (execJobCount === 0) {
                if (returning) {
                    resolve(out);
                } else {
                    resolve();
                }
            }
        };

        for (; i < multi && i < list.length;) {
            addJob();
        }
    });
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

    asyncAll,
    asyncEach,
    multiExec,

}
