const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const randomInt = require('random-number-ify');

const uriSchema = new Schema({
    url: String,
    id: String
});

uriSchema.pre('save', function(next) {
    this.id = randomInt(1000, 10000);
    next();
});

const URI = mongoose.model('URI', uriSchema);

module.exports = URI;
