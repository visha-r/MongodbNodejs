var app = angular.module('AngularApp', ['ngRoute']);

app.controller('MainController', function ($scope, $route) {

});

app.config(function ($routeProvider) {
    $routeProvider
     .when('/home', {
         templateUrl: 'partials/Wallpaper.html'
     })

     .when('/search', {
         templateUrl: 'partials/productEditWithUserLink.html',
         controller: 'searchController'
     })

     .when('/favorites', {
         templateUrl: 'partials/favorites.html',
         controller: 'FavouritesController'
     })
    
    .when('/shoppingCart', {
        templateUrl: 'partials/shoppingCartWithEdit.html',
        controller: 'ShoppingCartController'
    })
    
    .when('/reviews/:id', {
        templateUrl: 'partials/reviewsWithUserLink.html',
        controller: 'ReviewController'
    })
    
    .when('/reviewer/:id', {
        templateUrl: 'partials/reviewerDetails.html',
        controller: 'ReviewerController'
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
	$scope.showCartCount = false;
	$scope.cartProducts = [];
    $http.get('/shopping/cart')
    .success(function (response) {
    	$scope.cartProducts = response;
    	$scope.totalPrice = Number(0);
    	for(var i in response){
    		console.log(response[i].count);
    		$scope.totalPrice = $scope.totalPrice + Number(response[i].salePrice)*Number(response[i].count);
    	}
    });
    
    $scope.remove = function(index){
    	$http.delete('/shopping/removeCartItem/'+index)
    	.success(function(response){
    		$scope.cartProducts = response;
    	});
    };
    
    $scope.editCount = function(index){
    	$scope.showCartCount = true;
    	$scope.selectedIndex = index;
    	$scope.cartProduct = $scope.cartProducts[index];
    	$scope.tempCount = $scope.cartProducts[index].count;
    	};
    	
    $scope.updateCount = function(product){
    	$scope.showCartCount = false;
    	if(product.count==0){
    		$scope.remove($scope.selectedIndex);
    	}
    	else
    	{
        $http.put('/shopping/updateCount/'+$scope.selectedIndex+'/'+product.count)
        .success(function(response){
        	$scope.cartProducts = response;
        	$scope.totalPrice = $scope.totalPrice + 
        	Math.abs(response[$scope.selectedIndex].count - $scope.tempCount) 
        	* response[$scope.selectedIndex].salePrice;
        });
        }
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
    	$scope.reviews = response;
    });
    }
});

app.controller('ReviewerController', function ($scope, $http, $routeParams) {
	var id = $routeParams.id;
	$scope.reviewId = id;
    $http.get('/shopping/getReviewerDetails/'+ id)
    .success(function (response) {
    	$scope.reviewer = response;
    });
});


