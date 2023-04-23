document.addEventListener('DOMContentLoaded', (event) => {
    console.log("JavaScript code loaded");
    const style = document.createElement('style');
style.innerHTML = `
    .scrap-container {
        border: 2px dashed #ccc;
        padding: 10px;
        margin: 25px;
        min-height: 60px;
        width: 350px;
        position: relative;
    }
    .delete-scrap-btn {
        position: absolute;
        top: 5px;
        right: 5px;
        display: none;
    }
    .scrap-container:hover .delete-scrap-btn {
        display: block;
    }
`;
document.head.appendChild(style);

    //Create Drag and Drop function in update_profile.html

    let dropAreas = document.querySelectorAll(".drop-area");
    let draggables = document.querySelectorAll(".scrap");

    function makeDraggable(element) {
        element.setAttribute('draggable', 'true');
        element.addEventListener('dragstart', function(e) {
            console.log("Source element id:", e.target.id);
            console.log("Source element text content:", e.target.textContent);
            e.dataTransfer.setData("srcId", e.target.id);
        }, false);
    }

    draggables.forEach(makeDraggable);

    for (let i = 0; i < dropAreas.length; i++) {
        dropAreas[i].addEventListener("dragover", function(e) {
            e.preventDefault();
        });
    }

    // Save items in drop area to local storage
    function saveItemstoLocalStorage(itemsWanted, itemsForTrade) {
        localStorage.setItem("itemsWanted", JSON.stringify(itemsWanted));
        localStorage.setItem("itemsForTrade", JSON.stringify(itemsForTrade));
    }

    // Load items from local storage
    function loadItemsFromLocalStorage() {
        let itemsWanted = JSON.parse(localStorage.getItem("itemsWanted") || "[]");
        let itemsForTrade = JSON.parse(localStorage.getItem("itemsForTrade") || "[]");

        console.log("Loaded items from local storage:");
        console.log("Items Wanted: ", itemsWanted);
        console.log("Items For Trade: ", itemsForTrade);

        return {
            itemsWanted: itemsWanted,
            itemsForTrade: itemsForTrade
        };
    }

    // Update Hidden Inputs
    function updateHiddenInputs() {
        const itemsForTrade = Array.from(document.getElementById("items-for-trade").querySelectorAll('.scrap')); // Only consider elements with the class 'scrap'
        const itemsWanted = Array.from(document.getElementById("items-wanted").querySelectorAll('.scrap')); // Only consider elements with the class 'scrap'
    
        const itemsForTradeHidden = document.getElementById("items_for_trade_hidden");
        const itemsWantedHidden = document.getElementById("items_wanted_hidden");
    
        itemsForTradeHidden.value = itemsForTrade.map(item => item.innerText.trim()).join(",");
        itemsWantedHidden.value = itemsWanted.map(item => item.innerText.trim()).join(",");
    
        // Save items here to local storage
        saveItemstoLocalStorage(
            itemsWanted.map(item => item.innerText.trim()),
            itemsForTrade.map(item => item.innerText.trim())
        );
        console.log(itemsForTradeHidden.value, itemsWantedHidden.value);
    }
    

    function getItemsFromDropArea(dropAreaId) {
        const dropArea = document.getElementById(dropAreaId);
        const items = Array.from(dropArea.querySelectorAll(".scrap")).map(scrap => scrap.textContent.trim());
        return items;
    };

    // Populate Items Function
    function populateItems() {
        console.log("populateItems function called inside");
        let dropAreas = document.querySelectorAll(".drop-area");
        let draggables = document.querySelectorAll(".scrap");
    
        // Load items from local storage if available
        let localStorageItemsWanted = localStorage.getItem('itemsWanted') ? JSON.parse(localStorage.getItem('itemsWanted')) : [];
        let localStorageItemsForTrade = localStorage.getItem('itemsForTrade') ? JSON.parse(localStorage.getItem('itemsForTrade')) : [];
    
        console.log("Loaded items from local storage:");
        console.log("Items Wanted: ", localStorageItemsWanted);
        console.log("Items For Trade: ", localStorageItemsForTrade);
    
        let itemsWanted = document.getElementById('items-wanted');
        let itemsForTrade = document.getElementById('items-for-trade');
    
        let itemsWantedHidden = document.getElementById('items_wanted_hidden');
        let itemsForTradeHidden = document.getElementById('items_for_trade_hidden');
    
        let itemsWantedList = localStorageItemsWanted.length > 0 ? localStorageItemsWanted : (itemsWantedHidden.value ? itemsWantedHidden.value.split(',').filter(item => item.trim() && item.trim() !== 'Add Scrap') : []);
        let itemsForTradeList = localStorageItemsForTrade.length > 0 ? localStorageItemsForTrade : (itemsForTradeHidden.value ? itemsForTradeHidden.value.split(',').filter(item => item.trim() && item.trim() !== 'Add Scrap') : []);
        
    
        console.log("Loaded itemsWantedList:", itemsWantedList);
        console.log("Loaded itemsForTradeList:", itemsForTradeList);
    
        const allItems = window.allItems || [];
        const wrapperBox = document.querySelector(".box");
    
        for (const item of allItems) {
            const itemText = item.trim();
            if (!itemsWantedList.includes(itemText) && !itemsForTradeList.includes(itemText)) {
                const newElement = document.createElement('div');
                newElement.className = 'scrap';
                newElement.draggable = 'true';
                newElement.textContent = itemText;
                newElement.id = 'scrap-' + itemText.replace(/\s+/g, '-').toLowerCase(); // Add this line
                wrapperBox.appendChild(newElement);
            }
        }
        console.log("itemsWantedList: ", itemsWantedList);
        for (let i = 0; i < itemsWantedList.length; i++) {
            const currentItem = itemsWantedList[i].trim();
            const currentScrap = Array.from(draggables).find((scrap) => scrap.textContent === currentItem);
            if (currentScrap) {
                const targetContainer = itemsWanted.querySelectorAll('.scrap-container')[i];
                targetContainer.insertBefore(currentScrap, targetContainer.firstChild);
            }
        }
        for (let i = 0; i < itemsForTradeList.length; i++) {
            const currentItem = itemsForTradeList[i].trim();
            const currentScrap = Array.from(draggables).find((scrap) => scrap.textContent === currentItem);
    
            if (currentScrap) {
                const targetContainer = itemsForTrade.querySelectorAll('.scrap-container')[i];
                targetContainer.insertBefore(currentScrap, targetContainer.firstChild);
            }
        }
        draggables.forEach((draggable) => {
            draggable.addEventListener("dragstart", function(e) {
                e.dataTransfer.setData("srcId", e.target.id);
            });
        });
        dropAreas.forEach(dropArea => {
            dropArea.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            dropArea.addEventListener('drop', (e) => {
                e.preventDefault();
                let srcId = e.dataTransfer.getData("srcId");
                let sourceElement = document.getElementById(srcId);

                if (sourceElement instanceof Node) {
                    const scrapContainer = e.target.closest('.scrap-container');
                    if (scrapContainer) {
                        const existingScrap = scrapContainer.querySelector('.scrap');
                        if (existingScrap) {
                            existingScrap.remove();
                        }
                        scrapContainer.insertBefore(sourceElement, scrapContainer.firstChild);
                    }
                } else {
                    console.error('sourceElement is not a valid DOM Node:', sourceElement);
                }
                updateHiddenInputs();
            });
        });
        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-scrap-btn').forEach(function (btn) {
            btn.addEventListener('click', function (event) {
                event.preventDefault(); // Add this line to prevent default behavior
                const scrap = event.target.parentNode;
                scrap.parentNode.removeChild(scrap);
                updateHiddenInputs(); // Update hidden inputs after deleting an item
            });
        });
        for (let i = 0; i < itemsWantedList.length; i++) {
            const currentItem = itemsWantedList[i].trim();
            const currentScrap = Array.from(draggables).find((scrap) => scrap.textContent === currentItem);

            if (currentScrap) {
                const targetContainer = itemsWanted.querySelectorAll('.scrap-container')[i];
                targetContainer.insertBefore(currentScrap, targetContainer.firstChild);
            }
        }
        for (let i = 0; i < itemsForTradeList.length; i++) {
            const currentItem = itemsForTradeList[i].trim();
            const currentScrap = Array.from(draggables).find((scrap) => scrap.textContent === currentItem);

            if (currentScrap) {
                const targetContainer = itemsForTrade.querySelectorAll('.scrap-container')[i];
                targetContainer.insertBefore(currentScrap, targetContainer.firstChild);
            }
        }
    }

    document.getElementById('items_wanted_hidden').value = getItemsFromDropArea('items-wanted').join(',');
    document.getElementById('items_for_trade_hidden').value = getItemsFromDropArea('items-for-trade').join(',');

    function submitForm() {
        localStorage.removeItem("itemsWanted");
        localStorage.removeItem("itemsForTrade");
        document.getElementById("update-profile-form").submit();
    }

    document.getElementById("submit-btn").addEventListener("click", function (event) {
        event.preventDefault();
        submitForm();
    });
    // Assign the submitForm function to the global window object
    window.submitForm = submitForm;
    populateItems();
});
