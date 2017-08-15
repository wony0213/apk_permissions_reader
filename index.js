const util = require('util')
const ApkReader = require('adbkit-apkreader')


var cheerio = require('cheerio');
var superagent = require('superagent');

// var dbapi = require('./mongodb/dbapi');


// ApkReader.open('/Users/wony/Downloads/360App/通讯类/微信 6.5.10.apk')
// .then(reader => reader.readManifest())
// .then(manifest => console.log(manifest.usesPermissions))

var manifestPermissions = [];
superagent.get('https://developer.android.google.cn/reference/android/Manifest.permission.html')
    .end(function (err, sres) {
        // 常规的错误处理
        if (err) {
            console.error(err);
        }
        // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
        // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
        // 剩下就都是 jquery 的内容了
        var $ = cheerio.load(sres.text);


        var permission_count = $('div.api').has($('h3.api-name'))
            .map(function (i, elem) {
                if (0 != $(elem).find('h1.api-title').length) {
                    return null;
                } else if (-1 != $(elem).find('h3.api-name').text().indexOf('Manifest.permission')) {
                    return null;
                } else {

                    var $elem = $(elem);

                    var permission = {
                        //注意这里i的逻辑……不是很合理
                        id: i,
                        name:
                            $elem.find('h3.api-name').text(),
                        constantValue:
                            $elem.find('p').map(function (i, elem) {
                                if (-1 != $(elem).text().indexOf('Constant Value')) {
                                    return elem;
                                }
                            })
                                .text()
                                .replace(/[\r\n]/g, '')
                                .replace(/\ +/g, '')
                                .replace(/ConstantValue:/g, '')
                                .replace(/"/g, ''),


                        protectionLevel:
                            $elem.find('p').map(function (i, elem) {
                                if (-1 != $(elem).text().indexOf('Protection level')) {
                                    return elem;
                                }
                            })
                                .text()
                                .replace(/[\r\n]/g, '')
                                .replace(/\ +/g, '')
                                .replace(/Protectionlevel:/g, ''),
                        addApi:
                            $elem
                                .find('div.api-level')
                                .text()
                                .replace(/[\r\n]/g, '')
                                .replace(/\ +/g, '')
                                .replace(/addedinAPIlevel/g, ''),
                        depApi: null,
                    };

                    manifestPermissions.push(permission);

                    // dbapi.insertPermissionInfo(permission);

                    return this;
                }
            })
            .map(function (i, elem) {
                if (i <= 10) {
                    console.log(i + '_______________________________________________________');
                }
                return elem;

            })
            .each(function (i, elem) {

                if (i <= 10) {
                    console.log(i + '_______________________________________________________');
                }

                // console.log($(elem).html());
                // console.log($(this).text());
                // console.log(i + '_______________________________________________________');


            }).length;

        console.log(manifestPermissions);
        console.log(permission_count);
    });
