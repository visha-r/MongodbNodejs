
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

     .when('/search/:category/:manufacturer/:username', {
         templateUrl: 'partials/searchWithFavoritesWithoutSearchbar.html',
         controller: 'searchController'
     })
     
     .when('/favorites/:username', {
         templateUrl: 'partials/favorites.html',
         controller: 'FavouritesController'
     })
     
     .when('/cart/:username', {
         templateUrl: 'partials/shoppingCart.html',
         controller: 'CartController'
     })
     
     .when('/reviews/:index', {
        templateUrl: 'partials/reviews.html',
        controller: 'ReviewController'
    })

});

app.controller('searchController', function ($scope, $http, $routeParams, ProductService) {
	$scope.flag = false;
	$scope.category = $routeParams.category;
	$scope.manufacturer = $routeParams.manufacturer;
	$scope.userId = $routeParams.username;
	
	ProductService.fetchProductsByCategory($scope.manufacturer, $scope.category, function(response){
    		$scope.products = response.products;
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

$scope.addToCart = function (productId) {
	ProductService.fetchLogin(function(response){
		for(var i in response){
			if(response[i]._id == $scope.userId){
				$scope.user = response[i];
				break;
			}
			}
		$scope.user.cart.push(productId);
		console.log($scope.user.cart);
		ProductService.addToCart($scope.user);
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


app.controller('CartController', function ($scope, $http, $routeParams, ProductService) {
	var username = $routeParams.username;
	$scope.cartProducts = [];
	if(typeof $scope.cartProducts == undefined){
		$scope.cartProducts = [];
	}
    $http.get('/user/cart/'+ username)
    .success(function (response) {
    	var cartIds = response;
    	for(var j in cartIds){
    		ProductService.getProduct(cartIds[j], function(response){
    			$scope.cartProducts.push(response.products[0]);
    		});
    	}
    });
    
    $scope.remove = function(index){
    	
    	ProductService.fetchLogin(function(response){
    		for(var i in response){
    			if(response[i]._id == username){
    				$scope.user = response[i];
    				break;
    			}
    			}
    		$scope.user.cart.splice(index,1);
    		console.log($scope.user.cart);
    		ProductService.updateCart($scope.user, function(response){
    			$scope.cartProducts = response ;
    		});
    	})
    };
});




                
