var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
mongoose.connect('mongodb://localhost/Experiment1');

var ProductSchema = new mongoose.Schema(
		{ id: Number, name: String , image: String , salePrice: Number , 
			regularPrice : Number, shortDesc:String});

var Productmodel = mongoose.model("Productmodel", ProductSchema);

var product = new Productmodel({
	id: 3421338, name: "Frigidaire - 1.1 Cu. Ft. Mid-Size Microwave - Stainless-Steel", image: "http://img.bbystatic.com/BestBuy_US/images/mp/products/3421/3421338_sc.jpg", salePrice: 79,
        regularPrice: 129, shortDesc: "http://img.bbystatic.com/BestBuy_US/images/products/9878/9878217_sc.jpg"     
});


app.get('/getDetails/:sku', function (req, res) {
    Productmodel.find({id:req.params.sku} ,function callback(err, data){
    	res.json(data);
    });
});


/*
var users = [
             {
            	 id:"Bob", firstName:"Michel", lastName:"Bob", Interests :[ {name:"mobiles"}, {name:"All apple products"}, {name:"electronics"}],
            	 reviewed:[{id:11},{id:24}]
             },
             {
            	 id:"Jesse", firstName:"Jesse", lastName:"Pinkman", Interests :[ {name:"televisions"}, {name:"Nokia products"}, {name:"Thanksgiving deals"}],
             	reviewed:[{id:12},{id:23}]
             },
             {
            	 id:"Steve", firstName:"Steve", lastName:"Mortan", Interests :[ {name:"T-mobile offers"}, {name:"Home appliances"}],
            	 reviewed:[{id:13},{id:22}]
             },
             {
            	 id:"TheIntersect76", firstName:"Christi", lastName:"Josh", Interests :[ {name:"Diamond jewels"}, {name:"Furnitures"}],
            	 reviewed:[{id:21},{id:32}]
             },
             {
            	 id:"Irene", firstName:"Irene", lastName:"Molman", Interests :[ {name:"LCD Tvs"}, {name:"Sound system"}],
            	 reviewed:[{id:31}]
             }
             
             ];

app.get('/getDetails/:id', function (req, res) {
    for(var i in products){
        if(products[i].id == req.params.id){
            res.json(products[i]);
        }
    }
});

app.get('/getDetails', function (req, res) {
    res.json(products);
});

app.get('/favorites', function (req, res) {
     res.json(favorites);
});

app.get('/shopping/cart', function (req, res) {
    res.json(cart);
});

app.get('/shopping/reviews/:id', function(req,res){
	for(var j in products){
		if(products[j].id == req.params.id){
			res.json(products[j].reviews);
		}
	}
});

app.get('/shopping/getReviewerDetails/:id', function(req,res){
	var userProfile = null;
	for(var j in users){
		if(users[j].id == req.params.id){
			userProfile = users[j];
			break;
		}
	}
	
	for(var k in userProfile.reviewed){
		for(var p in products){
			for(var r in products[p].reviews){
				if(products[p].reviews[r].id == userProfile.reviewed[k].id){
					userProfile.reviewed[k] = products[p].reviews[r];
				}
			}
		}
	}
	
	res.json(userProfile);
});

app.post('/addFavorite', function (req, res) {
    favorites.push(req.body);
    res.json(favorites);
});

app.post('/shopping/addToCart', function (req, res) {
    cart.push(req.body);
    console.log(req.body.id);
    for(var a in cart){
    	if(cart[a].id == req.body.id){
    		cart[a].count = Number(1);
    	}
    }
});

app.post('/shopping/addReview/:review/:reviewId', function(req,res){
	var k;
	for(k in products){
		if(products[k].id == req.params.reviewId){
			var revId;
			for(r in products[k].reviews){
				revId = products[k].reviews[r].id;
			}
			products[k].reviews.push(req.params.review);
			products[k].reviews[Number(r)+1].id = Number(revId)+1;
			res.json(products[k].reviews);
		}
	}
});

app.delete('/shopping/removeCartItem/:index', function (req, res) {
            cart.splice(req.params.index, 1);
            res.json(cart);
});

app.put('/shopping/update', function (req, res) {
    for (var j in products) {
    	console.log(String(products[j].id));
        if (products[j].id == req.body.id) {
            products[j] = req.body;
        }
    }
});

app.put('/shopping/updateCount/:id/:count', function (req, res) {
    cart[req.params.id].count = req.params.count;
    res.json(cart);
    });

app.post('/add', function (req, res) {
    products.push(req.body);
    res.json(products);
});
*/
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

app.listen(port,ip);