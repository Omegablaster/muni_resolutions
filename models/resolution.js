var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ResolutionSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	resolution: {}
})

mongoose.model('Resolution', ResolutionSchema);