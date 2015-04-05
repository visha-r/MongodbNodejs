var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var app = express();
app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'this is the secret' }));
app.use(multer());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/Experiment1';
mongoose.connect(connectionString);

var ProductSchema = new mongoose.Schema(
		{ sku: Number, name: String , image: String , salePrice: Number , 
			regularPrice : Number, shortDescription:String, reviews:[ReviewSchema]});

var ReviewSchema = new mongoose.Schema(
		{
			sku:Number, title:String, reviewer:[ReviewerSchema], comment:String, submissionTime:Date, rating: Number, local:Boolean
		}
		);

var CartSchema = new mongoose.Schema(
		{
			id:Number,
			count:Number
		}
		);

var FavoriteSchema = new mongoose.Schema(
		{
			id:Number
		}
		);

var UserSchema = new mongoose.Schema(
		{ 
			firstname: String, lastname: String, email: String, username: String, 
			password : String, country : String, address : String, phone : Number,
			favorites :[FavoriteSchema], cart : [CartSchema], reviews:[ReviewSchema],
			follows : [{username: String}], followedBy : [{username: String}]
		});

var ReviewerSchema = new mongoose.Schema(
		{
			name:String
		}
		);

var Productmodel = mongoose.model("Productmodel", ProductSchema);
var Usermodel = mongoose.model("Usermodel", UserSchema);

passport.use(new LocalStrategy(
		function(username, password, done)
		{
			Usermodel.findOne({username:username, password:password}, function(err, user){
					if(user){
						console.log(user);
						return done(null, user);
					}
					return done(null, false, {message: 'Unable to login'});
				})
		}));

passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(user, done) {
	done(null, user);
});

var auth = function(req, res, next)
{
	if (!req.isAuthenticated())
		res.send(401);
	else
		next();
};

app.get('/loggedin', function(req, res)
		{
	res.send(req.isAuthenticated() ? req.user : '0');
		});

app.post('/user/login', passport.authenticate('local'), function(req, res)
		{
	res.send(req.user);
		});

app.post('/user/logout', function(req, res)
		{
	req.logOut();
	res.send(200);
		});

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
		res.json(err);
		})
});

app.put('/product/update/:id', function (req, res) {
	Productmodel.findById(req.params.id, function(err, data){
		data.sku = req.body.sku;
		data.name = req.body.name;
		data.image = req.body.image;
		data.salePrice = req.body.salePrice;
		data.regularPrice = req.body.regularPrice;
		data.shortDescription = req.body.shortDescription;
		data.reviews = req.body.reviews;
		data.save(function(err, data){
			Productmodel.find(function(err, result){
				console.log(result);
				res.json(result);
			})
			
		})
	})
});

app.put('/user/addFollows/:id', function(req,res){
	Usermodel.findById(req.params.id, function(err, user){
		user.follows = req.body.follows;
		user.save(function(err, result){
			Usermodel.findById(req.params.id, function(err, updatedUser){
				res.json(updatedUser);
			})
		})
	})
})

app.put('/user/addFollowedBy/:id', function(req,res){
	Usermodel.findById(req.params.id, function(err, user){
		user.followedBy = req.body.followedBy;
		user.save(function(err, result){
			res.json(result);
		})
	})
})

app.put('/product/addReview/:id', function (req, res) {
	Productmodel.findById(req.params.id, function(err, data){
		data.sku = req.body.sku;
		data.reviews = req.body.reviews;
		data.save(function(err, data){
			Productmodel.findById(req.params.id, function(err, result){
				console.log(result);
			})
		})
	})
});

app.put('/user/addFavorite/:id', function(req,res){
		Usermodel.findById(req.params.id, function(err, data){
		data.firstname = req.body.firstname;
		data.lastname = req.body.lastname;
		data.username = req.body.username;
		data.password = req.body.password;
		data.email = req.body.email;
		data.favorites = req.body.favorites;
		data.cart = req.body.cart;
		data.save(function(err, result){
			Usermodel.findById(req.params.id, function(err, doc){
				console.log(doc);
			})
		})
	})
});
	

app.put('/user/addToCart/:id', function(req,res){
	Usermodel.findById(req.params.id, function(err, data){
		data.firstname = req.body.firstname;
		data.lastname = req.body.lastname;
		data.username = req.body.username;
		data.password = req.body.password;
		data.email = req.body.email;
		data.favorites = req.body.favorites;
		data.cart = req.body.cart;
		data.save(function(err, result){
			Usermodel.findById(req.params.id, function(err, doc){
				console.log(doc);
			})
		})
	})
})

app.put('/user/updateCart/:id', function(req,res){
	console.log(req.body);
	Usermodel.findById(req.params.id, function(err, data){
		data.firstname = req.body.firstname;
		data.lastname = req.body.lastname;
		data.username = req.body.username;
		data.password = req.body.password;
		data.email = req.body.email;
		data.favorites = req.body.favorites;
		data.cart = req.body.cart;
		data.save(function(err, result){
			Usermodel.findById(req.params.id, function(err, doc){
				console.log(doc);
				res.json(doc.cart);
			})
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

app.post('/new/user/register', function(req,res){
	var user = new Usermodel(req.body);
	user.save(function (err, user){
		res.json(err);
		})
});

app.get('/user/details/:username', function(req,res){
	Usermodel.find(function(err,users){
		for(i in users){
			if(users[i].username == req.params.username){
				res.json(users[i]);
			}
		}
	})
});

//ajax target for checking password
app.post('/user/checkPassword', function(req, res) {
  var username = req.body.username;
  // check if password matches
  var noMatch = false;
  Usermodel.findOne({username: username}, function(err,user){
		if(user.password != req.body.password)
			{
			noMatch = true;
			}
		if (noMatch) {
			res.json(403, {
				noMatch: true
			});
			return
		}
		else
		{
	  // looks like everything is fine
	  res.send(200);
		}
  })
});

app.post('/product/addReview', function (req, res) {
	var product = new Productmodel(req.body);
	product.save(function (err, doc){
		console.log(req.body);
		res.json(req.body);
		})
});

app.put('/product/updateReview/:id', function (req, res) {
	Productmodel.findById(req.params.id, function(err, data){
		data.reviews = req.body.reviews;
		data.save(function(err, result){
			Productmodel.findById(req.params.id, function(err, doc){
				console.log(doc.reviews);
				res.json(doc.reviews);
			})
		})
	})
});

app.put('/user/addReview/:id', function(req,res){
	Usermodel.findById(req.params.id, function(err, data){
	data.reviews = req.body.reviews;
	data.save(function(err, result){
		Usermodel.findById(req.params.id, function(err, doc){
			res.json(doc.reviews);
		})
	})
})
});

app.get('/product/fetchAll', function(req,res){
	Productmodel.find(function(err,products){
		res.json(products);
	})
})

app.post('/user/checkUsername', function(req, res) {
  var username = req.body.username;
  var usernameTaken = false;
  Usermodel.findOne({username: username}, function(err,user){
		if(user)
			{
			usernameTaken = true;
			}
		if (usernameTaken) {
			res.status(403).json({
				isTaken: true
			});
			return
		}
		else
		{
	  res.sendStatus(200);
		}
  })
});

app.put('/user/addToCartFromFavorite/:id', function(req,res){
	Usermodel.findById(req.params.id, function(err, data){
		data.cart = req.body.cart;
		data.save(function(err, result){
			Usermodel.findById(req.params.id, function(err, doc){
				res.json(doc);
			})
		})
	})
})

app.put('/user/updateUser/:id', function(req,res){
	Usermodel.findById(req.params.id, function(err, data){
	data.firstname = req.body.firstname;
	data.lastname = req.body.lastname;
	data.country = req.body.country;
	data.email = req.body.email;
	data.password = req.body.password;
	data.save(function(err, result){
		Usermodel.findById(req.params.id, function(err, doc){
			res.json(doc);
		})
	})
})
});

var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

app.listen(port,ip);