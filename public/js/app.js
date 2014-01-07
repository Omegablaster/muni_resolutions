'use strict';


// Declare app level module which depends on filters, and services
angular.module('resolutions', ['resolutions.filters', 'resolutions.services', 'resolutions.directives', 'rcWizard', 'ui.sortable', 'ui.bootstrap']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/write', {templateUrl: 'partial/write', controller: WriteCtrl});
    $routeProvider.when('/learn', {templateUrl: 'partial/learn', controller: LearnCtrl});
    $routeProvider.when('/', {templateUrl: 'partial/home', controller: HomeCtrl});
    $locationProvider.html5Mode(true);
  }]);