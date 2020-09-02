const path = require('path');
const fs = require('fs');
const mocha = require('mocha');
const mkdirp = require('mkdirp');
const _ = require('lodash');
const xml = require('xml-js').js2xml;
const Base = mocha.reporters.Base;
const constants = mocha.Runner.constants;

const defaults = {
    cwd: process.cwd(),
    output: './coverage/sonar.xml',
    delimiter: ' ',
    reporter: 'list',
    silent: false,
    spaces: 4
};

class Sonar extends Base {

    constructor (runner, mochaOpts) {

        super(runner, mochaOpts);

        // get opts from mocha options
        let opts = _.defaults(mochaOpts.reporterOptions, defaults);
        let Reporter = mocha.reporters[opts.reporter];

        // parse opts to native types
        opts.silent = String(opts.silent) === 'true';
        opts.spaces = parseInt(opts.spaces);

        // show output from secondary reporter if specified
        if (!opts.silent && Reporter) {
            new Reporter(runner, mochaOpts);
        }

        if (opts.output) {
            opts.output = path.resolve(opts.output);
        }

        this.res = {};
        this.opts = opts;

        // handle test errors
        runner.on(constants.EVENT_TEST_FAIL, (test, err) => {
            this._handleTestFail(test, err);
        });

        // handle test completion
        runner.on(constants.EVENT_TEST_END, (test) => {
            this._handleTestEnd(test);
        });

        // handle run end
        runner.on(constants.EVENT_RUN_END, () => {
            this._handleRunEnd();
        });

    }

    _handleTestFail (test, err) {
        test.error = err;
    }

    _handleTestEnd (test) {

        let file = test.file.slice(this.opts.cwd.length + 1);

        if (!test.state || (test.state==='pending' && test.pending)) {
            test.state = 'skipped';
        }

        test.file = file;
        test.name = this._getfullTitle(test);

        this.res[file] = this.res[file] || [];
        this.res[file].push(test);

    }

    // parse results to xml and wite to file
    // we have to use sync operations here because mocha
    // can close the process after tests have run
    // but file has not finished writing
    _handleRunEnd () {

        try {

            mkdirp.sync(path.dirname(this.opts.output));
            fs.writeFileSync(this.opts.output, this._resultsToXml(this.res));

            console.log('Sonar execution report written to: %s', this.opts.output);

        } catch (err) {
            console.error('Sonar execution report failed to write: %s', err.stack);
        }

    }

    _getfullTitle (test) {

        let parent = test;
        let name = [];

        while (parent) {
            if (parent.title) {
                name.unshift(parent.title);
            }
            parent = parent.parent;
        }

        return _.escape(_.join(name, this.opts.delimiter));

    }

    _testToXml (test) {

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

    _fileToXml (tests, file) {

        return {
            _attributes: {
                path: file
            },
            testCase: _.map(tests, this._testToXml.bind(this))
        };

    }

    _resultsToXml (files) {

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
                file: _.map(files, this._fileToXml.bind(this))
            }
        };

        return xml(res, { compact: true, spaces: this.opts.spaces });

    }

}

module.exports = Sonar;
