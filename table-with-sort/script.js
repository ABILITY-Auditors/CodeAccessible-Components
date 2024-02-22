let currentColumnIdx = 0;
let sortOrder = "ascending";

const sortTable = (colIdx) => {
 let table = document.getElementById("container");
 let rows = table.rows;
 let shouldSwitch, i; //initialize
 let switching = true;
 //  let i;

 //toggle sort order

 if (colIdx === currentColumnIdx) {
  sortOrder = sortOrder === "ascending" ? "descending" : "ascending";
 } else {
  sortOrder = "ascending";
  //Reset the sort indicator for other columns

  let sortBtnIndicators = document.querySelectorAll("#container th button");

  sortBtnIndicators.forEach((btn) => {
   if (btn !== btn[colIdx]) {
    btn.classList.remove("ascending", "descending");
   }
  });
 }

 // Update current column index

 currentColumnIdx = colIdx;

 while (switching) {
  switching = false;

  for (i = 1; i < rows.length - 1; i++) {
   shouldSwitch = false;
   let x = rows[i].getElementsByTagName("TD")[colIdx];

   let y = rows[i + 1].getElementsByTagName("TD")[colIdx];

   if (sortOrder === "ascending") {
    if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
     shouldSwitch = true;
     break;
    }
   } else {
    if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
     shouldSwitch = true;
     break;
    }
   }
  }
  if (shouldSwitch) {
   rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
   switching = true;
  }
 }

 let orderIndicator = document.querySelectorAll(".order button")[colIdx];

 orderIndicator.textContent =
  sortOrder === "ascending" ? "descending" : "ascending";

 let sortBtnIndicators = document.querySelectorAll("#container th button");

 sortBtnIndicators[currentColumnIdx].classList.remove(
  "ascending",
  "descending"
 );
 sortBtnIndicators[currentColumnIdx].classList.add(sortOrder);
};
