
var app = angular.module('AngularApp', ['ngRoute']);

app.controller('MainController', function ($scope,$route) {

});

app.config(function ($routeProvider) {
    $routeProvider
     .when('/home', {
         templateUrl: 'partials/Wallpaper.html'
     })

     .when('/search', {
         templateUrl: 'partials/addProductWithEdit.html',
         controller: 'searchController'
     })

});

app.controller('searchController', function ($scope, $http, ProductService) {
		$scope.flag = false;
		
        ProductService.fetch()
        	.success(function(response){
        		$scope.products = response;
        	});
        
        $scope.add = function(product){
        ProductService.addProduct(product)	
    	.success(function(response){
    		$scope.products = response;
    	});
        };
    	
    	$scope.remove = function (product){
    		ProductService.removeProduct(product)
        	.success(function(response){
        		$scope.products = response;
        	});
    };
    
    $scope.populateProduct = function(product){
    	$scope.flag = true;
    	$scope.product = product;
    }
    
    $scope.update = function(product){
    	ProductService.updateProduct(product)
    	.success(function(response){
    		$scope.products = response;
    	});
    }
});




                
