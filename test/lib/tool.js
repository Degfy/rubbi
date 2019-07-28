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
        assert.equal(Math.abs((Date.now() - begin) - sleepTime) < 8, true);
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

    it('asyncAll', async () => {
        const list = [],
            end = 1000;
        for (let i = 0; i < end; i++) {
            list.push(i);
        }

        const testArr = [];
        await rubbi.asyncAll(list, async it => {
            await rubbi.sleep(Math.random() * 10);
            testArr.push(it);
        });

        assert.equal(end, testArr.length);
        assert.equal(end, [...new Set(testArr)].length);
        const index = testArr.find((it, i) => it != i);
        assert.equal(index > -1, true);
    });

    it('asyncEach', async () => {
        const list = [],
            end = 100;
        for (let i = 0; i < end; i++) {
            list.push(i);
        }

        const testArr = [];
        await rubbi.asyncEach(list, async it => {
            await rubbi.sleep(Math.random() * 5);
            testArr.push(it);
        });

        assert.equal(end, testArr.length);
        assert.equal(end, [...new Set(testArr)].length);
        const index = testArr.find((it, i) => it != i);
        assert.equal(index, undefined);
    });

    it('multiExec', async () => {
        const list = [],
            end = 100;
        for (let i = 0; i < end; i++) {
            list.push(i);
        }

        const multi = 5;
        let total = 0;
        let running = 0;

        const outArr = await rubbi.multiExec(list, async (item, i) => {
            running++;
            total++;
            await rubbi.sleep(Math.random() * 100);
            assert.equal(item, i);
            return i;
        }, {
            multi,
            process(item, curIndex, executedCount) {
                assert.equal(true, running <= multi);
                assert.equal(true, running >= 1);
                assert.equal(true, executedCount <= total);
                assert.equal(item, curIndex);
                running--;
            },
            returning: true,
        });
        assert.equal(total, end);
        outArr.forEach((element, i) => {
            assert.equal(element, i);
        });
    });

    it('multiExec throw Error', async () => {
        const list = [],
            end = 100;
        for (let i = 0; i < end; i++) {
            list.push(i);
        }

        const message = '11 throw';

        const multi = 5;
        let total = 0;
        let running = 0;

        try {
            await rubbi.multiExec(list, async (item, i) => {
                running++;
                total++;
                assert.equal(item, i);
                await rubbi.sleep(Math.random() * 100);
                if (i === 10) {
                    throw Error(message);
                }
            }, {
                multi,
                process(item, curIndex, executedCount) {
                    assert.equal(true, running <= multi);
                    assert.equal(true, running >= 1);
                    assert.equal(true, executedCount <= total);
                    assert.equal(item, curIndex);
                    running--;
                },
            });
        } catch (e) {
            assert.equal(message, e.message);
            assert.equal(true, total <= end);
            assert.equal(true, 10 <= total);
        }
    });

    it('whiteBlock', () => {
        const fromObj = {
            a: 1,
            b: 2,
            c: 3
        };

        const out = rubbi.whiteBlock(fromObj, ['a', 'b']);
        assert.equal(Object.keys(out).length, 2);
        assert.equal(out.a, fromObj.a);
        assert.equal(out.b, fromObj.b);
    });

    it('blackBlock', () => {
        const fromObj = {
            a: 1,
            b: 2,
            c: 3
        };

        const out = rubbi.blackBlock(fromObj, ['c']);
        assert.equal(Object.keys(out).length, 2);
        assert.equal(out.a, fromObj.a);
        assert.equal(out.b, fromObj.b);
    });
});
