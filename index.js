'use strict';

var fs = require('fs');
var gutil = require('gulp-util');
var through = require('through2');
var template = require('lodash').template;

module.exports = function (options) {
    var tempFile = options.tempFile;
    var dataProperty = options.dataProperty || 'data';

    return through.obj(function (file, enc, cb) {
        if (!tempFile || !file[dataProperty]) {
            this.push(file);
            return cb();
        }

        var data = {};
        data[dataProperty] = file[dataProperty];

        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-inplace-template', 'Streaming not supported'));
            return cb();
        }

        try {
            file.contents = new Buffer(template(fs.readFileSync(tempFile).toString(), data, options));
        } catch (err) {
            this.emit('error', new gutil.PluginError('gulp-inplace-template', err));
        }

        this.push(file);
        cb();
    });
};
