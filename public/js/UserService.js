app.factory("UserService", function ProductService($http) {

    var getUserDetails = function (username, callback) {
        $http.get('/user/details/'+username)
        .success(callback);
    };
    
    var login = function(user, callback){
    	$http.post('/user/login', user)
    	.success(callback);
    };
    
    var logout = function(callback){
    	$http.post('/user/logout')
    	.success(callback);
    };

    return {
    	getUserDetails: getUserDetails,
    	login : login,
    	logout : logout
    }
})