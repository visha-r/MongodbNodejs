
var app = angular.module('AngularApp', ['ngRoute']);

app.controller('MainController', function ($scope,$route, ProductService) {

	$scope.login = function(){
		ProductService.fetchLogin(function(response){
			for(var i in response){
				if(response[i].username == $scope.username && response[i].password == $scope.password){
					$scope.currentuser = $scope.username;
					$scope.userId = response[i]._id;
				}
			}
		})
	}
	
	$scope.logout = function(){
		$scope.userId = null;
		$scope.currentuser = null;
	}
});

app.config(function ($routeProvider) {
    $routeProvider
     .when('/home', {
         templateUrl: 'partials/Wallpaper.html'
     })

     .when('/search/:username', {
         templateUrl: 'partials/SearchWithFavorites.html',
         controller: 'searchController'
     })
     
     .when('/favorites/:username', {
         templateUrl: 'partials/favorites.html',
         controller: 'FavouritesController'
     })
     
     .when('/reviews/:index', {
        templateUrl: 'partials/reviews.html',
        controller: 'ReviewController'
    })

});

app.controller('searchController', function ($scope, $http, $routeParams, ProductService) {
	$scope.flag = false;
	$scope.userId = $routeParams.username;
	
    $scope.fetchProducts = function(){
    	ProductService.fetchProducts($scope.title, function(response){
    		$scope.products = response.products;
    	});
    }
    
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

$scope.addToFavorites = function (productId) {
	ProductService.fetchLogin(function(response){
		for(var i in response){
			if(response[i]._id == $scope.userId){
				$scope.user = response[i];
				break;
			}
			}
		$scope.user.favorites.push(productId);
		console.log($scope.user.favorites);
		ProductService.addFavorite($scope.user);
	})
};  


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
			ProductService.fetch()
			.success( function(response) {
				console.log(index);
				$scope.reviews = response[index].reviews;
		});
	});
	}

});

app.controller('FavouritesController', function ($scope, $http, $routeParams, ProductService) {
	var username = $routeParams.username;
	$scope.favoriteProducts = [];
    $http.get('/user/favorites/'+ username)
    .success(function (response) {
    	var favoriteIds = response;
    	for(var j in favoriteIds){
    		ProductService.getProduct(favoriteIds[j], function(response){
    			$scope.favoriteProducts.push(response.products[0]);
    		});
    	}
    });
});




                
