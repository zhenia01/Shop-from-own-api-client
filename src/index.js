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

$(function () {

  getFromApi("https://nit.tron.net.ua/api/category/list", (json) => {
    console.log(json);
    let categoriesNav = $(".categories-nav");
    categoriesNav.append(`<li class="category-item"><a class="category-link" href="#">All categories</a></li>`)
    for (const category of json) {
      categoriesNav.append(`<li class="category-item"><a class="category-link" href="#">${category["name"]}</a></li>`)
    }
  });

  $(".navbar-menu-button").on("click", () => {
    $(".navbar-nav").toggleClass("menu-open");
    $(".navbar-nav .nav-item").toggleClass("menu-open");
  });

  $(".nav-link").first().on("click", () => {
    let categoriesNavbar = $("aside");
    categoriesNavbar.toggleClass("opened");
    // let isVisible = categoriesNavbar.hasClass("opened");
    // let isVisible = (categoriesNavbar.css("visibility") === "visible");
    // categoriesNavbar.css({ "visibility": (!isVisible ? "visible" : "hidden") });
    // $("body").css({
    //   "grid-template-areas": (!isVisible ?
    //     `"h h h h h h h h h h h h h h h h h h"
    //   "с с с m m m m m m m m m m m m m m m"
    //   "f f f f f f f f f f f f f f f f f f"` :
    //     `"h h h h h h h h h h h h h h h h h h"
    // "m m m m m m m m m m m m m m m m m m"
    // "f f f f f f f f f f f f f f f f f f"`)
    // });
  });


});
