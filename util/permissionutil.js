const util = require('util');

var cheerio = require('cheerio');
var superagent = require('superagent');
var ApkReader = require('adbkit-apkreader');
var Promise = require('bluebird');

var dbapi = require('../mongodb/dbapi');

var permissionutil = Object.create(null);

permissionutil.getManifestPermissionsFromGoogle = function () {
    var manifestPermissions = [];

    //首先删除数据
    dbapi.removeAllPermissionInfos();

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

                        dbapi.insertPermissionInfo(permission);

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
};

permissionutil.getPermissionListFromApk = function (apkPath) {
    return ApkReader.open(apkPath)
        .then(function (reader) {
            console.log(reader);
            return reader.readManifest();
        })
        .then(function (manifest) {
            return manifest.usesPermissions;
        })
        .then(function (usesPermissions) {

            var promises = [];
            usesPermissions.forEach(function (usesPermission) {
                promises.push(dbapi.getPermissionInfoByConstantValue(usesPermission.name));

            });
            return Promise.all(promises)
                .then(function (permissionInfos) {
                    return permissionInfos.filter(function (permissionInfo) {
                        if (null != permissionInfo) {
                            return true;
                        } else {
                            return false;
                        }
                    })
                })
                .then(function (permissionInfos) {
                    return permissionInfos.sort(function (perm1, perm2) {
                        return perm1.id - perm2.id;
                    });
                })
                .then(function (permissionInfos) {
                    console.log(permissionInfos.length);
                    permissionInfos.forEach(function (permissioninfo) {
                        console.log('--------------------------------------------------');
                        console.log(permissioninfo);

                    });
                    return permissionInfos;
                })
        });

};

permissionutil.getPermissionSuggestionsFromApk = function (apkPath) {
    ApkReader.open(apkPath)
        .then(function (reader) {
            console.log(reader);
            return reader.readManifest();
        })
        .then(function (manifest) {
            return manifest.usesPermissions;
        })
        .then(function (usesPermissions) {

            var promises = [];
            usesPermissions.forEach(function (usesPermission) {
                promises.push(dbapi.getPermissionInfoByConstantValue(usesPermission.name));

            });
            return Promise.all(promises)
                .then(function (permissionInfos) {
                    return permissionInfos.filter(function (permissionInfo) {
                        if (null != permissionInfo) {
                            return true;
                        } else {
                            return false;
                        }
                    })
                })
                .then(function (permissionInfos) {
                    //不建议使用的权限
                    var permissionInfos1 = [];
                    //谨慎使用的权限
                    var permissionInfos2 = [];
                    //可以使用的权限
                    var permissionInfos3 = [];
                    //其他权限
                    var permissionInfos4 = [];

                    permissionInfos.sort(function (perm1, perm2) {
                        return perm1.id - perm2.id;
                    }).forEach(function (permissionInfo) {
                        switch (permissionInfo.use_suggestion) {
                            case '不建议使用':
                                permissionInfos1.push(permissionInfo);
                                break;
                            case '谨慎使用':
                                permissionInfos2.push(permissionInfo);
                                break;
                            case '可以使用':
                                permissionInfos3.push(permissionInfo);
                                break;
                            case '':
                                permissionInfos4.push(permissionInfo);
                                break;
                            default:
                                break;
                        }
                    });

                    //打印权限建议
                    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++')
                    console.log('不建议使用的权限共 %s 个', permissionInfos1.length)
                    permissionInfos1.forEach(function (perm) {
                        console.log('-------------------------------------------------');
                        console.log(perm)
                        console.log('-------------------------------------------------');
                    });
                    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++')
                    console.log('谨慎使用的权限共 %s 个', permissionInfos2.length)
                    permissionInfos2.forEach(function (perm) {
                        console.log('-------------------------------------------------');
                        console.log(perm)
                        console.log('-------------------------------------------------');
                    });
                    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++')
                    console.log('可以使用的权限共 %s 个', permissionInfos3.length)
                    permissionInfos3.forEach(function (perm) {
                        console.log('-------------------------------------------------');
                        console.log(perm)
                        console.log('-------------------------------------------------');
                    });
                    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++')
                    console.log('其他权限共 %s 个', permissionInfos4.length)
                    permissionInfos4.forEach(function (perm) {
                        console.log('-------------------------------------------------');
                        console.log(perm)
                        console.log('-------------------------------------------------');
                    });
                });
        });

};

module.exports = permissionutil;