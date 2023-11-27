const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    userId: {
        type: String,
        unique: true,
        require: true
    },
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    blocked: {
        type: Boolean, default: false
    },
    role: {
        type: String, default: 'user'
    },
    history: Array,
    tmpHistory: {
        hId: String,
        hName: String,
        hType: String,
        hTime: Date,
        hValues: Schema.Types.Mixed
    },
    favorite: Array,
    tmpFavorite: {
        fId: String,
        fName: String,
        fType: String,
        fStatus: Boolean,
        fTime: Date
    }

})

const User = mongoose.model('User', UserSchema);
module.exports = {User};