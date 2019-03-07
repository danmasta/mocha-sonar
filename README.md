# Mocha Sonar Reporter
Sonar XML reporter for Mocha

Features:
* Generate xml reports compatible with [SonarQube](https://docs.sonarqube.org/latest/analysis/generic-test/#header-2)
* Ability to view console output without hacking stdout
* Silent mode to disable output
* Ability to define custom reporter output
* Customize output file path/ name

## About
We needed the ability to generate xml reports for unit tests and import them into SonarQube. There are a few libraries out there to help with this ([xnuit-file](https://github.com/peerigon/xunit-file), [reporter-file](https://github.com/apipkin/reporter-file), and [mocha-sonar-generic-test-coverage](https://github.com/mageddo/mocha-sonar-generic-test-coverage)
), but they all were either outdated, generated incompatible xml, or logged only to stdout and attempted to use hacks to gather the output.

## Usage
Add mocha-sonar as a dependency for your app and install via npm
```
npm install @danmasta/mocha-sonar --save-dev
```
Use the reporter for tests
```javascript
mocha -R @danmasta/mocha-sonar tests
```

### Options
Options can be passed using the `reporterOptions` field in gulp-mocha, or the `--reporter-options` field via command line

name | description
-----|-------------
`cwd` | Location to use to generate relative file paths for tests
`output` | File path where you would like the sonar xml report to be saved. Default is `./coverage/sonar.xml`
`delimiter` | Delimiter to use for names for nested tests
`reporter` | Name of the reporter you would like to use for console output. Default is `list`
`silent` | If `true`, disables console output
`spaces` | Number of spaces to use when formatting xml output. Default is `4`

## Examples
Use mocha-sonar from command line
```bash
mocha ./tests/unit/**/*.js -R @danmasta/mocha-sonar
```

Use gulp, istanbul, and mocha to generate coverage and unit test reports for sonar
```javascript
gulp.task('coverage:before', () => {

    return gulp.src([
        '*.js',
        'lib/**/*.js',
        'models/**/*.js',
        'routes/**/*.js'
    ])
        .pipe(istanbul({
            includeUntested: true
        }))
        .pipe(istanbul.hookRequire());

});

gulp.task('coverage', ['coverage:before'], () => {

    return gulp.src('tests/unit/**/*.js')
        .pipe(mocha({
            reporter: '@danmasta/mocha-sonar',
            reporterOptions: {
                reporter: 'list',
                reporter_file: './coverage/sonar.xml'
            }
        }))
        .pipe(istanbul.writeReports({
            dir: './coverage',
            reporters: [ 'lcov' ],
            reportOpts: { dir: './coverage' }
        }))
        .on('error', util.log)
        .once('end', () => {
            process.nextTick(process.exit);
        });

});
```

## Contact
If you have any questions feel free to get in touch
