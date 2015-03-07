
var app = angular.module('AngularApp', ['ngRoute']);

app.controller('MainController', function ($scope,$route) {

});

app.config(function ($routeProvider) {
    $routeProvider
     .when('/home', {
         templateUrl: 'partials/Wallpaper.html'
     })

     .when('/search', {
         templateUrl: 'partials/SearchProductDetails.html',
         controller: 'searchController'
     })

});

app.controller('searchController', function ($scope, $http, ProductService) {
	$('.product').change(function () {
        var sku = $(".product :selected").val();
    	console.log(sku);
        $http.get("/getDetails/"+sku)
        	.success(function(response){
        		$scope.product = response[0];
                console.log($scope.product);
        	});
        
    });
});




                
