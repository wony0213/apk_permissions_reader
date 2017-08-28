var Promise = require('bluebird');

var mongoose = require('./db.js');
var PermissionInfo = require("./permissioninfo.js");

var dbapi = Object.create(null);

dbapi.insertPermissionInfo = function (permission) {
    var permissionInfo = new PermissionInfo({
        id: permission.id,
        name: permission.name,
        constant_value: permission.constantValue,
        protection_level: permission.protectionLevel,
        add_api: permission.addApi
    });

    permissionInfo.save(function (err, res) {

        if (err) {
            console.log("Error:" + err);
        }
        else {
            console.log("Res:" + res);
        }

    });
};

dbapi.removeAllPermissionInfos = function () {
    PermissionInfo.remove({}, function(err) {
        if (err) {
            console.log(err + "删除所有PermissionInfo数据失败");
        } else {
            console.log("删除所有PermissionInfo数据成功。");
        }
    })

};

dbapi.getPermissionInfoByConstantValue2 = function (permissionName) {
    PermissionInfo.findOne({constant_value : permissionName}, function (err, permissionInfo) {
        if (err) {
            // console.log(err);
            return null;
        }
        console.log(permissionInfo);
        return permissionInfo;
    });

};

dbapi.getPermissionInfoByConstantValue3 = function (permissionName, callback) {
    PermissionInfo.findOne({constant_value : permissionName}, callback);
};

dbapi.getPermissionInfoByConstantValue = function (permissionName) {
    return PermissionInfo.findOne({constant_value : permissionName})
        .exec()
        .then(function (permissionInfo) {
            if (null != permissionInfo) {
                return permissionInfo.toObject();
            } else {
                return null;
            }

        })
        .catch(function (error) {
            console.error(error);
            return null;
        })
}

// dbapi.getPermissionInfoByConstantValue("android.permission.ACCESS_CHECKIN_PROPERTIES")
//     .then(function (permissionInfo) {
//         console.log(permissionInfo);
//         console.log(permissionInfo.constructor);
//         console.log('----------------------------------------------------------------------------------------');
//         console.log(permissionInfo.toObject());
//         console.log(permissionInfo.toObject().constructor);
//         console.log('----------------------------------------------------------------------------------------');
//     });


dbapi.disconnect = function () {
    mongoose.disconnect();
};

// dbapi.dropPermissionInfos = function () {
//     require('./db').connection.db.dropCollection('permissioninfos', function(err, result) {
//         // console.log(err);
//         // console.log(result);
//     });
// }

module.exports = dbapi;


