app.factory("ProductService", function ProductService($http) {
    
	var fetch = function () {
        var result = $http.get('/product/fetch')
            .success(function(response){
            	console.log('inside service');
            	console.log(response);
            	return response;
            })
            return result;
            };
            
     var fetchProducts = function (manufacturer,callback) {
         $http.jsonp('http://api.remix.bestbuy.com/v1/products(manufacturer=' + manufacturer + ')?format=json&show=all&callback=JSON_CALLBACK&apiKey=wu48f36djjruzarbeahrx8ay')
         .success(callback);
            };   
            
     var fetchProductsByCategory = function (manufacturer,category, callback) {
         $http.jsonp('http://api.remix.bestbuy.com/v1/products(manufacturer=' + manufacturer + '&class='+category+')?format=json&show=all&callback=JSON_CALLBACK&apiKey=wu48f36djjruzarbeahrx8ay')
         .success(callback);
            };          

    var addProduct = function (product) {
        var result = $http.post('/product/add', product)
            .success(function (response) {
                console.log(response);
                return response;
            });
        return result;
    };
    
    var getProduct = function(id, callback){
    	$http.jsonp('http://api.remix.bestbuy.com/v1/products(sku=' + id + ')?format=json&show=all&callback=JSON_CALLBACK&apiKey=wu48f36djjruzarbeahrx8ay')
    	.success(callback);
    };
    
    var updateProduct = function (product) {
        var updatedResult = $http.put('/product/update/'+product._id, product)
            .success(function (updtedResponse) {
                console.log(updtedResponse);
                return updtedResponse;
            });
        return updatedResult;
    };
    
    var addFavorite = function(user){
    	$http.put('/user/addFavorite/'+user._id, user);
    }
    
    var register = function(user){
    	$http.post('/user/register',user);
    }
    
    var addToCart = function(user){
    	$http.put('/user/addToCart/'+user._id, user);
    }
    
    var updateCart = function(user, callback){
    	$http.put('/user/updateCart/'+user._id, user)
    	.success(callback);
    }
    
    var fetchLogin = function(callback){
    	$http.get('/user/login')
    	.success(callback);
    }

    var removeProduct = function (product) {
    	var result = $http.delete('/product/remove/'+product._id)
        .success(function (response) {
            return response;
        });
    	return result;
    };
    
    var addReview = function (product, callback) {
    	console.log(product);
    	console.log(product._id);
    	$http.put('/product/addReview/'+ product._id, product)
        .success(callback);
    };
    
    var removeReview = function (product, callback) {
    	var result = $http.put('/product/removeReview/'+ product._id)
        .success(callback);
    	return result;
    };

    return {
        fetch: fetch,
        addProduct: addProduct,
        removeProduct : removeProduct,
        updateProduct : updateProduct,
        addReview : addReview,
        fetchLogin : fetchLogin,
        getProduct : getProduct,
        addFavorite : addFavorite,
        fetchProducts : fetchProducts,
        fetchProductsByCategory : fetchProductsByCategory,
        addToCart : addToCart,
        updateCart : updateCart,
        register : register
    }
})