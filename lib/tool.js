const is = require('is-type-of');
module.exports = {
    readline(question = '', opts) {
        opts = Object.assign({
            input: process.stdin,
            output: process.stdout,
        }, opts);

        const readline = require('readline');
        const rl = readline.createInterface(opts);

        return new Promise(resolve => {
            rl.question(question, ans => {
                resolve(ans);
                rl.close();
            });
        })
    },

    writeFile(file, data, isJson) {
        return new Promise(resolve => {
            const fs = require('fs');
            let str = data;
            if (isJson) {
                str = ',\n' + JSON.stringify(data);
            }
            fs.writeFile(file, str, {
                encoding: 'utf8',
                flag: 'a+'
            }, err => {
                resolve(err);
            });
        });
    },

    sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    },

    toCamel(input) {
        if (!is.string(input)) {
            throw Error('param must be string');
        }
        return input.replace(/_([a-z])/g, (m, m1) => m1.toUpperCase());
    },

    toDownLine(input) {
        if (!is.string(input)) {
            throw Error('param must be string', input);
        }
        return input.replace(/([A-Z])/g, (m, m1) => '_' + m1.toLowerCase());
    },

    capitalize(input) {
        return input.replace(/^[a-z]/, m => m.toUpperCase());
    },

    unCapitalize(input) {
        return input.replace(/^[A-Z]/, m => m.toLowerCase());
    },
}
