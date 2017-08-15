var mongoose = require('./db.js'),
    Schema = mongoose.Schema;

var PermissionInfoSchema = new Schema({
    id: {type: Number},
    name: {type: String},
    constant_value: {type: String},
    protection_level: {type: String},
    add_api: {type: Number}
});

module.exports = mongoose.model('PermissionInfo', PermissionInfoSchema);