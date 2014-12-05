var gulp = require('gulp'),
    fs = require('fs'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    psi = require('psi'),
    psiSite = "http://jon-a-nygaard.github.io/",
    psiKey = "AIzaSyBOGPcfy8Jxlpg6rLpwn7lh79Hlj-6gSMU",
    psiCallback = function (err, data, strategy, date) {
        var stats = data.pageStats,
            results = data.formattedResults.ruleResults,
            getBytes = function (bytes) {
                var sizes = ['B', 'kB', 'MB', 'GB', 'TB'],
                    i,
                    num,
                    formatted = "0 B";
                if (bytes > 0) {
                    i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)));
                    num = bytes / Math.pow(1000, i);
                    formatted = numformat(num, 2) + " " + sizes[i];
                }
                return formatted;
            },
            numformat = function (number, decimals) {
                var p = 0;
                if (decimals) {
                    p = Math.pow(10, decimals);
                }
                return Math.round(number * p) / p;
            },
            strformat = function (string, len) {
                var empty = new Array(len + 1).join(" ");
                return String(string + empty).slice(0, len);
            },
            output = strformat("URL: ", 10) + data.id + "\n"
                + strformat("Score:", 10) + data.score + "\n"
                + strformat("Strategy:", 10) + strategy + "\n"
                + strformat("UTC-Time:", 10) + date + "\n"
                + "\n"
                + strformat("Number Resources: ", 30) + stats.numberResources + "\n"
                + strformat("Number Hosts: ", 30) + stats.numberHosts + "\n"
                + strformat("Total Request: ", 30) + getBytes(stats.totalRequestBytes) + "\n"
                + strformat("Number Static Resources: ", 30) + stats.numberStaticResources + "\n"
                + strformat("Html Response: ", 30) + getBytes(stats.htmlResponseBytes) + "\n"
                + strformat("Css Response: ", 30) + getBytes(stats.cssResponseBytes) + "\n"
                + strformat("Image Response: ", 30) + getBytes(stats.imageResponseBytes) + "\n"
                + strformat("Javascript Response: ", 30) + getBytes(stats.javascriptResponseBytes) + "\n"
                + strformat("Number Js Resources: ", 30) + stats.numberJsResources + "\n"
                + strformat("Number Css Resources: ", 30) + stats.numberCssResources + "\n"
                + "\n";
        for (var prop in results) {
            output += strformat(results[prop].localizedRuleName + ":", 80) + numformat(results[prop].ruleImpact, 1) + "\n";
        }
        fs.writeFile("benchmarks/psi-" + strategy + ".txt", output, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("The " + strategy + " text file was saved!");
            }
        });

        // TODO: write stats to csv file, alternatively json
        output = [];
        fs.readFile('benchmarks/psi-mobile.csv', 'utf8', function (err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log("The " + strategy + " csv file was collected!");
            }
            output = data;
        });
    };

gulp.task('scripts', function () {
    gulp.src('assets/js/*js')
    .pipe(concat('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('psi', function () {
    var strategyD = "desktop",
        strategyM = "mobile",
        d = new Date(),
        date = d.toUTCString();
    psi({
        key: psiKey,
        url: psiSite,
        strategy: strategyD
    }, function (err, data) {
        psiCallback(err, data, strategyD, date);
    });
    psi({
        key: psiKey,
        url: psiSite,
        strategy: strategyM
    }, function (err, data) {
        psiCallback(err, data, strategyM, date);
    });
});
