const articles = [
    {
        title: "Article 1",
        author: "Seth Chan",
        content: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero quaerat officia ipsa. Fugit at vero libero incidunt ipsam iusto reiciendis velsequi consequuntur, minima facere placeat voluptates debitis dignissimosdoloribus"
    },
    {
        title: "Article 2",
        author: "Sean Chan",
        content: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero quaerat officia ipsa. Fugit at vero libero incidunt ipsam iusto reiciendis velsequi consequuntur, minima facere placeat voluptates debitis dignissimosdoloribus"
    },
    {
        title: "Article 3",
        author: "Yohan",
        content: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero quaerat officia ipsa. Fugit at vero libero incidunt ipsam iusto reiciendis velsequi consequuntur, minima facere placeat voluptates debitis dignissimosdoloribus"
    },
    {
        title: "Article 4",
        author: "Tippy Aquino",
        content: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero quaerat officia ipsa. Fugit at vero libero incidunt ipsam iusto reiciendis velsequi consequuntur, minima facere placeat voluptates debitis dignissimosdoloribus"
    },
    {
        title: "Article 5",
        author: "Arya Miller",
        content: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero quaerat officia ipsa. Fugit at vero libero incidunt ipsam iusto reiciendis velsequi consequuntur, minima facere placeat voluptates debitis dignissimosdoloribus"
    },
    {
        title: "Article 6",
        author: "Abby Miller",
        content: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero quaerat officia ipsa. Fugit at vero libero incidunt ipsam iusto reiciendis velsequi consequuntur, minima facere placeat voluptates debitis dignissimosdoloribus"
    },
    {
        title: "Article 7",
        author: "Jeff Aquino",
        content: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero quaerat officia ipsa. Fugit at vero libero incidunt ipsam iusto reiciendis velsequi consequuntur, minima facere placeat voluptates debitis dignissimosdoloribus"
    },
]


let articleListContainer = document.getElementById("articleListContainer")   // Select the list container element



function displayArray(arr) {
    let ol = document.createElement("ol") // Create an unordered list element
    arr.forEach(arrObj => {   // Iterate over the array of objects
        let li = document.createElement("li")
        li.innerHTML = `<h2> ${arrObj.title} </h2>  <h6> ${arrObj.author} </h6> <p> ${arrObj.content} </p>`
        ol.appendChild(arrObj) // Append the list item to the unordered list
    })
    articleListContainer.appendChild(ol) // Append the unordered list to the list container
}

displayArray(articles);