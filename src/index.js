"use strict"

import './scss/style.scss'
import $ from "jquery"
import "jquery-modal"
import "jquery-modal/jquery.modal.min.css"

function getFromApi(url, onSuccess) {
  $.ajax({
    url: url,
    dataType: "json",
    type: "GET",
    success: onSuccess,
    error: (request, status, error) => {
      alert("An error occured: " + request.responseText);
    }
  });
}

// convert object to html element for card in catalog
function makeCardAtShop(obj) {
  let $card = $("<div>", {
    "class": `card id-${obj['id']}`
  });

  let $img = $("<img>", {
    "class": "card-img",
    src: `${obj['image_url']}`,
    alt: `${obj['name']}`
  });

  let $price = $("<div>", { "class": "card-price" });
  if (obj["special_price"] !== null) { // has discount
    let $currentPrice = $("<p>", { "class": "item-price" }).text(`${obj['special_price']} грн`);
    let $oldPrice = $("<p>", { "class": "item-old-price" }).text(`${obj['price']} грн`);
    $price.append($currentPrice, $oldPrice);
  } else {
    let $currentPrice = $("<p>", { "class": "item-price" }).text(`${obj['price']} грн`);
    $price.append($currentPrice);
  }

  let $cardBody = $("<div>", { "class": "card-body" });
  let $cardTitle = $("<h4>", { "class": "card-title" }).append($("<a>", { "class": "card-title-link" }).text(`${obj['name']}`));
  let $cardBuy = $("<button>", { "class": "card-buy" }).text("Buy");

  $cardBody.append($cardTitle, $price, $cardBuy);

  return $card.append($img, $cardBody);
}

// convert object to html element for card in cart
function makeCardAtCart(obj, count) {
  let $card = $("<div>", {
    "class": `card id-${obj['id']}`
  });

  let $img = $("<img>", {
    "class": "card-img",
    src: `${obj['image_url']}`,
    alt: `${obj['name']}`
  });

  let $price = $("<div>", { "class": "card-price" });
  if (obj["special_price"] !== null) { // has discount
    let $currentPrice = $("<p>", { "class": "item-price" }).text(`${obj['special_price']} грн`);
    let $oldPrice = $("<p>", { "class": "item-old-price" }).text(`${obj['price']} грн`);
    $price.append($currentPrice, $oldPrice);
  } else {
    let $currentPrice = $("<p>", { "class": "item-price" }).text(`${obj['price']} грн`);
    $price.append($currentPrice);
  }

  let $cardBody = $("<div>", { "class": "card-body" });
  let $cardTitle = $("<h4>", { "class": "card-title" }).append($("<a>", { "class": "card-title-link" }).text(`${obj['name']}`));

  let $cartItemCountSetter = $("<div>", { "class": "cart-item-count-setter" });
  let $cartItemCount = $("<div>", { "class": "cart-item-count" }).text(`${count}`);
  let $cartItemDecCount = $("<img>", {
    "class": "cart-item-dec-count",
    alt: "-",
    src: "./img/minus.png"
  });
  let $cartItemIncCount = $("<img>", {
    "class": "cart-item-inc-count",
    alt: "+",
    src: "./img/plus.png"
  });
  $cartItemCountSetter.append($cartItemDecCount, $cartItemCount, $cartItemIncCount);

  $cardBody.append($cardTitle, $price, $cartItemCountSetter);

  return $card.append($img, $cardBody);
}

// convert from object to html element for card in goods modal window
function makeCardAtGoodsModal(obj) {
  let $card = $("<div>", {
    "class": `card id-${obj['id']}`
  });

  let $img = $("<img>", {
    "class": "card-img",
    src: `${obj['image_url']}`,
    alt: `${obj['name']}`
  });

  let $price = $("<div>", { "class": "card-price" });
  if (obj["special_price"] !== null) { // has discount
    let $currentPrice = $("<p>", { "class": "item-price" }).text(`${obj['special_price']} грн`);
    let $oldPrice = $("<p>", { "class": "item-old-price" }).text(`${obj['price']} грн`);
    $price.append($currentPrice, $oldPrice);
  } else {
    let $currentPrice = $("<p>", { "class": "item-price" }).text(`${obj['price']} грн`);
    $price.append($currentPrice);
  }

  let $cardBody = $("<div>", { "class": "card-body" });
  let $cardTitle = $("<h4>", { "class": "card-title" }).append($("<a>", { "class": "card-title-link" }).text(`${obj['name']}`));
  let $cardDescription = $("<p>", { "class": "card-description" }).text(`${obj['description']}`);
  let $cardBuy = $("<button>", { "class": "card-buy" }).text("Buy");

  $cardBody.append($cardTitle, $cardDescription, $price, $cardBuy);

  return $card.append($img, $cardBody);
}

function updateCart(goodsInCart) {
  let $container = $(".cart > main");
  $container.empty();
  if (goodsInCart.size > 0) {
    for (const [id, count] of goodsInCart.entries()) {
      getFromApi(`https://nit.tron.net.ua/api/product/${id}`, (json) => {
        $container.append(makeCardAtCart(json, count));
      });
    }
  } else {
    $.modal.close();
    $(".empty-cart-modal").modal();
  }
}

function updateTotalPrice(goodsInCart) {

  $(".total-price").text("0");

  for (const [id, count] of goodsInCart.entries()) {
    getFromApi(`https://nit.tron.net.ua/api/product/${id}`, (json) => {
      let $totalPrice = $(".total-price");
      let sum = parseFloat($totalPrice.text());

      if (json["special_price"] !== null) { // has discount
        sum += parseFloat(json["special_price"]) * count;
      } else {
        sum += parseFloat(json["price"]) * count;
      }

      $totalPrice.text(`${sum} грн`);
    });
  }

}

function updateGoodsCount(offset) {
  let $goodsCount = $(".goods-count");
  const newCount = parseInt($goodsCount.text()) + offset;
  $goodsCount.text(`${newCount}`);
  $(".cart-img").css("right", `${$goodsCount.width() + 10}px`);
}

// styling form in case of invalid input
function styleForm(input, isInvalid) {
  let $input = $(`.payment-form-${input}`);
  if (isInvalid) {
    $input.css("border", "1px solid #F00");
  } else {
    $input.css({
      "border": "none",
      "border-bottom": "1px solid #ddd"
    });
  }
}

$(function () {

  let categories = [];
  let goodsInCart = new Map();
  let $cart = $(".cart");

  // create categories navbar
  getFromApi("https://nit.tron.net.ua/api/category/list", (json) => {
    let categoriesNav = $(".categories-nav").first();
    categoriesNav.append(`<li class="category-item id-all"><a class="category-link">All categories</a></li>`)
    for (const category of json) {
      categories.push(category["id"]);

      let $categoryItem = $("<li>", { "class": `category-item id-${category['id']}` });
      let $categoryLink = $("<a>", { "class": "category-link" }).text(`${category["name"]}`);
      $categoryItem.append($categoryLink);

      categoriesNav.append($categoryItem);
    }
  });

  // create "All categories" 
  getFromApi("https://nit.tron.net.ua/api/category/list", (categoriesJson) => {
    let $main = $(".global-main");
    for (const category of categoriesJson) {

      let $goodsCategory = $("<section>", { "class": `goods-category id-${category['id']}` });

      let $categoryTitle = $("<h1>", {"class": "category-title"}).text(`${category['name']}`);
      let $categoryDescription = $("<h3>", {"class": "category-description"}).text(`${category['description']}`);
      let $goodsContainer = $("<div>", {"class": "goods-container"});

      $goodsCategory.append($categoryTitle, $categoryDescription, $goodsContainer);

      $main.append($goodsCategory);

      getFromApi(`https://nit.tron.net.ua/api/product/list/category/${category["id"]}`, (goodsJson) => {
        let $container = $(`.goods-category.id-${category["id"]} > .goods-container`);
        for (const item of goodsJson) {
          $container.append(makeCardAtShop(item));
        }
      });
    }
  });

  // pop-up menu on mobiles
  $(".navbar-menu-button").on("click", () => {
    let $navbarNav = $(".navbar-nav");
    $navbarNav.toggleClass("opened");
    $(".navbar-nav .nav-item").toggleClass("opened");
  });

  // showing categories
  $(".nav-link").first().on("click", () => {
    let $categoriesNavbar = $("aside").first();
    $categoriesNavbar.toggleClass("opened");
    let $navbarNav = $(".navbar-nav");
    if ($navbarNav.hasClass("opened")) {
      $navbarNav.toggleClass("opened");
      $(".navbar-nav .nav-item").toggleClass("opened");
    }
  });

  // show chosen category and hide other
  $("aside").on("click", ".category-link", (event) => {
    let $allCategories = $(".goods-category");
    const categoryId = $(event.currentTarget).closest(".category-item").attr("class").substring(14);
    if (categoryId !== "id-all") {
      $allCategories.show();
      let $otherCategories = $allCategories.not(`.${categoryId}`);
      $otherCategories.hide();
    } else {
      $allCategories.show();
    }
  });

  // open cart modal window
  $(".cart-img").on("click", () => {
    if (goodsInCart.size === 0) {
      $(".empty-cart-modal").modal();
    } else {
      let $cart = $(".cart-modal");
      updateTotalPrice(goodsInCart);
      updateCart(goodsInCart);
      $cart.modal();
    }
  });

  // buy item from catalog / increase quantity of item in cart from catalog
  $(".global-main").on("click", ".card-buy", (event) => {
    const id = $(event.currentTarget).closest(".card").attr("class").substring(8);
    if (goodsInCart.has(id)) {
      goodsInCart.set(id, goodsInCart.get(id) + 1);
    } else {
      goodsInCart.set(id, 1);
    }
    updateGoodsCount(1);
  });

  // increase quantity of item in cart from cart
  $cart.on("click", ".cart-item-inc-count", (event) => {
    const id = $(event.currentTarget).closest(".card").attr("class").substring(8);

    const count = goodsInCart.get(id) + 1;

    goodsInCart.set(id, count);
    $(event.currentTarget).siblings(".cart-item-count").text(count);
    updateTotalPrice(goodsInCart);
    updateGoodsCount(1);
  });

  // decrease quantity of item in cart from cart
  $cart.on("click", ".cart-item-dec-count", (event) => {
    const id = $(event.currentTarget).closest(".card").attr("class").substring(8);

    const count = goodsInCart.get(id) - 1;

    if (count > 0) {
      goodsInCart.set(id, count);
      $(event.currentTarget).siblings(".cart-item-count").text(count);
      updateTotalPrice(goodsInCart);
    } else {
      goodsInCart.delete(id);
      updateTotalPrice(goodsInCart);
      updateCart(goodsInCart);
    }
    updateGoodsCount(-1);
  });

  // deleting item in cart
  $cart.on("click", ".cart-item-delete", (event) => {
    const id = $(event.currentTarget).closest(".card").attr("class").substring(8);

    updateGoodsCount(-goodsInCart.get(id));
    goodsInCart.delete(id);
    updateTotalPrice(goodsInCart);
    updateCart(goodsInCart);
  });

  // modal window for goods description
  let $cardModal = $(".card-modal");
  $(".global-main, .cart-modal").on("click", ".card-title-link, .card-img", (event) => {
    const id = $(event.currentTarget).closest(".card").attr("class").substring(8);
    
    getFromApi(`https://nit.tron.net.ua/api/product/${id}`, (json) => {
      $cardModal.html(makeCardAtGoodsModal(json));
    });
    $cardModal.modal({
      closeExisting: false
    });
  });

  // validating and confirming order 
  $(".cart-buy").on("click", (event) => {
    event.preventDefault();

    const name = $(".payment-form-name").val();
    const phone = $(".payment-form-phone").val();
    const email = $(".payment-form-email").val();

    let products = {};
    for (const [id, count] of goodsInCart.entries()) {
      products[id] = count;
    }

    $.ajax({
      url: "https://nit.tron.net.ua/api/order/add",
      dataType: "json",
      type: "POST",
      data: {
        token: "WAB-fwf0snJOZznw0WPu",
        name: name,
        phone: phone,
        email: email,
        products: products
      },
      success: (json) => {
        switch (json["status"]) {
          case "error":

            const errors = json["errors"];

            styleForm("email", "email" in errors);
            styleForm("phone", "phone" in errors);
            styleForm("name", "name" in errors);

            let $errorModal = $(".validation-modal");
            $errorModal.empty();

            for (const error in errors) {
              for (const msg of errors[error]) {
                $errorModal.append(`<p>${msg}</p>`);
              }
            }

            $errorModal.modal({
              closeExisting: false
            });

            break;
          case "success":

            let $successModal = $(".validation-modal");
            $successModal.empty();
            $successModal.append(`<p>Your order is confirmed</p>`)
            $successModal.modal();

            updateGoodsCount(-parseInt($(".goods-count").text()));
            goodsInCart.clear();

            break;
        }
      },
      error: (request, status, error) => {
        alert("An error occured: " + request.responseText);
      }
    });
  });


});


