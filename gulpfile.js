var gulp = require('gulp'),
    fs = require('fs'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    spawn = require('child_process').spawn,
    paths = {
        sass: ['assets/sass/*.scss'],
        scripts: ['assets/js/*js'],
        jekyll: ['_config.yml', 'index.html', '_includes', '_layouts', 'blog/*.*', 'projects/*.*', 'dist/*.*']
    },
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
        fs.writeFile("assets/benchmarks/psi-" + strategy + ".txt", output, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("The " + strategy + " text file was saved!");
            }
        });

        // TODO: write stats to csv file, alternatively json
        fs.readFile('assets/benchmarks/psi-' + strategy + '.csv', 'utf8', function (err, data) {
            var arr = [],
                index,
                csv;
                cvsToArray = function (csv) {
                    var rows = csv.split("\r\n");
                    for (var i = 0; i < rows.length; i++) {
                        rows[i] = rows[i].split(", ");
                    }
                    return rows;
                },
                arrayToCsv = function(arr) {
                    for (i = 0; i < arr.length; i++) {
                        arr[i] = arr[i].join(", ");
                    }
                    arr = arr.join("\r\n");
                    return arr;
                }
                addNewRow = function (arr, def) {
                    var row,
                        cells;
                    arr.push([]);
                    row = arr.length - 1;
                    cells = arr[0].length;
                    for (i = 0; i < cells; i++) {
                        arr[row][i] = def;
                    }
                    return arr;
                },
                addNewColumn = function (arr, title, def) {
                    var col;
                    arr[0].push(title);
                    col = arr[0].indexOf(title);
                    for (i = 1; i < arr.length; i++) {
                        arr[i][col] = def;
                    }
                    return arr;
                };
            if (err) {
                console.log(err);
            } else {
                console.log("The " + strategy + " csv file was collected!");
                // Seperate into arrays
                arr = cvsToArray(data);
                arr = addNewRow(arr, 0);
                arr[arr.length - 1][0] = date;
                // Add all the stats
                for (var prop in stats) {
                    index = arr[0].indexOf(prop);
                    if (index === -1) {
                        arr = addNewColumn(arr, prop, 0);
                        index = arr[0].indexOf(prop);
                    }
                    arr[arr.length - 1][index] = stats[prop];
                }
                // Add all the results
                for (var prop in results) {
                    index = arr[0].indexOf(prop);
                    if (index === -1) {
                        arr = addNewColumn(arr, prop, 0);
                        index = arr[0].indexOf(prop);
                    }
                    arr[arr.length - 1][index] = numformat(results[prop].ruleImpact, 1);
                }
                csv = arrayToCsv(arr);
                fs.writeFile("assets/benchmarks/psi-" + strategy + ".csv", csv, function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log("The " + strategy + " csv file was saved!");
                    }
                });
            }
        });
    }, deleteFiles = function (regex, folder, fs) {
        var fil;
        fs.readdir(folder, function (error, files) {
            if (error) throw error;
            fil = files.filter(function (fileName) {
                return regex.test(fileName);
            });
            for (var i in fil) {
                fs.unlink(folder + fil[i]);
            }
        });
    }, deleteFolderRecursive = function(path) {
        if(fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function(file,index){
                var curPath = path + "/" + file;
                if(fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };
 
gulp.task('watch', function () {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.jekyll, ['jekyll']);
});

gulp.task('sass', function () {
    deleteFiles(/.*.css/, 'dist/', fs);
    gulp.src(paths.sass)
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('scripts', function () {
    deleteFiles(/.*.js/, 'dist/', fs);
    gulp.src(paths.scripts)
    .pipe(concat('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('jekyll', function () {
    deleteFolderRecursive('_site/');
    var jekyll = spawn('jekyll.bat', ['build']);
    jekyll.on('exit', function (code) {
        console.log('-- Finished Jekyll Build --');
    });
});

gulp.task('psi', function () {
    var strategyD = "desktop",
        strategyM = "mobile",
        strformat = function (string, len, ch) {
            var empty = new Array(len + 1).join(ch);
            return String(string + empty).slice(0, len);
        },
        getMyDate = function () {
            var d = new Date(),
                date = "";
            date += d.getFullYear() + "-";
            date += strformat(d.getMonth(), 2, "0") + "-";
            date += strformat(d.getDate(), 2, "0") + " ";
            date += strformat(d.getHours(), 2, "0") + ":";
            date += strformat(d.getMinutes(), 2, "0") + ":";
            date += strformat(d.getSeconds(), 2, "0");
            return date;
        },
        date = getMyDate();
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
