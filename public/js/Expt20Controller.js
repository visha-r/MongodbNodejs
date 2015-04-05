
var app = angular.module('AngularApp', ['ngRoute','ui.bootstrap.transition', 'ui.bootstrap']);

app.controller('MainController', function ($scope,$route, UserService, $rootScope, $location) {

	$rootScope.user = {};

	$scope.logout = function()
	{
		UserService.logout(function(response)
				{
			$rootScope.currentuser = null;	
			$rootScope.userId = null;
			$rootScope.user = null;
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

app.controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', 
                                      function ($scope, $timeout, $transition, $q) {
}]).directive('carousel', [function() {
	return {

	}
}]);

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

app.directive('uniqueUsername', ['$http', function($http, $timeout) {  
	return {
		require: 'ngModel',
		link: function(scope, elem, attrs, ctrl) {
			scope.busy = false;
			scope.$watch(attrs.ngModel, function(value) {

				// hide old error messages
				ctrl.$setValidity('isTaken', true);

				if (!value) {
					// empty username is caught by required directive
					return;
				}

				// show spinner
				scope.busy = true;

				// send request to server
				$http.post('/user/checkUsername',{username:value})
				.success(function(data) {
					// everything is fine -> do nothing
					scope.busy = false;

				})
				.error(function(data) {

					// display new error message
					if (data.isTaken) {
						ctrl.$setValidity('isTaken', false);
					}
					scope.busy = false;
				});
			})
		}
	}
}]);

app.directive('checkPassword', ['$http', function($http, $timeout) {  
	return {
		require: 'ngModel',
		link: function(scope, elem, attrs, ctrl) {
			scope.busy = false;
			scope.$watch(attrs.ngModel, function(value) {

				// hide old error messages
				ctrl.$setValidity('noMatch', true);

				if (!value) {
					// empty username is caught by required directive
					return;
				}

				// show spinner
				scope.busy = true;

				// send request to server
				$http.post('/user/checkPassword',{username:scope.user.username, password:value})
				.success(function(data) {
					// everything is fine -> do nothing
					scope.busy = false;

				})
				.error(function(data) {

					// display new error message
					if (data.noMatch) {
						ctrl.$setValidity('noMatch', false);
					}
					scope.busy = false;
				});
			})
		}
	}
}]);

app.directive('match', [function () {
	return {
		require: 'ngModel',
		link: function (scope, elem, attrs, ctrl) {
			scope.$watch('[' + attrs.ngModel + ', ' + attrs.match + ']', function(value){
				ctrl.$setValidity('match', value[0] === value[1] );
			}, true);
		}
	}
}]);

app.config(function ($routeProvider, $httpProvider) {
	$routeProvider
	.when('/home', {
		templateUrl: 'partials/Wallpaper.html'
	})

	.when('/register', {
		templateUrl: 'partials/regWithValidation.html',
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
		templateUrl: 'partials/productDetailsWithUserLink.html',
		controller: 'ProductDetailsController'
	})

	.when('/showUserDetails/:username', {
		templateUrl: 'partials/userDetailsWithDynamicLink.html',
		controller: 'UserDetailsController'
	})

	.when('/profile/:activeTab', {
		templateUrl: 'partials/userProfileWithUpdate.html',
		controller: 'UserProfileController',
		resolve: {
			loggedin: checkLoggedin
		}
	})

	.when('/storeLocator', {
		templateUrl: 'partials/StoreLocator.html',
		controller: 'StoreController'
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
			$location.url('/profile/'+"user");
				});
	}
		});

app.controller('searchController', function ($scope, $http, $routeParams, ProductService, $rootScope, $location) {
	$scope.flag = false;
	$scope.category = $routeParams.category;
	$scope.manufacturer = $routeParams.manufacturer;
	$scope.userId = $routeParams.username;
	$scope.noLogin = $scope.userId;
	$scope.itemsPerPage = 10;
	$scope.orderedBy = "+salePrice";
	$scope.currentPage = 0;

	$scope.pagination = function(){

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
	}

	ProductService.fetchProductsByCategory($scope.manufacturer, $scope.category, function(response){
		console.log(response.products);
		$scope.products = response.products;
		$scope.orderedBy = "name";
		$scope.pagination();

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

	$scope.addToFavorites = function (productId) {
		$http.get('/loggedin').success(function(user)
				{
//			User is Authenticated
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
					$location.url('/profile/'+"favorite");
				}); 
			}
//			User is Not Authenticated
			else
			{
				$location.url('/login');
			}
				});
	};  

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

					var alreadyPresent = false;	
					for(var i in $scope.user.cart)	{
						(function(i){
							if($scope.user.cart[i].id == productId){
								console.log('present');
								alreadyPresent = true;
								$scope.user.cart[i].count +=1;
								$rootScope.cartCount += 1;
								ProductService.addToCart($scope.user);
								$location.url('/profile/'+"cart");
							}
						})(i);
					}
					if(!alreadyPresent){
						console.log('not present');
						$scope.user.cart.push(cart);
						$rootScope.cartCount += 1;
						console.log($scope.user);
						ProductService.addToCart($scope.user);
						$location.url('/profile/'+"cart");
					}
				})
			}
//			User is Not Authenticated
			else
			{
				$location.url('/login');
			}
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
			ProductService.fetch()
			.success( function(response) {
				console.log(index);
				$scope.reviews = response[index].reviews;
			});
		});
	}

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
	$scope.user = {};

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

app.controller('ProductDetailsController', function ($scope, $http, $routeParams, ProductService, UserService, $rootScope, $location) {

	$scope.show = false;
	$scope.myshow = true;
	$scope.btnshow = false;
	var sku = $routeParams.sku;
	$scope.userId = $routeParams.userId;

	// fetches all related products from the remote database
	ProductService.getProduct($routeParams.sku, function(response){
		$scope.product = response.products[0];
		$scope.relatedProducts = [];
		console.log($scope.product.relatedProducts);
		for(var i in $scope.product.relatedProducts){
			if(i==8)
				break;
			(function(i){
				ProductService.getProduct($scope.product.relatedProducts[i].sku, function(result){
					console.log(result);
					$scope.relatedProducts.push(result.products[0]);
				})
			})(i)
		}
	})

	$scope.addToCart = function (productId) {
		UserService.checkLoggedIn(function(user)
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

					var alreadyPresent = false;	
					for(var i in $scope.user.cart)	{
						(function(i){
							if($scope.user.cart[i].id == productId){
								console.log('present');
								alreadyPresent = true;
								$scope.user.cart[i].count +=1;
								$rootScope.cartCount += 1;
								ProductService.addToCart($scope.user);
								$location.url('/profile/'+"cart");
							}
						})(i);
					}
					if(!alreadyPresent){
						console.log('not present');
						$scope.user.cart.push(cart);
						$rootScope.cartCount += 1;
						console.log($scope.user);
						ProductService.addToCart($scope.user);
						$location.url('/profile/'+"cart");
					}
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
		ProductService.getReviews(sku, function(response){
			$scope.reviews = response.reviews;
			ProductService.fetchProducts(function(response){
				for(var i in response){
					if(response[i].sku == sku){
						var tempReviews = $scope.reviews.concat(response[i].reviews);
						$scope.reviews = [];
						$scope.reviews = tempReviews;
						break;
					}
				}
			})
		})
	}

	$scope.CheckIfLogged = function(){
		UserService.checkLoggedIn(function(user)
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
			console.log($scope.user.reviews);
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
					localReview.unshift(myReview);
					localProduct = {sku: sku, reviews:localReview};
					ProductService.addProductReview(localProduct, function(response){

					})
				}
				// if the product already has local reviews, the current review will be pushed to it
				else
				{
					localProduct.reviews.unshift(myReview);
					ProductService.updateProductReview(localProduct, function(response){

					})
				}
			})
		})
	}
});

app.controller('UserDetailsController', function ($scope, $http, $routeParams, UserService, ProductService, $location, $rootScope) {

	$scope.username = $routeParams.username;
	$scope.currentuser = $rootScope.currentuser;
	$scope.followsAlready = false;
	UserService.checkLoggedIn(function(result)
			{
		if (result !== '0'){
			UserService.getUserDetails($scope.currentuser, function(response){
				for(var i in response.follows){
					if(response.follows[i].username == $scope.username){
						$scope.followsAlready = true;
						break;
					}
				}

			})
		}
			})

			UserService.getUserDetails($scope.username, function(response){
				$scope.user = response;
				$scope.userId = response._id;
				// fetches the details of the favorite products from the remote database
				$scope.favoriteProducts = [];
				for(i in $scope.user.favorites){
					(function(i){
						ProductService.getProduct($scope.user.favorites[i].id, function(response){
							$scope.favoriteProducts.push(response.products[0]);
						})
					})(i);
				}

				// fetches the details of the reviewed products from the remote database
				$scope.reviewedProducts = [];
				for(i in $scope.user.reviews){
					(function(i){
						ProductService.getProduct($scope.user.reviews[i].sku, function(response){
							console.log(response);
							var tempProduct = response.products[0];
							tempProduct.userReview = $scope.user.reviews[i];
							$scope.reviewedProducts.push(tempProduct);
						})
					})(i);
				}
			})


			$scope.addToFavorites = function (productId) {
		$http.get('/loggedin').success(function(user)
				{
//			User is Authenticated
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
					$location.url('/profile/'+"favorite");
				}); 
			}
//			User is Not Authenticated
			else
			{
				$location.url('/login');
			}
				});
	}; 

	$scope.followUser = function(){
		UserService.checkLoggedIn(function(result)
				{
//			User is Authenticated
			if (result !== '0'){
				result.follows.unshift({username:$scope.username});
				console.log(result);
				$scope.followsAlready = true;
				UserService.addFollows(result, function(response){
					console.log(response);
					UserService.getUserDetails($scope.username, function(response){
						response.followedBy.unshift({username:$scope.currentuser});
						UserService.addFollowedBy(response, function(){
							$location.url('/profile/'+"network");
						})

					})
				})			
			}
			else{
				$location.url('/login');
			}
				})
	}

	// unfollows the user which the user already follows	
	$scope.unfollowUser = function(){
		UserService.checkLoggedIn(function(result)
				{
//			User is Authenticated
			if (result !== '0'){
				var ptr = 0;
				for(var i in result.follows){
					if(result.follows[i].username == $scope.username){
						ptr = i;
						break;
					}
				}
				result.follows.splice(ptr,1);
				$scope.user.follows.splice(ptr,1);
				$scope.followsAlready = false;

				UserService.addFollows(result, function(response){
					UserService.getUserDetails($scope.username, function(newUser){
						var ptr1 = 0;
						for(var i in newUser.followedBy){
							if(newUser.followedBy[i].username == result.username){
								ptr1 = i;
								break;
							}
						}
						newUser.followedBy.splice(ptr1,1);
						UserService.addFollowedBy(newUser, function(){
							$location.url('/profile/'+"network");
						})
					})
				})			
			}
			else{
				$location.url('/login');
			}
				})
	}		
})

app.controller('UserProfileController', function ($scope, $http, $routeParams, UserService, ProductService, $rootScope, $location) {

	$scope.itemsPerPage = 5;
	$scope.currentPage = 0;
	$scope.oneAtATime = true;
	$scope.profile = true;
	$scope.updProfile = false;
	$scope.updPswd = false;

	$scope.userActive = false;
	$scope.favActive = false;
	$scope.cartActive = false;
	$scope.reviewActive = false;
	$scope.networkActive = false;
	$scope.showEdit = true;

	var tab = $routeParams.activeTab;
	console.log(tab);

	if(tab == 'favorite'){
		$scope.favActive = true;
	}
	else if(tab == 'cart'){
		$scope.cartActive = true;
	}
	else if(tab == 'review'){
		$scope.reviewActive = true;
	}
	else if(tab == 'network'){
		$scope.networkActive = true;
	}
	else {
		$scope.userActive = true;
	}

	$scope.status = {
			isFirstOpen: true,
			isFirstDisabled: false
	};

	$scope.prevPage = function () {
		if ($scope.currentPage > 0) {
			$scope.currentPage--;
		}
	};

	$scope.prevPageDisabled = function () {
		return $scope.currentPage === 0 ? "disabled" : "";
	};

	$scope.pageCount = function () {
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

	// user who is currently logged in

	$scope.username = $rootScope.currentuser;
	console.log( $scope.username);
	UserService.getUserDetails($scope.username, function(response){
		$scope.user = response;
		$scope.userId = response._id;

		console.log($scope.user);

		// fetches the details of the favorite products from the remote database
		$scope.favoriteProducts = [];
		for(i in $scope.user.favorites){
			console.log($scope.user.favorites[i]);
			(function(i){
				ProductService.getProduct($scope.user.favorites[i].id, function(response){
					$scope.favoriteProducts.push(response.products[0]);
				})
			})(i);
		}

		console.log($scope.favoriteProducts);

		// fetches the details of the cart products from the remote database
		$scope.cartProducts = [];
		$scope.totalCount = 0;
		$scope.totalPrice = Number(0);
		$rootScope.cartCount = 0;
		for(i in $scope.user.cart){
			console.log($scope.user.cart[i]);
			(function(i){
				$scope.totalCount +=1;
				ProductService.getProduct($scope.user.cart[i].id, function(response){
					var prdt = response.products[0];
					prdt.count = $scope.user.cart[i].count;
					prdt._id = $scope.user.cart[i]._id;
					$scope.cartProducts.push(prdt);
					$rootScope.cartCount += $scope.user.cart[i].count;
					$scope.totalPrice = $scope.totalPrice + Number(response.products[0].salePrice)*Number($scope.user.cart[i].count);
				})
			})(i);
		}

		// fetches the details of the reviewed products from the remote database
		$scope.reviewedProducts = [];
		for(j in $scope.user.reviews){
			console.log($scope.user.reviews[j]);
			(function(j){
				ProductService.getProduct($scope.user.reviews[j].sku, function(response){
					console.log(response);
					var tempProduct = response.products[0];
					tempProduct.userReview = $scope.user.reviews[j];
					$scope.reviewedProducts.push(tempProduct);
				})
			})(j);
		}

	})

	$scope.addToCart = function (productId) {
		UserService.checkLoggedIn(function(user)
				{
//			User is Authenticated
			if (user !== '0'){
				$scope.userId = $rootScope.user._id;
				var cart = {id:productId, count : 1};
				ProductService.fetchLogin(function(response){
					for(var i in response){
						if(response[i]._id == $scope.userId){
							$scope.user = response[i];

							var alreadyPresent = false;	
							for(var i in $scope.user.cart)	{
								(function(i){
									if($scope.user.cart[i].id == productId){
										alreadyPresent = true;
										$scope.user.cart[i].count +=1;
										$rootScope.cartCount += 1;
										ProductService.addToCartFromFavorite($scope.user, function(response){
											$location.url('/profile/'+"cart");
										});
									}
								})(i);
							}
							if(!alreadyPresent){
								$scope.user.cart.push(cart);
								$rootScope.cartCount += 1;
								ProductService.addToCartFromFavorite($scope.user, function(response){
									$location.url('/profile/'+"cart");
								});
							}
						}
					}
				})
			}

//			User is Not Authenticated
			else
			{
				$location.url('/login');
			}
				});
	}


	// deletes the review the user has written

	$scope.removeReview = function(product,index){
		UserService.getUserDetails($scope.username, function(response){
			var ptr = 0;
			for(var i in response.reviews){
				if(response.reviews[i]._id == product.userReview._id){
					ptr = i;
					break;
				}
			}
			response.reviews.splice(ptr,1);
			$scope.reviewedProducts.splice(index,1);
			var updatedProduct = {};
			ProductService.addReviews(response, function(result){
				console.log(result);
			});
			ProductService.fetchProducts(function(products){
				console.log(products);
				for(var i in products){
					(function(i){
						if(products[i].sku == product.sku){

							for(var j in products[i].reviews){
								if(products[i].reviews[j].submissionTime == product.userReview.submissionTime)
								{
									updatedProduct = products[i];
									updatedProduct.reviews.splice(j,1);
									break;
								}
							}
						}
					})(i);
				}
				ProductService.updateProductReview(updatedProduct, function(response){
				})
			})

		})
	};

	// removes a particular product from the favorite list
	$scope.removeFromFavorite = function(product, index){
		UserService.getUserDetails($scope.username, function(user){
			var ptr = 0;
			for(var i in user.favorites){
				if(user.favorites[i].id == product.sku){
					user.favorites.splice(i,1);
					break;
				}
			}

			$scope.favoriteProducts.splice(index,1);
			ProductService.updateFavorite(user, function(response){
				$rootScope.cartCount -=1 ;
				$scope.totalPrice = 0;
				for(var j in $scope.favoriteProducts){
					$scope.totalPrice = $scope.totalPrice + Number($scope.favoriteProducts[j].salePrice)*Number($scope.favoriteProducts[j].count);
				}
			});
		})
	};


	$scope.unfollowUser = function(username){
		UserService.checkLoggedIn(function(result)
				{
//			User is Authenticated
			if (result !== '0'){
				//var tempUser = result;

				var ptr = 0;
				for(var i in result.follows){
					if(result.follows[i].username == username){
						ptr = i;
						break;
					}
				}
				result.follows.splice(ptr,1);
				$scope.user.follows.splice(ptr,1);

				UserService.addFollows(result, function(response){
					UserService.getUserDetails(username, function(newUser){
						var localUser = newUser;
						var ptr1 = 0;
						for(var i in localUser.followedBy){
							if(localUser.followedBy[i].username == result.username){
								ptr1 = i;
								break;
							}
						}
						localUser.followedBy.splice(ptr1,1);
						UserService.addFollowedBy(localUser, function(){
							$location.url('/profile/'+"network");
						})
					})
				})			
			}
			else{
				$location.url('/login');
			}
				})
	}

	// removes a particular product from the cart
	$scope.removeFromCart = function(product, index){
		UserService.getUserDetails($scope.username, function(user){
			var ptr = 0;
			for(var i in user.cart){
				(function(i){
					if(user.cart[i].id == product.sku){
						var localCount = user.cart[i].count;
						user.cart.splice(i,1);
						$scope.cartProducts.splice(index,1);
						ProductService.updateCart(user, function(response){
							$rootScope.cartCount -=  localCount;
							console.log($rootScope.cartCount);
							$scope.totalPrice = 0;
							for(var j in $scope.cartProducts){
								$scope.totalPrice = $scope.totalPrice + Number($scope.cartProducts[j].salePrice)*Number($scope.cartProducts[j].count);
							}
						});
					}
				})(i)
			}
		})
	};


	// updates the product count in the cart
	$scope.updateCount = function(product,index){
		console.log(product);
		if(product.count==0){
			$scope.removeFromCart(product,index);
		}
		else
		{
			UserService.checkLoggedIn(function(result)
					{
//				User is Authenticated
				if (result !== '0'){
					ProductService.fetchLogin(function(response){
						for(var k in response){
							if(response[k]._id == $scope.userId){
								$scope.user = response[k];
								console.log($scope.user);
								for(var i in $scope.user.cart){
									(function(i){
										if($scope.user.cart[i]._id == product._id){
											$scope.user.cart[i].count = product.count;
											console.log($scope.user.cart);
											ProductService.updateCart($scope.user, function(response){
												$scope.totalPrice = 0;
												$rootScope.cartCount = Number(0);
												for(var j in $scope.cartProducts){
													(function(j) {
														$rootScope.cartCount += Number($scope.cartProducts[j].count);
														$scope.totalPrice = $scope.totalPrice + Number($scope.cartProducts[j].salePrice)*Number($scope.cartProducts[j].count);
													})(j);
												}
											});
										}
									})(i);
								}

							}
						}

					}); 
					$scope.cartProducts[index].count = product.count;
					$scope.showEdit = true;   		
				}
				else{
					$location.url('/login');
				}
					})
		}
	};

	$scope.updatePassword = function(pswd){
		UserService.checkLoggedIn(function(user)
				{
//			User is Authenticated
			if (user !== '0'){
				$scope.userId = $rootScope.user._id;
				UserService.getUserDetails($scope.username, function(response){
					response.password = pswd;
					UserService.updateUser(response, function(resp){
						UserService.logout(function(response)
								{
							$rootScope.currentuser = null;	
							$rootScope.userId = null;
							$rootScope.user = null;
							$location.path('/login');
								});
					})
				})
			}
				})
	}
})

app.controller('StoreController', function($scope,$http, ProductService){
	$scope.searchStores = function(){
		ProductService.storeLocator($scope.zipcode, function(response){
			$scope.stores = response.stores;
		})
	}
})





