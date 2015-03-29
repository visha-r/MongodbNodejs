app.factory("UserService", function ProductService($http) {

    var getUserDetails = function (username, callback) {
        $http.get('/user/details/'+username)
        .success(callback);
    };
    
    var login = function(user, callback){
    	$http.post('/user/login', user)
    	.success(callback);
    };
    
    var logout = function(callback)
	{
		$http.post('/user/logout')
		.success(callback);
	};
    
    var checkLoggedIn = function(callback){
    	$http.get('/loggedin')
    	.success(callback);
    }
    
    var addFollows = function(user, callback){
    	$http.put('/user/addFollows/'+user._id, user)
    	.success(callback);
    }
    
    var addFollowedBy = function(user, callback){
    	$http.put('/user/addFollowedBy/'+user._id, user)
    	.success(callback);
    }
    
    var checkUserExists = function(username){
    	var result;
    	$http.post('/user/checkUsername', username)
    	.succes(function(response){
    		result = response;
    	});
    	return response;
    }

    return {
    	getUserDetails: getUserDetails,
    	login: login,
    	logout : logout,
    	checkLoggedIn : checkLoggedIn,
    	addFollows : addFollows,
    	addFollowedBy : addFollowedBy,
    	checkUserExists : checkUserExists
    }
})