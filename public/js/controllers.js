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

function AdminCtrl($scope, $http, $modal) {

	var view_template = "<a target='_blank' ng-click='generate(row)' class='btn btn-primary btn-sm btn-block'>View</a>";

	var format = function(resolutions){
		var output = [];
		var getName = function(entry){
			if(entry){
				return entry.name;
			}else{
				return "";
			}
		}

		var preambToHTML = function(clause){return clause.phrase + ' ' + clause.text + ","}
		var opToHTML = function(clause){return clause.phrase + ' ' + clause.text + " (and " + clause.subclauses.length + " subclauses),"}
		var pream
		for(var i in resolutions){
			var current = resolutions[i].resolution;
			var new_entry = {};
			new_entry.Code = resolutions[i]._id;
			new_entry.Author = current.country.name;
			new_entry.Committee = current.committee && current.committee.name;
			new_entry.Topic = current.topic && current.topic.name;
			new_entry.Sponsors = current.sponsors.map(getName).join(", ");
			new_entry.Signatories = current.signatories.map(getName).join(", ");
			new_entry.Preambulatories = current.preambs.map(preambToHTML).join("\n");
			new_entry.Operatives = current.ops.map(opToHTML).join("\n");
			new_entry.View = i;
			output.push(new_entry);
		}
		return output;
	}

	$scope.gridOptions = { showGroupPanel: true, data: 'res_formatted', 
	columnDefs:[
		{field: 'Code'},
		{field: 'Author'},
		{field: 'Committee'},
		{field: 'Topic'},
		{field: 'Sponsors'},
		{field: 'Signatories'},
		{field: 'Preambulatories', cellTemplate: "<div>{{row.getProperty(col.field)}}</div>"},
		{field: 'Operatives'},
		{field: 'View', displayName: '', cellTemplate: view_template, width: '60px', height: '35px'}
	]};

	$http.get('/api/allres').then(
		function(response){
			console.log(response);
			$scope.resolutions = response.data.message
			$scope.res_formatted = format($scope.resolutions);
			if (!$scope.$$phase) {
               	$scope.$apply();
            }  
		},
		function(response){
			console.log(response);
		}
	);

	$scope.generate = function(row){
		console.log(row);
		var resolution = $scope.resolutions[row.rowIndex].resolution
		console.log(resolution);
		$http.post('/api/pdf', {resolution: resolution}).then(
			function(response) {
				console.log(response)
				window.open(response.data.message,'_blank');
	        }, 
	        function(response) {
	        	alert("Resolution not ready to be rendered");
	            console.log(response);
	        });
	}

}
AdminCtrl.$inject = ['$scope', '$http', '$modal'];

function WriteCtrl($scope, $http, $modal, resolution) {

	$scope.$on('resolution.update', function () {
		$scope.resolution = resolution;

		var countryIndex = -1;
		for(var i in $scope.countries) if ($scope.countries[i].name == resolution.country.name) countryIndex = i 
		$scope.resolution.country = $scope.countries[countryIndex];

		$scope.selectCountry();
		var committeeIndex = -1;
		for(var i in $scope.committees) if ($scope.committees[i].name == resolution.committee.name) committeeIndex = i
		$scope.resolution.committee = $scope.committees[committeeIndex];

		$scope.selectCommittee();
		var topicIndex = -1;
		for(var i in $scope.topics) if ($scope.topics[i].name == resolution.topic.name) topicIndex = i;
		$scope.resolution.topic = $scope.topics[topicIndex];
    });

	$http({method: 'GET', url: '/json/assignments_final.json'}).
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

	$scope.loadResolution = function(){
		var modalInstance = $modal.open({
        	templateUrl: 'partial/loadView',
        	controller: loadCtrl
      	});
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
	$scope.resolutionUrl = null;

	$http.post('/api/save', {resolution: resolution}).then(
		function(response) {
			resolution.setCode(response.data.message._id);
			$scope.resolutionCode = response.data.message._id;
			$http.post('/api/pdf', {resolution: resolution}).then(
			function(response) {
				$timeout(function(){
					$scope.resolutionUrl = response.data.message;
				}, 1000);
	        }, 
	        function(response) {
	            console.log(response);
	        });
		},
		function(response) {
			console.log(response);
		}
	)

	$scope.close = function () {
    	$modalInstance.dismiss('Closed');
  	};
}
pdfModalCtrl.$inject = ['$scope', '$modalInstance', 'resolution', '$timeout', '$http']


function saveCtrl($scope, $modalInstance, resolution, $timeout, $http) {
	console.log(resolution);

	$http.post('/api/save', {resolution: resolution}).then(
		function(response) {
			resolution.setCode(response.data.message._id);
			$scope.resolution = resolution;
		},
		function(response) {
			resolution.code = response.code;
		}
	)

	$scope.close = function () {
    	$modalInstance.dismiss('Closed');
  	};
}
saveCtrl.$inject = ['$scope', '$modalInstance', 'resolution', '$timeout', '$http']

function loadCtrl($scope, $modalInstance, resolution, $timeout, $http){
	$scope.load = function(code){
		$http.post('/api/load', {code: code}).then(
			function(response) {
				resolution.load(response.data.message[0].resolution);
				resolution.setCode(code);
				$modalInstance.dismiss('Closed');

			},
			function(response) {
				console.log("Error!")
			}
		)
	}

	$scope.close = function () {
    	$modalInstance.dismiss('Closed');
  	};
}
loadCtrl.$inject = ['$scope', '$modalInstance', 'resolution', '$timeout', '$http']

function LearnCtrl() {
}
LearnCtrl.$inject = [];

function HomeCtrl() {
}
HomeCtrl.$inject = [];
