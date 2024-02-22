let currentColumnIdx = 0;
let sortOrder = "ascending";
let table = document.getElementById("container");
let rows = table.rows;
let switching = true;

const sortTable = (colIdx) => {
 let shouldSwitch; //initialize
 let i; //initialize

 //toggle sort order

 if (colIdx === currentColumnIdx) {
  sortOrder = sortOrder === "ascending" ? "descending" : "ascending";
 } else {
  sortOrder = "ascending";
  //Reset the sort indicator for other columns

  let sortBtnIndicators = document.querySelectorAll("button");

  sortBtnIndicators.forEach((btn) => {
   if (btn !== btn[colIdx]) {
    btn.classList.remove("ascending", "descending");
   }
  });
 }
};
