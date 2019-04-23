const path = require('path');
const fs = require('fs');
const util = require('util');
const mocha = require('mocha');
const mkdirp = require('mkdirp');
const _ = require('lodash');
const xml = require('xml-js').js2xml;
const Base = mocha.reporters.Base;

const defaults = {
    cwd: process.cwd(),
    output: './coverage/sonar.xml',
    delimiter: ' ',
    reporter: 'list',
    silent: false,
    spaces: 4
};

function testXml (test) {

    let res = {
        _attributes: {
            name: test.name,
            duration: test.duration || 0
        }
    };

    if (test.state === 'failed') {
        res['failure'] = {
            _attributes: {
                message: _.join(_.compact([test.error.name, test.error.message]), ': '),
            },
            _text: test.error.stack
        };
    }

    if (test.state === 'skipped') {
        res['skipped'] = {
            _attributes: {
                message: 'skipped',
            },
            _text: 'skipped'
        };
    }

    return res;

}

function fileXml (tests, file) {

    return {
        _attributes: {
            path: file
        },
        testCase: _.map(tests, testXml)
    };

}

function toXml (files) {

    let res = {
        _declaration: {
            _attributes: {
                version: '1.0',
                encoding: 'utf-8'
            }
        },
        testExecutions: {
            _attributes: {
                version: 1
            },
            file: _.map(files, fileXml)
        }
    };

    return xml(res, { compact: true, spaces: 4 });

}

// same as test.fullTitle
// but allows setting delimiter
function fullTitle (test, delimiter) {

    let parent = test;
    let name = [];

    while (parent) {
        if (parent.title) {
            name.unshift(parent.title);
        }
        parent = parent.parent;
    }

    return _.join(name, delimiter);

}

// mocha reporter for sonar generic execution reports
function Sonar (runner, opts) {

    opts = _.defaults(opts.reporterOptions, defaults);

    let res = {};
    let Reporter = mocha.reporters[opts.reporter];

    // show output from other reporter if specified
    if ((!opts.silent || opts.silent !== 'true') && Reporter) {
        new Reporter(runner);
    } else {
        Base.call(this, runner);
    }

    if (opts.output) {
        opts.output = path.resolve(opts.output);
    }

    // handle test errors
    runner.on('fail', (test, err) => {
        test.error = err;
    });

    // parse test on completion
    runner.on('test end', test => {

        let file = test.file.slice(opts.cwd.length + 1);
        res[file] = res[file] || [];

        if (!test.state && test.pending) {
            test.state = 'skipped';
        }

        test.file = file;
        test.name = fullTitle(test, opts.delimiter);

        res[file].push(test);

    });

    // parse to xml and wite to file
    // we have to use sync operations because mocha
    // can close the process after tests have run
    runner.on('end', () => {

        try {

            // create file directory if doesn't exist
            mkdirp.sync(path.dirname(opts.output));

            // write results to file
            fs.writeFileSync(opts.output, toXml(res));

            console.log('Sonar execution report written to: %s', opts.output);

        } catch(err) {

            console.error('Sonar execution report failed to write: %s', err.stack);

        }

    });

}

util.inherits(Sonar, Base);

module.exports = Sonar;
