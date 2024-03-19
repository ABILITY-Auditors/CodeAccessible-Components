let currentColumnIndex = 0;
let sortOrder = "ascending";

function sortTable(colIndex) {
 let table = document.getElementById("myTable");
 let rows = table.rows;
 let switching = true;
 let shouldSwitch, i;

 // Toggle sort order
 if (colIndex === currentColumnIndex) {
  sortOrder = sortOrder === "ascending" ? "descending" : "ascending";
 } else {
  sortOrder = "ascending";
  // Reset order indicator for other columns
  let headers = document.querySelectorAll("#myTable th button");
  headers.forEach((header) => {
   if (header !== headers[colIndex]) {
    header.classList.remove("ascending", "descending");
   }
  });
 }

 // Update current column index
 currentColumnIndex = colIndex;

 while (switching) {
  switching = false;
  for (i = 1; i < rows.length - 1; i++) {
   shouldSwitch = false;
   let x = rows[i].getElementsByTagName("TD")[colIndex];
   let y = rows[i + 1].getElementsByTagName("TD")[colIndex];

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

 // Update order indicator
 let orderIndicator = document.querySelectorAll("#myTable th button .order")[
  colIndex
 ];
 orderIndicator.ariaLabel =
  sortOrder === "ascending" ? "ascending" : "descending";
 let headers = document.querySelectorAll("#myTable th button");
 headers[currentColumnIndex].classList.remove("ascending", "descending");
 headers[currentColumnIndex].classList.add(sortOrder);
}
