var mongoose = require('mongoose'),
	ShortId = require('mongoose-shortid');
    Schema = mongoose.Schema;

var ResolutionSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	_id: ShortId,
	resolution: {}
})

mongoose.model('Resolution', ResolutionSchema);