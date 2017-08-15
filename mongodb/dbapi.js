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

// dbapi.dropPermissionInfos = function () {
//     require('./db').connection.db.dropCollection('permissioninfos', function(err, result) {
//         // console.log(err);
//         // console.log(result);
//     });
// }

module.exports = dbapi;
