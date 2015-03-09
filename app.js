var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer');

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/Experiment1';
mongoose.connect(connectionString);

var ProductSchema = new mongoose.Schema(
		{ id: Number, name: String , image: String , salePrice: Number , 
			regularPrice : Number, shortDesc:String, reviews:[ReviewSchema]});

var ReviewSchema = new mongoose.Schema(
		{
			title:String, reviewer:String, description:String, reviewDate: Date
		}
		);

var UserSchema = new mongoose.Schema(
		{ 
			firstname: String, lastname: String, email: String, username: String, password : String, favorites :[Number], cart : [Number]
		});

var Productmodel = mongoose.model("Productmodel", ProductSchema);
var Usermodel = mongoose.model("Usermodel", UserSchema);

var user1 = new Usermodel({username:"admin", password:"admin", favorites:[], cart:[]});
user1.save();

app.get('/getDetails/:sku', function(req,res){
	Productmodel.find({id:req.params.sku}, function(err,data){
		res.json(data);
	});
});

app.get('/product/fetch', function(req,res){
	Productmodel.find(function(err,data){
		res.json(data);
	});
});

app.get('/user/login', function(req,res){
	Usermodel.find(function(err,users){
		console.log(users);
		res.json(users);
	})
})

app.get('/user/favorites/:id', function(req,res){
	Usermodel.findById(req.params.id, function(err,users){
		console.log(users.favorites);
		res.json(users.favorites);
	})
})

app.get('/user/cart/:id', function(req,res){
	Usermodel.findById(req.params.id, function(err,users){
		console.log(users.cart);
		res.json(users.cart);
	})
})

app.post('/product/add', function(req,res){
	var prdt = new Productmodel(req.body);
	prdt.save(function (err, doc){
		Productmodel.find(function (err,data){
			res.json(data);
		})
	})
});

app.post('/user/register', function(req,res){
	var user = new Usermodel(req.body);
	user.save(function (err, doc){
		})
});


app.put('/product/update/:id', function (req, res) {
	console.log('inside update');
	Productmodel.update({_id:req.params.id},{$set:req.body}, function(err, data){
		Productmodel.find(function(err, result){
			res.json(result);
		})
	})
});

app.put('/product/addReview/:id', function (req, res) {
	Productmodel.update({_id:req.params.id},{$set:req.body}, function(err, data){
	})
});

app.put('/user/addFavorite/:id', function(req,res){
	Usermodel.update({_id:req.params.id}, {$set:req.body}, function(err,data){
		console.log(err);
	})
})

app.put('/user/addToCart/:id', function(req,res){
	Usermodel.update({_id:req.params.id}, {$set:req.body}, function(err,data){
		console.log(err);
	})
})

app.put('/user/updateCart/:id', function(req,res){
	Usermodel.update({_id:req.params.id}, {$set:req.body}, function(err,data){
		console.log(err);
		Usermodel.findById(req.params.id, function(err, result){
			res.json(result.cart);
		})
	})
})

app.delete('/product/remove/:id', function(req,res){
	Productmodel.findById(req.params.id, function (err,data){
		data.remove(function (err, doc){
		Productmodel.find(function (err, result){
			res.json(result);
		})
	})
})
});

var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

app.listen(port,ip);