'use strict';


// Declare app level module which depends on filters, and services
angular.module('resolutions', ['resolutions.filters', 'resolutions.services', 'resolutions.directives', 'rcWizard', 'ui.sortable', 'ui.bootstrap', 'ngGrid']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/write', {templateUrl: 'partial/write', controller: WriteCtrl});
    $routeProvider.when('/learn', {templateUrl: 'partial/learn', controller: LearnCtrl});
    $routeProvider.when('/how', {templateUrl: 'partial/how'});
    $routeProvider.when('/admin', {templateUrl: 'partial/admin', controller: AdminCtrl});
    $routeProvider.when('/', {templateUrl: 'partial/home', controller: HomeCtrl});
    $routeProvider.otherwise({templateUrl: 'partial/404'});
    $locationProvider.html5Mode(true);
  }]);