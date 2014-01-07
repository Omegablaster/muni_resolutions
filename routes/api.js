/*
 * Serve JSON to our AngularJS client
 */

exports.name = function (req, res) {
  res.json({
  	name: 'Bob'
  });
};

exports.countries = function (req, res) {
  res.json([
  			{
  				name: 'USA',
  				committees: [{name: 'DISEC', topics: [{name: "DISEC Topic 1"}, {name: "DISEC Topic 2"}]}, {name: 'SOCHUM', topics: [{name: "SOCHUM Topic 1"}, {name: "SOCHUM Topic 2"}]}, {name: 'FAO', topics: [{name: "FAO Topic 1"}, {name: "FAO Topic 2"}]}],
  			},
  			{
  				name: 'UK',
  				committees: [{name: 'DISEC', topics: [{name: "DISEC Topic 1"}, {name: "DISEC Topic 2"}]}, {name: 'SOCHUM', topics: [{name: "SOCHUM Topic 1"}, {name: "SOCHUM Topic 2"}]}],
  			},
  			]);
};
