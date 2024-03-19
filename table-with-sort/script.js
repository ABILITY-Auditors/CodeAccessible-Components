let currentColumnIndex = 0;
let sortOrder = "ascending";

function sortTable(colIdx) {
 let table = document.getElementById("container");
 let rows = table.rows;
 let switching = true;
 let shouldSwitch, i;

 //Toggle sort order

 if (colIdx === currentColumnIndex) {
  sortOrder = sortOrder === "ascending" ? "descending" : "ascending";
 } else {
  sortOrder = "ascending";
  //reset order indicator for other columns
  let headers = document.querySelectorAll("#container th button");
  headers.forEach((header) => {
   if (header !== headers[colIdx]) {
    header.classList.remove("ascending", "descending");
   }
  });
 }

 //update current column index

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
}
