'use strict';

/* Directives */


angular.module('resolutions.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).directive('pdf', function() {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            attrs.$observe('src', function(value) {
              if (value) {
                element.html(
                  '<iframe width="100%" height="400px" src="' + value + '">');
              } else {
                element.html("<div></div>"); // We have to put something into the DOM
              }
            });
        }
    };
  });