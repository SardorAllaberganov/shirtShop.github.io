var data = [{
  id: 1,
  brand: 'product1',
  price: 100000,
  type: 'premium',
  color: 'dark-blue',
  category: 'business-casual-shirts',
  pattern: 'dotted',
  country: 'Italy',
  //Image: "/data/images/3.jpg"
  Image: "/shirtShop.github.io/data/images/3.jpg"
}, {
  id: 2,
  brand: 'product2',
  price: 145000,
  type: 'luxury',
  color: 'light-blue',
  category: 'business-shirts',
  pattern: 'solid',
  country: 'Uzbekistan',
  //Image: '/data/images/4.jpg'
  Image: '/shirtShop.github.io/data/images/4.jpg'
}, {
  id: 3,
  brand: 'product3',
  price: 132000,
  type: 'luxury',
  color: 'white',
  category: 'casual-shirts',
  pattern: 'printed',
  country: 'France',
  //Image: '/data/images/5.jpg'
  Image: '/shirtShop.github.io/data/images/5.jpg'
}, {
  id: 4,
  brand: 'product4',
  price: 99900,
  color: 'white',
  type: 'essentials',
  category: 'formal-shirts',
  pattern: 'solid',
  country: 'Turkey',
  //Image: '/data/images/6.jpg'
  Image: '/shirtShop.github.io/data/images/6.jpg',
}];

var weight = ['75-99', '100-124', '125-149', '80-120', '105-128', '130-159'];

var fabrics = [{
  id: 1,
  brand: 'product1',
  price: 494000,
  color: 'brown',
  type: 'luxury',
  fabricType: 'shirt-fabric',
  pattern: 'patterned',
  weight: '100-124',
  Image: '/shirtShop.github.io/data/images/fabrics/1.jpg',
  //Image: '/data/images/fabrics/1.jpg',
  //ImageModal: '/data/images/fabrics/1-1.jpg'
  ImageModal: '/shirtShop.github.io/data/images/fabrics/1-1.jpg'
},
{
  id: 2,
  brand: 'product2',
  price: 494000,
  color: 'white',
  type: 'essentials',
  fabricType: 'shirt-fabric',
  pattern: 'solid',
  weight: '100-124',
  Image: '/shirtShop.github.io/data/images/fabrics/2.jpg',
  //Image: '/data/images/fabrics/1.jpg',
  //ImageModal: '/data/images/fabrics/1-1.jpg'
  ImageModal: '/shirtShop.github.io/data/images/fabrics/1-1.jpg'
},
{
  id: 3,
  brand: 'product3',
  price: 494000,
  color: 'red',
  type: 'luxury',
  fabricType: 'shirt-fabric',
  pattern: 'checked',
  weight: '125-149',
  Image: '/shirtShop.github.io/data/images/fabrics/3.jpg',
  //Image: '/data/images/fabrics/1.jpg',
  //ImageModal: '/data/images/fabrics/1-1.jpg'
  ImageModal: '/shirtShop.github.io/data/images/fabrics/1-1.jpg'
},
{
  id: 4,
  brand: 'product4',
  price: 663000,
  color: 'black',
  type: 'essentials',
  fabricType: 'shirt-fabric',
  pattern: 'premium',
  weight: '75-99',
  Image: '/shirtShop.github.io/data/images/fabrics/4.jpg',
  //Image: '/data/images/fabrics/1.jpg',
  //ImageModal: '/data/images/fabrics/1-1.jpg'
  ImageModal: '/shirtShop.github.io/data/images/fabrics/1-1.jpg'
},
{
  id: 5,
  brand: 'product5',
  price: 663000,
  color: 'brown',
  type: 'essentials',
  fabricType: 'polo-shirt-fabrics',
  pattern: 'solid',
  weight: '125-149',
  Image: '/shirtShop.github.io/data/images/fabrics/5.png',
  //Image: '/data/images/fabrics/1.jpg',
  //ImageModal: '/data/images/fabrics/1-1.jpg'
  ImageModal: '/shirtShop.github.io/data/images/fabrics/1-1.jpg'
},
{
  id: 6,
  brand: 'product6',
  price: 222123,
  color: 'brown',
  type: 'essentials',
  fabricType: 'shirt-fabric',
  pattern: 'patterned',
  weight: '75-99',
  Image: '/shirtShop.github.io/data/images/fabrics/1.jpg',
  //Image: '/data/images/fabrics/1.jpg',
  //ImageModal: '/data/images/fabrics/1-1.jpg'
  ImageModal: '/shirtShop.github.io/data/images/fabrics/1-1.jpg'
}];

var app = angular.module('shirtShop',[]);
//var app = angular.module("shirtShop", []);

// app.config(function($routeProvider, $locationProvider) {
//   $routeProvider
//   .when('/individual/:bookId,:brand,:price', {
//     templateUrl: 'individual.html',
//     controller: 'BookController',
//   })
//   .when('/index', {
//     templateUrl: 'index.html',
//     controller: 'BookController',
//   });
//   $locationProvider.html5Mode(true);
// });

// app.controller('BookController', function($scope, $routeParams,$routeParams,$location) {
//   $scope.name = 'BookController';
//   $scope.params = $routeParams;
//   $scope.$location = $location;
// })
app.component("navComponent", {
  templateUrl: '/shirtShop.github.io/../navbar.html',
  controller: 'cart',
});



app.controller("productController", ["$scope", function ($products) {
  $products.product = data;
  $products.fabrics = fabrics;
  $products.weight = weight;
  $products.optionSize = weight.length;
  $products.theFilter = {};

  $products.accountType = 'personal';

  //product page filters
  $products.typeFilter = function(type) {
    if ($products.theFilter.type === type) {
      $products.theFilter = {};
    }
    else {
      $products.theFilter.type = type;
    }
  };
  $products.colorFilter = function(color) {
    $products.theFilter.color = color;
  };
  $products.categoryFilter = function(category) {
    $products.theFilter.category = category;
  };
  $products.patternFilter = function(pattern) {
    $products.theFilter.pattern = pattern;
  };


  $products.weightFilter = function(weight){
    $products.theFilter.weight = weight;
    console.log(weight);
  }

  //fabrics page filters
  $products.fabricType = function(fabricType) {
    $products.theFilter.fabricType = fabricType;
  };

  // reset the filter
  $products.resetFilter = function() {
    // set filter object as blank
    $products.theFilter = {};
    $products.searchProduct = "";
  }
  this.codeVerification1 = true;
  this.codeVerification = false;
  this.codeVerification = function(){
    this.codeVerification = true;
    this.codeVerification1 = false;
  }
 
  
      // define list of items
  // $product.productBrand = productBrand;
	// $product.productColor = productColor;

	// $product.productFilter = {};
  // // reset the filter
  // $product.resetFilter = function() {
  // // set filter object as blank
  // 	$product.productFilter = {};
  // }
}]);

app.controller('cart', function ($scope) {
  
  $scope.cart = [];
 	$scope.total = 0;

  function saveCart() {
    localStorage.setItem("shoppingCart", JSON.stringify($scope.cart));
  }

  function loadCart() {
    $scope.cart = JSON.parse(localStorage.getItem("shoppingCart"));
    if ($scope.cart === null) {
      $scope.cart = []
    }
  }
  loadCart();

	$scope.countCart = function () { // -> return total count
    var totalCount = 0;
    for (var i in $scope.cart) {
        totalCount += $scope.cart[i].count;
    }
    totalCount;
    $('#counter').innerHTML = totalCount;
  };
	
  $scope.getCost = function(item) {
    return (item.count * item.price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  $scope.addItem = function (product) {
    if ($scope.cart.length === 0){
	 		product.count = 1;
	 		$scope.cart.push(product);
	 	} else {
	 		var repeat = false;
	 		for(var i = 0; i< $scope.cart.length; i++){
	 			if($scope.cart[i].id === product.id && $scope.cart[i].type === product.type){
	 				repeat = true;
	 				$scope.cart[i].count +=1;
	 			}
	 		}
	 		if (!repeat) {
	 			product.count = 1;
	 		 	$scope.cart.push(product);	
	 		}
	 	}
    saveCart();
  };
  
  $scope.getTotal = function() {
    var total = 0;
    angular.forEach($scope.cart, function(item) {
      // if ($('.delivery').value === 'express') {
      //   total += (item.price * item.count) + 15000;
      // }
      // else{
        total += item.price * item.count;
      //}
    })
    return total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    saveCart();
  }
  app.filter('nospace', function () {
    return function (value) {
      return (!value) ? '' : value.replace(/ /g, '');
    };
	});

  $scope.clearCart = function() {
    $scope.cart.length = 0;
    $scope.total = 0;
    saveCart();
    //$('.modal-backdrop').hide();
  };
  
	$scope.removeItemCart = function(product){
	  if(product.count > 1){
	    product.count -= 1;
	  }
	  else if(product.count === 1){
	    var index = $scope.cart.indexOf(product);
			$scope.cart.splice(index, 1);
	  }
	  saveCart();
  };

  $scope.removeItem = function(item) {
    var index = $scope.cart.indexOf(item);
    $scope.cart.splice(index, 1);
  	$scope.total = $scope.total - (item.price * item.count);
  	saveCart();
  };
});

