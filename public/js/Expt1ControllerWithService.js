var app = angular.module('AngularApp', ['ngRoute']);

app.controller('MainController', function ($scope,$route) {

});

app.config(function ($routeProvider) {
    $routeProvider
     .when('/home', {
         templateUrl: '../partials/Wallpaper.html'
     })

     .when('/search', {
         templateUrl: 'SearchProductDetails.html',
         controller: 'searchController'
     })

});

app.controller('searchController', function ($scope, $http, ProductService) {
	console.log('ffffff');
    $('.product').change(function () {
        var sku = $(".product :selected").val();
    	console.log(sku);
        $scope.product = ProductService.fetchProducts(sku);
        	console.log('dd4556');
            console.log($scope.product);
            console.log('printed');
        });
        
    });


