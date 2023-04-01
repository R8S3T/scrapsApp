//Create Drag and Drop function in update_profile.html

let dropAreas = document.querySelectorAll(".drop-area");
let draggables = document.querySelectorAll(".scrap");

for (let i = 0; i < draggables.length; i++) {
    draggables[i].addEventListener("dragstart", function(e) {
        e.dataTransfer.setData("srcId", e.target.id);
    });
}

for (let i = 0; i < dropAreas.length; i++) {
    dropAreas[i].addEventListener("dragover", function(e) {
        e.preventDefault();
    });

    dropAreas[i].addEventListener("drop", function(e) {
        e.preventDefault();
        let target = e.target;
        let srcId = e.dataTransfer.getData("srcId");

        if (target.classList.contains("drop-area")) {
            target.appendChild(document.getElementById(srcId))
        }
        console.log("Items Data");
    });
}

// Populate scrap items in profile.html

function populateItems() {
    const itemsDataElement = document.getElementById("items-data");

    if (itemsDataElement) {
        const itemsData = JSON.parse(itemsDataElement.textContent);
        console.log("Items Data works");
        const itemsForTrade = itemsData.itemsForTrade;
        const itemsWanted = itemsData.itemsWanted;

        const itemsForTradeContainer = document.getElementById("items-for-trade");
        const itemsWantedContainer = document.getElementById("items-wanted");

        if (itemsForTrade) {
            itemsForTrade.forEach((item) => {
                const itemDiv = document.createElement("div");
                itemDiv.classList.add("item");
                itemDiv.textContent = item;
                itemsForTradeContainer.appendChild(itemDiv);
            });
        }

        if (itemsWanted) {
            itemsWanted.forEach((item) => {
                const itemDiv = document.createElement("div");
                itemDiv.classList.add("item");
                itemDiv.textContent = item;
                itemsWantedContainer.appendChild(itemDiv);
            });
        }
    }
}

console.log("Before calling populateItems()");
populateItems();
console.log("After calling populateItems()");

function updateHiddenInputs() {
    console.log('updateHiddenInputs called');

    const itemsWanted = document.querySelector('.items-wanted');
    const itemsForTrade = document.querySelector('.items-for-trade');

    const itemsWantedChildren = itemsWanted.children.length ? [...itemsWanted.children] : [];
    const itemsForTradeChildren = itemsForTrade.children.length ? [...itemsForTrade.children] : [];

    const itemsWantedTextContent = itemsWantedChildren.map(item => item.textContent);
    const itemsForTradeTextContent = itemsForTradeChildren.map(item => item.textContent);

/*     console.log("Items Wanted Children:", itemsWantedChildren);
    console.log("Items for Trade Children:", itemsForTradeChildren);
    console.log("Items Wanted Text Content:", itemsWantedTextContent);
    console.log("Items for Trade Text Content:", itemsForTradeTextContent); */

/*     console.log('Setting items_wanted hidden input value:', JSON.stringify(itemsWantedTextContent));
    console.log('Setting items_for_trade hidden input value:', JSON.stringify(itemsForTradeTextContent)); */

    document.getElementById('items_wanted_hidden').value = JSON.stringify(itemsWantedTextContent);
    document.getElementById('items_for_trade_hidden').value = JSON.stringify(itemsForTradeTextContent);

/*     console.log('items_wanted hidden input value after setting:', document.getElementById('items_wanted_hidden').value);
    console.log('items_for_trade hidden input value after setting:', document.getElementById('items_for_trade_hidden').value); */
}


function submitForm() {
    updateHiddenInputs();
    console.log('Submitting the form');
    document.querySelector('form').submit();
}


