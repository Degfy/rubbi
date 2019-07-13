const assert = require('assert');
const rubbi = require('../..');

describe('tool.js', () => {
    it('readline', async () => {

        const {
            PassThrough
        } = require('stream');
        const q = 'input some word,please';
        const a = 'ok, this is a test';

        const input = new PassThrough;
        const output = new PassThrough;

        const pro = rubbi.readline(q, {
            input,
            output,
        });

        output.on('data', data => {
            assert.equal(data.toString(), q);
        });
        input.write(a + '\n');

        const read = await pro;
        assert.equal(read, a);
    });

    it('writeFile', async () => {
        const filename = Date.now() + '.tmp.file.txt';
        let content = 'this is a test'
        await rubbi.writeFile(filename, content);
        const fs = require('fs');
        let readInfo = fs.readFileSync(filename);
        fs.unlinkSync(filename);
        assert.equal(readInfo, content);

        await rubbi.writeFile(filename, content, {
            isJson: true,
        });

        readInfo = fs.readFileSync(filename);
        fs.unlinkSync(filename);
        assert.equal(readInfo, ',\n' + JSON.stringify(content));
    });

    it('sleep', async () => {
        let sleepTime = 10;
        let begin = Date.now();
        await rubbi.sleep(sleepTime);
        assert.equal(Math.abs((Date.now() - begin) - sleepTime) < 5, true);
    });

    it('toCamel', () => {
        assert.equal(rubbi.toCamel('this_is_a_test'), 'thisIsATest');
    });

    it('toDownLine', () => {
        assert.equal(rubbi.toDownLine('thisIsATest'), 'this_is_a_test');
    });

    it('capitalize', () => {
        assert.equal(rubbi.capitalize('thisIsATest'), 'ThisIsATest');
    });

    it('unCapitalize', () => {
        assert.equal(rubbi.unCapitalize('ThisIsATest'), 'thisIsATest');
    });

    it('stringArray', () => {
        assert.equal(rubbi.stringArray('abcd\nassw aaa\rwww\too    oo').join(','), 'abcd,assw,aaa,www,oo,oo');
        assert.equal(rubbi.stringArray(['abcd', 'assw', 'aaa', 'www', 'oo', 'oo']).join(','), 'abcd,assw,aaa,www,oo,oo');

        assert.equal(rubbi.stringArray('a.b.c', '.').join(','), 'a,b,c');

        let msg;
        try {
            rubbi.stringArray({});
        } catch (e) {
            msg = e.message;
        }
        assert.equal(msg, 'param must be string or array');
    });


    it('pathProperty', () => {
        let obj = {
            a: {
                b: {
                    c: 'd'
                }
            }
        };

        assert.equal(rubbi.pathProperty(obj, 'a.b.c'), 'd');
        assert.equal(rubbi.pathProperty(undefined, 'a.b.c'), undefined);
        assert.equal(rubbi.pathProperty(null, 'a.b.c'), null);
        assert.equal(rubbi.pathProperty(String, 'length'), 1);

        let arr = [{
            a: [{
                b: [1223]
            }]
        }];

        assert.equal(rubbi.pathProperty(arr, '0.a.0.b.0'), 1223);
    });
});
