"use strict"

import './scss/admin.scss'
import $ from "jquery"
import "jquery-modal"
import "jquery-modal/jquery.modal.min.css"

$(async function () {

  $(".auth").modal({
    clickClose: false,
    showClose: false,
    escapeClose: false,
  });

  $('.auth-submit').on("click", () => {

    const user = $(".auth-form-username").val();
    const pass = $(".auth-form-password").val();

    $.ajax({
      url: "http://localhost:3000/api/auth/signin",
      type: "POST",
      data: {
        username: user,
        password: pass
      },
      success: (json) => {
        $.modal.close();
      },
      error: (request, status, error) => {
        alert("Invalid username or password. Try again!");
        $(".auth-form").trigger("reset");
      }
    });
  });

  $(".show-orders").on("click", () => {

    const $orders = $(".orders");
    $orders.empty();

    getFromApi("http://localhost:3000/api/order/list", (json) => {
      for (const order of json) {
        const name = order.name;
        const phone = order.phone;
        const email = order.email;
        const products = new Map();

        for (const mapped of order.orderToProduct) {
          products.set(mapped.productId, mapped.count);
        }

        const $order = $("<div>", { "class": "order" });
        const $name = $("<div>", { "class": "order-name" }).text(`Name: ${name}`);
        const $phone = $("<div>", { "class": "order-phone" }).text(`Phone: ${phone}`);
        const $email = $("<div>", { "class": "order-email" }).text(`Email: ${email}`);
        const $products = $("<div>", { "class": "order-products" });
        const $ordered = $("<div>", { "class": "order-ordered" }).text("Ordered products:");
        $products.append($ordered);
        for (const [id, count] of products.entries()) {
          getFromApi(`http://localhost:3000/api/product/${id}`, (json) => {
            const $product = $("<div>", {"class" : "order-product"});
            const productName = `${json.name}; ${count} pieces`;
            $product.text(productName);
            $products.append($product);
          });
        }
        $order.append($name, $phone, $email, $products);

        $orders.append($order);
      }
    });
  });

});

function getFromApi(url, onSuccess) {
  $.ajax({
    url: url,
    dataType: "json",
    type: "GET",
    success: onSuccess,
    error: (jqXHR, status, error) => {
      alert('An error occurred... Look at the console (F12 or Ctrl+Shift+I, Console tab) for more information!');

      console.log("Error at GET method occured:");
      console.log(`Link: ${url}`);

      const errorJson = jqXHR.responseJSON;
      console.log(`Status: ${errorJson["status"]}`);
      console.log(`Status Code: ${errorJson["statusCode"]}`);
      console.log(`Status Text: ${errorJson["statusText"]}`);
    }
  });
}
