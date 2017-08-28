const util = require('util')
const ApkReader = require('adbkit-apkreader')

var permissionutil = require('./util/permissionutil');

// ApkReader.open('/Users/wony/Downloads/360App/通讯类/微信 6.5.10.apk')
// .then(reader => reader.readManifest())
// .then(manifest => console.log(manifest.usesPermissions);


// permissionutil.getManifestPermissionsFromGoogle();
// permissionutil.getPermissionListFromApk('/Users/wony/Downloads/360App/通讯类/微信 6.5.10.apk');

permissionutil.getPermissionSuggestionsFromApk('/Users/wony/Downloads/360App/通讯类/微信 6.5.10.apk');