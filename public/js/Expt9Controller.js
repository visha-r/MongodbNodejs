var app = angular.module('AngularApp', ['ngRoute', 'ui.bootstrap']);

app.controller('MainController', function ($scope,$route, UserService, $rootScope, $location) {
	$rootScope.user = {};
	
	$scope.logout = function()
	{
		UserService.logout(function(response)
			{
			$rootScope.currentuser = null;	
			$location.path('/login');
			});
	}
});

app.filter('offset', function () {
    return function (input, start) {
        start = parseInt(start, 10);
        return input.slice(start);
    };
});

app.directive('starRating', function () {
    return {
        restrict: 'A',
        template: '<ul class="rating">' +
            '<li ng-repeat="star in stars" ng-class="star">' +
            '\u2605' +
            '</li>' +
            '</ul>',
        scope: {
            ratingValue: '=',
            max: '='
        },
        link: function (scope, elem, attrs) {
            scope.stars = [];
            for (var i = 0; i < scope.max; i++) {
                scope.stars.push({
                    filled: i < scope.ratingValue
                });
            }
        }
    }
});

app.config(function ($routeProvider, $httpProvider) {
    $routeProvider
     .when('/home', {
         templateUrl: 'partials/Wallpaper.html'
     })
     
     .when('/register', {
         templateUrl: 'partials/newRegistrationForm.html',
         controller: 'registerController'
     })
     
     .when('/login', {
		templateUrl: 'partials/login.html',
		controller: 'LoginController'
	 })

     .when('/search/:category/:manufacturer', {
         templateUrl: 'partials/productListWithDetails.html',
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
     
     .when('/viewDetails/:sku', {
        templateUrl: 'partials/productDetailsWithAddReview.html',
        controller: 'ProductDetailsController'
    })
    
     .when('/profile', {
        templateUrl: 'partials/UserDetails.html',
        controller: 'UserDetailsController',
        resolve: {
			loggedin: checkLoggedin
		}
    })
    
    .otherwise({
    	redirectTo: '/home'
    })
    
    $httpProvider
    .interceptors
    .push(function($q, $location)
    		{
    	return {
    		response: function(response)
    		{
    			return response;
    		},
    		responseError: function(response)
    		{
    			if (response.status === 401)
    				$location.url('/home');
    			return $q.reject(response);
    		}
    	};
    		});
});


var checkLoggedin = function($q, $timeout, $http, $location, $rootScope)
{
	var deferred = $q.defer();
	$http.get('/loggedin').success(function(user)
			{
		$rootScope.errorMessage = null;
		console.log(user);
//		User is Authenticated
		if (user !== '0')
			deferred.resolve();
//		User is Not Authenticated
		else
		{
			$rootScope.errorMessage = 'You need to log in.';
			deferred.reject();
			$location.url('/login');
		}
			});
	return deferred.promise;
};

app.controller('LoginController', function($scope, $http, $location, $rootScope, UserService)
		{
	$scope.login = function(user)
	{
		UserService.login(user, function(response)
				{
			$rootScope.currentuser = response.username;
			$rootScope.userId = response._id;
			$rootScope.user = response;
			console.log($rootScope.user);
			$location.url('/profile');
				});
	}
		});

app.controller('searchController', function ($scope, $http, $routeParams, ProductService, $rootScope, $location) {
	$scope.flag = false;
	$scope.category = $routeParams.category;
	$scope.manufacturer = $routeParams.manufacturer;
	$scope.itemsPerPage = 10;
    $scope.currentPage = 0;
    
    console.log($scope.userId);

	ProductService.fetchProductsByCategory($scope.manufacturer, $scope.category, function(response){
		console.log(response.products);
    		$scope.products = response.products;
    		
    		$scope.prevPage = function () {
    	        if ($scope.currentPage > 0) {
    	            $scope.currentPage--;
    	        }
    	    };

    	    $scope.prevPageDisabled = function () {
    	        return $scope.currentPage === 0 ? "disabled" : "";
    	    };

    	    $scope.pageCount = function () {
    	    	console.log(Math.ceil($scope.products.length / $scope.itemsPerPage)-1);
    	        return Math.ceil($scope.products.length / $scope.itemsPerPage)-1;
    	    };

    	    $scope.nextPage = function () {
    	        if ($scope.currentPage < $scope.pageCount()) {
    	            $scope.currentPage++;
    	        }
    	    };

    	    $scope.nextPageDisabled = function () {
    	        return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
    	    };

    	    $scope.setPage = function (n) {
    	        $scope.currentPage = n;
    	    };
    	    
    	    /*$scope.range = function() {
    	        var rangeSize = 5;
    	        var ret = [];
    	        var start;

    	        start = $scope.currentPage;
    	        if ( start > $scope.pageCount()-rangeSize ) {
    	          start = $scope.pageCount()-rangeSize+1;
    	        }

    	        for (var i=start; i<start+rangeSize; i++) {
    	          ret.push(i);
    	        }
    	        return ret;
    	      };*/
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

	$http.get('/loggedin').success(function(user)
			{
//		User is Authenticated
		if (user !== '0'){
			$scope.userId = $rootScope.user._id;
			var favorite = {id:productId};
			ProductService.fetchLogin(function(response){
			for(var i in response){
				if(response[i]._id == $scope.userId){
					$scope.user = response[i];
					break;
				}
				}
			$scope.user.favorites.push(favorite);
			ProductService.addFavorite($scope.user);
			$location.url('/profile');
	}); 
		}
//		User is Not Authenticated
		else
		{
			$location.url('/login');
		}
			});
};  

$scope.addToCart = function (productId) {
	$http.get('/loggedin').success(function(user)
			{
//		User is Authenticated
		if (user !== '0'){
			$scope.userId = $rootScope.user._id;
			var cart = {id:productId, count : 1};
			ProductService.fetchLogin(function(response){
				for(var i in response){
					if(response[i]._id == $scope.userId){
						$scope.user = response[i];
						break;
					}
				}
				$scope.user.cart.push(cart);
				console.log($scope.user);
				ProductService.addToCart($scope.user);
				$location.url('/profile');
			})
}
//		User is Not Authenticated
		else
		{
			$location.url('/login');
		}
});
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

		$scope.selectedProduct.reviews.unshift(review);

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
    		ProductService.getProduct(favoriteIds[j].id, function(response){
    			$scope.favoriteProducts.push(response.products[0]);
    		});
    	}
    });
});


app.controller('CartController', function ($scope, $http, $routeParams, ProductService) {
	var userId = $routeParams.username;
	$scope.cartProducts = [];
	if(typeof $scope.cartProducts == undefined){
		$scope.cartProducts = [];
	}
    $http.get('/user/cart/'+ userId)
    .success(function (response) {
    	var cartIds = response;
    	$scope.totalCount = 0;
    	$scope.totalPrice = Number(0);
    	for(var j in cartIds){
    		(function(j){
    		$scope.totalCount +=1;
    		ProductService.getProduct(cartIds[j].id, function(response){
    			var prdt = response.products[0];
    			prdt.count = cartIds[j].count;
    			prdt._id = cartIds[j]._id;
    			$scope.cartProducts.push(prdt);
    			$scope.totalPrice = $scope.totalPrice + Number(response.products[0].salePrice)*Number(cartIds[j].count);
    		});
    		})(j);
    	}
    });
    
    $scope.updateCount = function(product){
    	ProductService.fetchLogin(function(response){
    		for(var i in response){
    			if(response[i]._id == userId){
    				$scope.user = response[i];
    				break;
    			}
    			}
    		
    		for(var i in $scope.user.cart){
    			console.log($scope.user.cart[i]._id+"---"+$scope.user.cart[i].count);
				console.log(product._id + "---"+ product.count);
    			if($scope.user.cart[i]._id == product._id){
    				$scope.user.cart[i].count = product.count;
    				break;
    			}
    		}
    		ProductService.updateCart($scope.user, function(response){
    			var cartIds = response;
    			$scope.cartProducts = [];
    			$scope.totalPrice = 0;
    	    	for(var j in cartIds){
    	    		
    	    		(function(j) {
    	    			ProductService.getProduct(cartIds[j].id, function(response){
        	    			var prdt = response.products[0];
                			prdt.count = cartIds[j].count;
        	    			$scope.cartProducts.push(prdt);
        	    			$scope.totalPrice = $scope.totalPrice + Number(response.products[0].salePrice)*Number(cartIds[j].count);
        	    		});
    	    		  })(j);
    	    	}
    	    		
    		});
    	})
    };
    
    $scope.remove = function(product){
    	ProductService.fetchLogin(function(response){
    		for(var i in response){
    			if(response[i]._id == userId){
    				$scope.user = response[i];
    				break;
    			}
    			}
    		var ptr = 0;
    		for(var i in $scope.user.cart){
    			if($scope.user.cart[i].id == product.sku){
    				ptr = i;
    				break;
    			}
    		}
    		
    		$scope.user.cart.splice(ptr,1);
    		ProductService.updateCart($scope.user, function(response){
    			var cartIds = response;
    			$scope.cartProducts = [];
    			$scope.totalPrice = 0;
    	    	for(var j in cartIds){
    	    		ProductService.getProduct(cartIds[j].id, function(response){
    	    			var prdt = response.products[0];
            			prdt.count = cartIds[j].count;
    	    			$scope.cartProducts.push(prdt);
    	    			$scope.totalPrice = $scope.totalPrice + Number(response.products[0].salePrice)*Number(cartIds[j].count);
    	    		});
    	    	}
    		});
    	})
    };
});

app.controller('registerController', function ($scope, $http, ProductService, $location) {
    $scope.errMsg = "success";
    
	$http.get("http://api.geonames.org/countryInfo?type=JSON&username=visha")
	.success(function(response){
		$scope.countryList = response.geonames;
	})
	
    $scope.register = function(){
        ProductService.register($scope.user, function(response){
        	if(!response){
        		$scope.errMsg = null;
        	}
        	$location.url('/login');
        });
        };

});

app.controller('ProductDetailsController', function ($scope, $http, $routeParams, ProductService, $location, $rootScope) {

	$scope.show = false;
	$scope.myshow = true;
	$scope.btnshow = false;
	var sku = $routeParams.sku;
	
	ProductService.getProduct($routeParams.sku, function(response){
		$scope.product = response.products[0];
	})
	
	$scope.addToCart = function (productId) {
		$http.get('/loggedin').success(function(user)
				{
//			User is Authenticated
			if (user !== '0'){
				$scope.userId = $rootScope.user._id;
				var cart = {id:productId, count : 1};
				ProductService.fetchLogin(function(response){
					for(var i in response){
						if(response[i]._id == $scope.userId){
							$scope.user = response[i];
							break;
						}
					}
					$scope.user.cart.push(cart);
					console.log($scope.user);
					ProductService.addToCart($scope.user);
					$location.url('/profile');
				})
	}
//			User is Not Authenticated
			else
			{
				$location.url('/login');
			}
	});
	};
	
	$scope.getReviews = function(){
		ProductService.getReviews($scope.product.sku, function(response){
				$scope.reviews = response.reviews;
				ProductService.fetchProducts(function(response){
					for(var i in response){
						if(response[i].sku == sku){
							var tempReviews = response[i].reviews.concat($scope.reviews);
							$scope.reviews = [];
							$scope.reviews = tempReviews;
							break;
						}
						}
				})
		})
	}
	
	$scope.CheckIfLogged = function(){
		$http.get('/loggedin').success(function(user)
				{
//			User is Authenticated
			if (user !== '0'){
				$scope.userId = $rootScope.user._id;
				$scope.user = $rootScope.user;
				
			}
//			User is Not Authenticated
			else
			{
				$location.url('/login');
			}
	});
	}
	
	$scope.submitReview = function(review){
		
		ProductService.fetchLogin(function(response){
			for(var i in response){
				if(response[i]._id == $scope.userId){
					$scope.user = response[i];
					break;
				}
				}
			var reviewer = [];
			reviewer.push({name:$scope.user.username});
			
			// creates a new review object adding all necessary fields
			var myReview = {
							comment:review.comment, 
							title:review.title, 
							submissionTime : new Date(),
							reviewer : reviewer,
							rating: review.rating,
							local: true,  // tells if the review is a local one
							sku:sku		 // id of the product for which the review has been written
							};
			
			// resets the fields for dynamic hide and show
			review.comment = "";
			review.title = "";
			review.rating = 1;
			
			if(typeof $scope.user.reviews == undefined){
				$scope.user.reviews = [];
			}
			
			// updates the user's profile by adding this review to his reviews list
			$scope.user.reviews.push(myReview);
			ProductService.addReviews($scope.user, function(response){
				
				});
			
			$scope.reviews.unshift(myReview);
			
			// fetches the local reviews of the product if there is any
			var localProduct = {};
			ProductService.fetchProducts(function(response){
				for(var i in response){
					if(response[i].sku == sku){
						localProduct = response[i];
						break;
					}
					}
				
			// if the products doesn't have any local reviews already, a new review will be created
				
				if(jQuery.isEmptyObject(localProduct)){
					var localReview = [];
					localReview.push(myReview);
					localProduct = {sku: sku, reviews:localReview};
					ProductService.addProductReview(localProduct, function(response){
						
						})
				}
				// if the product already has local reviews, the current review will be pushed to it
				else
					{
					localProduct.reviews.push(myReview);
					ProductService.updateProductReview(localProduct, function(response){
						
						})
					}
				})
		})
	}
});

app.controller('UserDetailsController', function ($scope, $http, $rootScope, UserService, ProductService) {
	console.log($rootScope.currentuser);
	$scope.username = $rootScope.currentuser;
	UserService.getUserDetails($scope.username, function(response){
		$scope.user = response;
		$scope.userId = response._id;
		
		// fetches the details of the favorite products from the remote database
		$scope.favoriteProducts = [];
		for(i in $scope.user.favorites){
			(function(i){
				console.log($scope.user.favorites[i].id);
				ProductService.getProduct($scope.user.favorites[i].id, function(response){
					$scope.favoriteProducts.push(response.products[0]);
			})
			})(i);
		}
		
		// fetches the details of the cart products from the remote database
		$scope.cartProducts = [];
		for(i in $scope.user.cart){
			(function(i){
				ProductService.getProduct($scope.user.cart[i].id, function(response){
					$scope.cartProducts.push(response.products[0]);
			})
			})(i);
		}
	})
})

                
