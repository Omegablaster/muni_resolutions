'use strict';

/* Controllers */

function AppCtrl($scope, $http) {
  $http({method: 'GET', url: '/api/name'}).
  success(function(data, status, headers, config) {
    $scope.name = data.name;
  }).
  error(function(data, status, headers, config) {
    $scope.name = 'Error!'
  });
}

function WriteCtrl($scope, $http, $modal, resolution) {

	$http({method: 'GET', url: '/api/countries'}).
  		success(function(data, status, headers, config) {
    		$scope.countries = data;
 		}).
  		error(function(data, status, headers, config) {
    		$scope.countries = 'Error!'
  		});

  	$http.get('/api/phrases').then(
  		function(response) {
			$scope.preambPhrases = response.data.preambulatory;
			$scope.opPhrases = response.data.operative;
        }, 
        function(response) { // optional
            console.log(response);
        }
    );

  	$scope.selectCountry = function(){
  		$scope.committees = $scope.resolution.country.committees;
  	}

  	$scope.selectCommittee = function(){
  		$scope.topics = $scope.resolution.committee.topics;
  	}

  	$scope.alreadyAdded = function(array){
        return function(item) {
            return (array.indexOf(item) == -1);
        }
  	}

  	$scope.addSubclause = function(subclause, clause){
  		clause.subclauses.push(angular.copy(subclause));
  		$scope.newSubclause = '';
  	}


	$scope.newPreamb = {};
	$scope.newOp = {};
	$scope.newOp.subclauses = [];

  	$scope.resolution = resolution;

	$scope.editPreamb = function(index){
		$scope.newPreamb = $scope.resolution.preambs.splice(index, 1)[0]
	}

	$scope.editOp = function(index){
		$scope.newOp = $scope.resolution.ops.splice(index, 1)[0]
	}

	$scope.editSub = function(index){
		$scope.newSubclause = $scope.newOp.subclauses.splice(index, 1)[0]
	}

	$scope.deleteItem = function(index, sourceArray){
      	sourceArray.splice(index, 1);
      	return;
	}

	$scope.addItem = function(item, targetArray){
		targetArray.push(item);
		return;
	}

	$scope.sortableOptions = {
	  update: function(e, ui) {
	    if (ui.item.scope().item == "can't be moved") {
	      ui.item.parent().sortable('cancel');
	    }
	  },
	  cancel: ".option-item",
	  axis: 'y',
	  placeholder: "list-group-item faded"
	};
}
WriteCtrl.$inject = ['$scope', '$http', '$modal', 'resolution'];


function pdfModalCtrl($scope, $modalInstance, resolution, $timeout, $http) {

	var countryString = function(countryList){
		if(countryList.length > 1){
			var last = countryList.pop();
			var rest = countryList.join(", ");
			return rest + " and " + last;
		}else if (countryList.length == 0)
			return "None :(";
		else
			return countryList[0];		
	}

	var outputBuffer = "<p style='margin: 0px; margin-bottom:5px'><b>" + resolution.committee.name + "</b></p>";
	
	var getName = function(elem){return elem.name};
	resolution.sponsors.unshift(resolution.country);
	var sponsorsString = "Sponsors: ";
	var signatoriesString = "Signatories: ";

	if(resolution.sponsors.length > 0)
	 	sponsorsString = sponsorsString + countryString(resolution.sponsors.map(getName));

	if(resolution.signatories.length > 0)
		signatoriesString = signatoriesString + countryString(resolution.signatories.map(getName));

	outputBuffer = outputBuffer + "<p style='margin: 0px'>" + sponsorsString + "</p><p style='margin: 0px'>" + signatoriesString + "</p><p> Topic: \"" + resolution.topic.name + "\"</p>";

	//Preambulatory
	var preambToHTML = function(clause){return "<li><span style='text-decoration:underline;'>" + clause.phrase + "</span> " + clause.text + ",</li>"}
	outputBuffer = outputBuffer + "<ul style='list-style:none'>" + resolution.preambs.map(preambToHTML).join("") + "</ul>";

	//Operative
	var opToHTML = function(clause, index){
		var isLast = (index == (resolution.ops.length - 1));		
		var body = "<span style='text-decoration:underline;'>" + clause.phrase + "</span> " + clause.text;
		if(clause.subclauses.length > 0){
			var subclauses = "";
			var lastSubclause = clause.subclauses.pop();
			for(var i = 0; i < clause.subclauses.length; i++){
				subclauses = subclauses + "<li>" + clause.subclauses[i] + ";</li>";
			}
			subclauses = subclauses + "<li>" + lastSubclause + ((isLast) ? "." : ";") + "</li>"

			return "<li>" + body + ";<ol type='i'>" + subclauses + "</ol>";
		}else
			return "<li>" + body + ((isLast) ? "." : ";") + "</li>";	
	}

	outputBuffer = outputBuffer + "<ol>" + resolution.ops.map(opToHTML).join(""); + "</ol>";

	console.log(outputBuffer);

	$scope.resolutionUrl = null;

	$http.post('/api/pdf', {html: outputBuffer}).then(
		function(response) {
			$timeout(function(){
				$scope.resolutionUrl = response.data.message;
			}, 1000);
        }, 
        function(response) {
            console.log(response);
        });

	$scope.close = function () {
    	$modalInstance.dismiss('Closed');
  	};
}
pdfModalCtrl.$inject = ['$scope', '$modalInstance', 'resolution', '$timeout', '$http']


function saveCtrl($scope, $modalInstance, resolution, $timeout, $http) {
	console.log(resolution);

	$http.post('/api/save', {resolution: resolution}).then(
		function(response) {
			
		},
		function(response) {
			console.log(response);
		}
	)

	$scope.close = function () {
    	$modalInstance.dismiss('Closed');
  	};
}
saveCtrl.$inject = ['$scope', '$modalInstance', 'resolution', '$timeout', '$http']

function LearnCtrl() {
}
LearnCtrl.$inject = [];

function HomeCtrl() {
}
HomeCtrl.$inject = [];
