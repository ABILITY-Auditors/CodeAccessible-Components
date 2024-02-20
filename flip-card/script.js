document.addEventListener("DOMContentLoaded", function () {
 var flipCards = document.querySelectorAll(".flip-card");

 flipCards.forEach(function (card) {
  card.addEventListener("click", function () {
   toggleFlip(card);
   toggleSrHidden(card);
  });

  card.addEventListener("keydown", function (event) {
   if ((event.code === "Enter" || event.code === "Space") && !event.repeat) {
    event.preventDefault();
    toggleFlip(card);
    toggleSrHidden(card);
   }
  });
 });

 //function that toggles the expanded state
 function toggleFlip(card) {
  var isPressed = card.getAttribute("aria-pressed") === "true";
  card.setAttribute("aria-pressed", String(!isPressed));
 }

 //function that toggles the aria-hidden state and removes the tabindex on the link.
 function toggleSrHidden(card) {
  let isSRHidden = card.getAttribute("aria-pressed") === "true";
  front.setAttribute("aria-hidden", String(isSRHidden));
  back.setAttribute("aria-hidden", String(!isSRHidden));
  if (linkRemove.getAttribute("tabindex") == 0) {
   linkRemove.setAttribute("tabindex", String("-1"));
  } else {
   linkRemove.setAttribute("tabindex", String("0"));
  }
 }
});
