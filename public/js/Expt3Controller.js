var app = angular.module('AngularApp', ['ngRoute']);

app.controller('MainController', function ($scope, $route) {

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

     .when('/favorites', {
         templateUrl: 'partials/favorites.html',
         controller: 'FavouritesController'
     })
    
    .when('/shoppingCart', {
        templateUrl: 'partials/shoppingCart.html',
        controller: 'ShoppingCartController'
    })
    
    .when('/reviews/:id', {
        templateUrl: 'partials/reviews.html',
        controller: 'ReviewController'
    });

});

app.controller('searchController', function ($scope, $http) {
	$scope.flag = false;
        $http.get('/getDetails')
        	.success(function(response){
        		$scope.products = response;
                console.log($scope.products);
        	});
        
        $scope.addToFavorites = function (product) {
        	$http.post('/addFavorite',product);
        };  
        
        $scope.add = function(product){
        	product.image = '';
        	$http.post('/add', product)
        	.success(function(response){
        		$scope.products = response;
        	});
        }
        
        $scope.update = function(product){
        	$http.put('/shopping/update', product)
        	.success(function(response){
        		$scope.products = response;
        	});
        }
        
        $scope.addToCart = function(product){
        	$http.post('/shopping/addToCart', product);
        }
        
        $scope.populateProduct = function(product){
        	$scope.flag = true;
        	$scope.product = product;
        }

    });

       
app.controller('FavouritesController', function ($scope, $http) {
        $http.get('/favorites')
        .success(function (response) {
        	$scope.favoriteProducts = response;
        });
        console.log($scope.favoriteProducts);
});

app.controller('ShoppingCartController', function ($scope, $http) {
	$scope.cartProducts = [];
    $http.get('/shopping/cart')
    .success(function (response) {
    	$scope.cartProducts = response;
    	$scope.totalPrice = Number(0);
    	for(var i in response){
    		$scope.totalPrice = $scope.totalPrice + Number(response[i].salePrice);
    	}
    });
    
    $scope.remove = function(product){
    	$http.delete('/shopping/remove/'+product.id)
    	.success(function(response){
    		$scope.cartProducts = response;
    	});
    }
});

app.controller('ReviewController', function ($scope, $http, $routeParams) {
	var id = $routeParams.id;
	$scope.reviewId = id;
    $http.get('/shopping/reviews/'+ id)
    .success(function (response) {
    	$scope.reviews = response;
    });
    
    $scope.addReview = function(review){
    $http.post('/shopping/addReview/'+ review+'/'+$scope.reviewId)
    .success(function (response) {
    	console.log(response);
    	$scope.reviews = response;
    });
    }
});


