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
  let price;
  if (obj["special_price"] !== null) { // has discount
    price =
      `<p class="item-price">${obj['special_price']} грн</p>
     <p class="item-old-price">${obj['price']} грн</p>`
  } else {
    price = `<p class="item-price">${obj['price']} грн</p>`
  }

  return `<div class="card id-${obj['id']}">
    <img src="${obj['image_url']}" class="card-img" alt="${obj['name']}">
    <div class="card-body">
      <h4 class="card-title"><a class="card-title-link">${obj['name']}</a></h4>
      <div class="card-price">
      ${price}
      </div>
      <button class="card-buy">Buy</button>
    </div>
  </div>
  `
}

// convert object to html element for card in cart
function makeCardAtCart(obj, count) {
  let price;
  if (obj["special_price"] !== null) { // has discount
    price =
      `<p class="item-price">${obj['special_price']} грн</p>
     <p class="item-old-price">${obj['price']} грн</p>`
  } else {
    price = `<p class="item-price">${obj['price']} грн</p>`
  }

  return `<div class="card id-${obj['id']}">
    <img src="${obj['image_url']}" class="card-img" alt="${obj['name']}">
    <div class="card-body">
      <h4 class="card-title"><a class="card-title-link" href="#">${obj['name']}</a></h4>
      <div class="card-price">
      ${price}
      </div>
      <img src="./img/trash.png" alt="trash" class="cart-item-delete">
      <div class='cart-item-count-setter'>
        <img src="./img/minus.png" alt="-" class="cart-item-dec-count">
        <div class="cart-item-count">${count}</div>
        <img src="./img/plus.png" alt="+" class="cart-item-inc-count">
      </div>
    </div>
  </div>
  `
}

// convert from object to html element for card in goods modal window
function makeCardAtGoodsModal(obj) {
  let price;
  if (obj["special_price"] !== null) { // has discount
    price =
      `<p class="item-price">${obj['special_price']} грн</p>
     <p class="item-old-price">${obj['price']} грн</p>`
  } else {
    price = `<p class="item-price">${obj['price']} грн</p>`
  }

  return `<div class="card id-${obj['id']}">
    <img src="${obj['image_url']}" class="card-img" alt="${obj['name']}">
    <div class="card-body">
      <h4 class="card-title"><a class="card-title-link" href="#">${obj['name']}</a></h4>
      <p class="card-description">${obj['description']}</p>
      <div class="card-price">
      ${price}
      </div>
      <button class="card-buy">Buy</button>
    </div>
  </div>
  `
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
    $input.css("border", "none");
    $input.css("border-bottom", "1px solid #ddd");
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
      categoriesNav.append(`<li class="category-item id-${category['id']}"><a class="category-link">${category["name"]}</a></li>`)
    }
  });

  // create "All categories" 
  getFromApi("https://nit.tron.net.ua/api/category/list", (categoriesJson) => {
    let $main = $(".global-main").first();
    for (const category of categoriesJson) {
      // $main.append(`<h1 class="category">${category['name']}</h1>`);
      $main.append(
        `<section class="goods-category id-${category['id']}">
          <h1 class="category-title">${category['name']}</h1>
          <h3 class="category-description">${category['description']}</h3>
          <div class="goods-container"></div>
        </section>`);

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
    let $navbarNav = $(".navbar-nav").first();
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
    const categoryId = $(event.currentTarget).parent().attr("class").substring(14);
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
    const id = $(event.currentTarget).parent().parent().attr("class").substring(8);
    if (goodsInCart.has(id)) {
      goodsInCart.set(id, goodsInCart.get(id) + 1);
    } else {
      goodsInCart.set(id, 1);
    }
    updateGoodsCount(1);
  });

  // increase quantity of item in cart from cart
  $cart.on("click", ".cart-item-inc-count", (event) => {
    let $goods = $(event.currentTarget).parent().parent().parent();
    const id = $goods.attr("class").substring(8);

    const count = goodsInCart.get(id) + 1;

    goodsInCart.set(id, count);
    $(event.currentTarget).siblings(".cart-item-count").text(count);
    updateTotalPrice(goodsInCart);
    updateGoodsCount(1);
  });

  // decrease quantity of item in cart from cart
  $cart.on("click", ".cart-item-dec-count", (event) => {
    let $goods = $(event.currentTarget).parent().parent().parent();
    const id = $goods.attr("class").substring(8);

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
    let $goods = $(event.currentTarget).parent().parent();
    const id = $goods.attr("class").substring(8);

    updateGoodsCount(-goodsInCart.get(id));
    goodsInCart.delete(id);
    updateTotalPrice(goodsInCart);
    updateCart(goodsInCart);
  });

  // modal window for goods description
  let $cardModal = $(".card-modal");
  $(".global-main, .cart-modal").on("click", ".card-title", (event) => {
    const id = $(event.currentTarget).parent().parent().attr("class").substring(8);
    getFromApi(`https://nit.tron.net.ua/api/product/${id}`, (json) => {
      $cardModal.html(makeCardAtGoodsModal(json));
    });
    $cardModal.modal({
      closeExisting: false
    });
  });

  $(".cart-buy").on("click", (event) => {
    event.preventDefault();

    let name = $(".payment-form-name").val();
    let phone = $(".payment-form-phone").val();
    let email = $(".payment-form-email").val();

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


