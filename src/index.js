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

// convert from object{name, image_url, price, special_price} to html element
function makeCard(obj) {
  let price;
  if (obj["special_price"] !== null) { // has discount
    price =
      `<p class="item-price">${obj['special_price']}грн</p>
     <p class="item-old-price">${obj['price']} грн</p>`
  } else {
    price = `<p class="item-price">${obj['price']} грн</p>`
  }

  return `<div class="card">
    <img src="${obj['image_url']}" class="card-img" alt="...">
    <div class="card-body">
      <h4 class="card-title"><a class="card-title-link" href="#">${obj['name']}</a></h4>
      <div class="card-price">
      ${price}
      </div>
      <button class="card-buy">Buy</button>
    </div>
  </div>
  `
}


$(function () {

  let categories = [];

  // create categories navbar
  getFromApi("https://nit.tron.net.ua/api/category/list", (json) => {
    let categoriesNav = $(".categories-nav").first();
    categoriesNav.append(`<li class="category-item"><a class="category-link">All categories</a></li>`)
    for (const category of json) {
      categories.push(category["id"]);
      categoriesNav.append(`<li class="category-item"><a class="category-link">${category["name"]}</a></li>`)
    }
  });

  // create "All categories" 
  getFromApi("https://nit.tron.net.ua/api/category/list", (categoriesJson) => {
    let $main = $("main").first();
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
          $container.append(makeCard(item));
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

});

