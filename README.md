# Mocha Sonar Reporter
SonarQube XML reporter for Mocha

Features:
* Generate xml reports compatible with [SonarQube](https://www.sonarqube.org/)
* Ability to also write to stdout
* Ability to define custom reporter for stdout
* Silent mode to disable output
* Customize output file path and/or name

## About
We needed the ability to generate xml reports for unit tests and import them to [SonarQube](https://www.sonarqube.org/). There are a few libraries that attempt to help with this, but they all were either outdated, generated incompatible xml, or only logged xml to stdout. This library will let you generate unit test execution reports in a format compatible with [sonarqube generic test format](https://docs.sonarqube.org/latest/analysis/generic-test/#header-2) and write them to a file. You can also pipe output to a secondary reporter for a human readable view as well.

## Usage
Add mocha-sonar as a dependency for your app and install via npm
```bash
npm install @danmasta/mocha-sonar --save-dev
```
Use the reporter for tests
```bash
mocha -R @danmasta/mocha-sonar tests
```

### Options
Options can be passed using the `reporterOptions` field in mocha options, or the `--reporter-options` field via command line

name | description
-----|-------------
`cwd` | Location to use to generate relative file paths for tests. Default is `process.cwd()`
`output` | File path where you would like the sonar xml report to be saved. Default is `./coverage/sonar.xml`
`delimiter` | Delimiter to use to join names for nested tests. Default is `' '`
`reporter` | Name of the reporter you would like to use for console output. Default is `list`
`silent` | If `true` disables secondary reporter output. Default is `false`
`spaces` | Number of spaces to use when formatting xml output. Default is `4`

## Examples
Use mocha-sonar from command line
```bash
mocha -R @danmasta/mocha-sonar ./tests/unit/**/*.js
```

Pass options to npm test command
```bash
npm run test -- --reporter=@danmasta/mocha-sonar --reporter-options --reporter=nyan,delimeter=::
```

Coverage reports with [nyc](https://github.com/istanbuljs/nyc)
```bash
nyc --reporter=lcov mocha -R @danmasta/mocha-sonar ./tests/unit/**/*.js
```

Use mocha and/or nyc as [gulp](https://github.com/gulpjs/gulp) tasks
```js
const spawn = require('child_process').spawn;
const gulp = require('gulp');

gulp.task('test', () => {
    return spawn('mocha -R @danmasta/mocha-sonar ./tests/unit/**/*.js', {
        shell: true,
        stdio: ['inherit', 'inherit', 'inherit']
    });
});

gulp.task('coverage', () => {
    return spawn('nyc --reporter=lcov mocha -R @danmasta/mocha-sonar ./tests/unit/**/*.js', {
        shell: true,
        stdio: ['inherit', 'inherit', 'inherit']
    });
});

gulp.task('default', gulp.series('test', 'build'));
gulp.task('publish', gulp.series('coverage', 'build', 'deploy'));
```

## Contact
If you have any questions feel free to get in touch
