const Sonar = require('../index');
const mocha = require('mocha');

beforeEach(() => {
    return import('chai').then(chai => {
        global.assert = chai.assert;
        global.expect = chai.expect;
        global.should = chai.should();
        global.Sonar = Sonar;
        global.mocha = mocha;
    });
});
