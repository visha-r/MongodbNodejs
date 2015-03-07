app.factory("ProductService", function ProductService($http) {
    var fetchProducts = function (sku) {
    	console.log('asdfghhj');
    	console.log(sku);
        $http.get("/getDetails/"+sku)
            .success(function(response){
            	console.log('inside service');
            	console.log(response);
            	return response;
            })
            };

    var addToFavorites = function (product) {
        $http.post('/addFavorite/'+product)
            .success(function (response) {
                console.log(response);
                return response;
            });
    };


    var getFavorites = function () {
        $http.get('/favorites')
            .success(function (response) {
                return response;
            });
    };

    var remove = function (product) {
        $http.post('/addProduct/:product')
        .success(function (response) {
            return response;
        });
    };

    /*var remove = function (id) {
        $http.delete('/removeProduct/:id')
        .success(function (response) {
            return response;
        });
    };*/

    return {
        fetchProducts: fetchProducts,
        addToFavorites: addToFavorites,
        getFavorites: getFavorites,
        //addProduct : addProduct,
        remove : remove
    }
})