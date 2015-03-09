
var app = angular.module('AngularApp', ['ngRoute']);

app.controller('MainController', function ($scope,$route) {

});

app.config(function ($routeProvider) {
    $routeProvider
     .when('/home', {
         templateUrl: 'partials/Wallpaper.html'
     })

     .when('/search', {
         templateUrl: 'partials/productsWithReviewLink.html',
         controller: 'searchController'
     })
     
     .when('/reviews/:index', {
        templateUrl: 'partials/reviews.html',
        controller: 'ReviewController'
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

app.controller('ReviewController', function ($scope, $http, $routeParams, ProductService) {
	var index = $routeParams.index;

		ProductService.fetch()
		.success( function(response){
			$scope.selectedProduct = response[index];
			$scope.reviews = response[index].reviews;
		});
		

	$scope.addReview = function(review){
		
		if(typeof $scope.selectedProduct.reviews == undefined){
			$scope.selectedProduct.reviews = [];
		}

		$scope.selectedProduct.reviews.push(review);

		ProductService.addReview($scope.selectedProduct, function(response){
			console.log(response);
			ProductService.fetch()
			.success( function(response) {
				console.log(index);
				$scope.reviews = response[index].reviews;
		});
	});
	}
});




                
