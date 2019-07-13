const assert = require('assert');
const rubbi = require('../..');

describe('tool.js', () => {
    it('toCamel', () => {
        return assert.equal(rubbi.toCamel('this_is_a_test'), 'thisIsATest');
    });

});
