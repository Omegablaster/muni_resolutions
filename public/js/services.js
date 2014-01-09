'use strict';

/* Services */
angular.module('resolutions.services', []).
  factory('resolution', ['$modal', function($modal){
  	var resolution = {};

  	//Set up initial state.	
  	resolution.country = null;
  	resolution.committee = null;
  	resolution.sponsors = [];
  	resolution.signatories = [];
  	resolution.preambs = [];
  	resolution.ops = [];

  	resolution.addSponsor = function(newSponsor){
  		resolution.sponsors.push(newSponsor);
  		newSponsor = null;
  	}

  	resolution.addSignatory = function(newSignatory){
  		resolution.signatories.push(newSignatory);
  		newSignatory = null;
  	}

  	resolution.addPreamb = function(newPreamb){
  		resolution.preambs.push(angular.copy(newPreamb));
  		newPreamb.phrase = null;
  		newPreamb.text = '';
  	}

  	resolution.addOp = function(newOp, subclauseField){
  		resolution.ops.push(angular.copy(newOp));
  		newOp.phrase = null;
  		newOp.text = '';
  		newOp.subclauses = [];
  		subclauseField = '';
  	}

  	resolution.generate = function(){
		var modalInstance = $modal.open({
      		templateUrl: 'partial/pdfView',
      		controller: pdfModalCtrl
		});
	}

  	return resolution;
  }]);
