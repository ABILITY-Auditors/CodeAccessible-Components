const radioButtons = document.querySelectorAll(".radioButton");

//Function to toggle the checked state of the radio buttons

const toggleRadio = () => {
 radioButtons.forEach((button) => {
  button.checked = !button.checked;
 });
};

//Attach event listener to each radio button.

radioButtons.forEach((button) => {
 button.addEventListener("click", toggleRadio);
});
