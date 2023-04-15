document.addEventListener('DOMContentLoaded', (event) => {
    console.log("JavaScript code loaded");

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
                // Adding a check to ensure that the item being dropped is not already in the drop area
                if (!Array.from(target.children).find(child => child.textContent === document.getElementById(srcId).textContent)) {
                    target.appendChild(document.getElementById(srcId));
                }
            }
            // Save the positions of the items in the drop areas
            updateHiddenInputs();
        });
        
    }


    /* Save items in drop area to local storage */
    function saveItemstoLocalStorage(itemsWanted, itemsForTrade) {
        localStorage.setItem("itemsWanted", JSON.stringify(itemsWanted));
        localStorage.setItem("itemsForTrade", JSON.stringify(itemsForTrade));
    }

    function loadItemsFromLocalStorage() {
        let itemsWanted = localStorage.getItem("itemsWanted");
        let itemsForTrade = localStorage.getItem("itemsForTrade");

        console.log("Loaded items from local storage:");
        console.log("Items Wanted: ", itemsWanted);
        console.log("Items For Trade: ", itemsForTrade);

        return {
            itemsWanted: itemsWanted ? itemsWanted.split(',') : [],
            itemsForTrade: itemsForTrade ? itemsForTrade.split(',') : []
        };
    }

    function updateHiddenInputs() {
        const itemsForTrade = Array.from(document.getElementById("items-for-trade").children);
        const itemsWanted = Array.from(document.getElementById("items-wanted").children);

        const itemsForTradeHidden = document.getElementById("items_for_trade_hidden");
        const itemsWantedHidden = document.getElementById("items_wanted_hidden");

        itemsForTradeHidden.value = itemsForTrade.map(item => item.textContent).join(",");
        itemsWantedHidden.value = itemsWanted.map(item => item.textContent).join(",");

        // Save items here to local storage
        saveItemstoLocalStorage(
            itemsWanted.map(item => item.textContent),
            itemsForTrade.map(item => item.textContent)
        );
    }
    console.log("Drag and drop script loaded");
    console.log('populateItems function called');
    // Populate scrap items in profile.html
    function populateItems() {
        console.log("populateItems function called inside");
        let dropAreas = document.querySelectorAll(".drop-area");
        let draggables = document.querySelectorAll(".scrap");

        // Load items from local storage if available
        let { itemsWanted: localStorageItemsWanted, itemsForTrade: localStorageItemsForTrade } = loadItemsFromLocalStorage();
        console.log("Loaded items from local storage:");
        console.log("Items Wanted: ", localStorageItemsWanted);
        console.log("Items For Trade: ", localStorageItemsForTrade);

        let itemsWanted = document.getElementById('items-wanted');
        let itemsForTrade = document.getElementById('items-for-trade');

        let itemsWantedHidden = document.getElementById('items_wanted_hidden');
        let itemsForTradeHidden = document.getElementById('items_for_trade_hidden');

        let itemsWantedList = localStorageItemsWanted.length > 0 ? localStorageItemsWanted : (itemsWanted.value ? itemsWantedHidden.value.split(',') : []);
        console.log('itemsWantedList:', itemsWantedList);
        let itemsForTradeList = localStorageItemsForTrade.length > 0 ? localStorageItemsForTrade : (itemsForTrade.value ? itemsForTradeHidden.value.split(',') : []);

        const allItems = window.allItems || [];

        const wrapperBox = document.querySelector(".box");
        
        for (const item of allItems) {
            console.log('allItems:', allItems);
            const itemText = item.trim();
        
            if (!itemsWantedList.includes(itemText) && !itemsForTradeList.includes(itemText)) {
                const newElement = document.createElement('div');
                newElement.className = 'scrap';
                newElement.draggable = 'true';
                newElement.textContent = itemText;
                wrapperBox.appendChild(newElement);
            }
        }     
        console.log("itemsWantedList: ", itemsWantedList);
        for (let i = 0; i < itemsWantedList.length; i++) {
            console.log("loop entered");
            console.log("current item: ", itemsWantedList[i]);
            const currentItem = itemsWantedList[i].trim();
            const currentScrap = Array.from(draggables).find((scrap) => scrap.textContent === currentItem);
            
            if (currentScrap) {
                // Check if the item is in the drop area and add it to the correct position
                if (itemsWanted.contains(currentScrap)) {
                    itemsWanted.insertBefore(currentScrap, itemsWanted.children[i]);
                } else {
                    itemsWanted.appendChild(currentScrap);
                    console.log("Added item to Wanted drop area: ", currentItem);
                }
            }
        }
        
        for (let i = 0; i < itemsForTradeList.length; i++) {
            console.log("current item: ", itemsForTradeList[i]);
            const currentItem = itemsForTradeList[i].trim();
            const currentScrap = Array.from(draggables).find((scrap) => scrap.textContent === currentItem);
            
            if (currentScrap) {
                // Check if the item is in the drop area and add it to the correct position
                if (itemsForTrade.contains(currentScrap)) {
                    itemsForTrade.insertBefore(currentScrap, itemsForTrade.children[i]);
                } else {
                    itemsForTrade.appendChild(currentScrap);
                    console.log("current scrap");
                }
            }
        }

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
                console.log("drop function");
            
                if (target.classList.contains("drop-area")) {
                    if (target.classList.contains("box")) {
                        let wrapperBox = document.querySelector(".box");
                        wrapperBox.appendChild(document.getElementById(srcId));
                    } else {
                        if (target.querySelector("#" + srcId) === null) { // Check if item is already in the drop area
                            target.appendChild(document.getElementById(srcId));
                        }
                    }
                }
                updateHiddenInputs();
                console.log("hidden inputs");
            });
            
        }
    }

});
function submitForm() {
    document.getElementById("update-profile-form").submit();
  }

// Assign the submitForm function to the global window object
window.submitForm = submitForm;
