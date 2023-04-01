document.addEventListener("DOMContentLoaded", function() {
    console.log('itemsForTrade drop event');
    // Define draggable items in a dictionary
    let items = [
        {name: 'wood', value: 'Wood'},
        {name: 'cotton', value: 'Cotton Fabric'},
        {name: 'metal', value: 'Metal'},
        {name: 'tiles', value: 'Tiles'},
        {name: 'plastics', value: 'Plastics'}
        ];

    // Find the items_for_trade and items_wanted select boxes in html
    let itemsForTrade = document.querySelector('#items_for_trade');
    let itemsWanted = document.querySelector('#items_wanted');

    // Find the item-list div in html
    let itemList = document.querySelector('#draggable-items');
    console.log(itemList)
    

    // Find all the draggable items in html
    let draggableItems = document.querySelectorAll('.draggable-item');
    console.log(draggableItems)

    // Add a dragover event listener to the item-list div
    // Do i need this?
    itemList.addEventListener('dragover', function(event) {
        console.log('itemsForTrade drop event');
        event.preventDefault();
    });

    itemList.addEventListener('drop', function (event) {
        event.preventDefault();
        let itemName = event.dataTransfer.getData('text/plain');
        let item = items.find(item => item.name === itemName);
        if (item) {
            let itemName = item.name;
            let itemValue = item.value;

        } else {
            console.error('No item found for itemName:', itemName);
        }

        let div = document.createElement('div');
        div.classList.add('draggable-item');
        div.setAttribute('data-item', item.name);
        div.textContent = item.value;
        div.draggable = true;
        div.addEventListener('dragstart', function (event) {
            event.dataTransfer.setData('text/plain', 'custom');
            event.dataTransfer.effectAllowed = 'move';
            event.currentTarget.dataset.dragged = 'true';
        });
        itemList.appendChild(div);
        draggableItems = document.querySelectorAll('.draggable-item');
    
        // Add a dragover event listener to all the draggable items
        draggableItems.forEach(function (item) {
            item.addEventListener('dragover', function (event) {
                event.preventDefault();
            });
        });

        // Add a dragstart event listener to all the draggable items
        draggableItems.forEach(function (item) {
            let draggedItem = null;
            item.addEventListener('dragstart', function (event) {
                let data = JSON.stringify({ name: item.getAttribute('data-item'), value: item.textContent });
                event.dataTransfer.setData('application/json', data);
                event.dataTransfer.effectAllowed = 'move';
                draggedItem = event.target; // store the dragged item
                draggedItem.dataset.dragged = 'true';
            });
        });
    });

    // Add a dragover event listener to the items_for_trade select box
    itemsForTrade.addEventListener('dragover', function(event) {
    event.preventDefault();
    });

    // Add a drop event listener to the items_for_trade select box

    itemsForTrade.addEventListener('drop', function (event) {
        event.preventDefault();
        let itemData = event.dataTransfer.getData('text/plain');
        console.log("something?")
        if (itemData) {
            try {
            itemData = JSON.parse(itemData);
            console.log('itemData:', itemData);
            let itemName = itemData.name;
            let itemValue = itemData.value;
  
            let item = items.find(item => item.name === itemName);
                if (item) {
                // Check if the item is already in the select box
                    let existingOption = Array.from(itemsForTrade.options).find(option => option.value === item.name);
                        if (!existingOption) {
                            let option = document.createElement('option');
                            option.setAttribute('value', item.name);
                            option.textContent = item.value;
                            itemsForTrade.appendChild(option);

                            // Remove the item from the item-list
                            let draggedItem = document.querySelector('[data-dragged="true"]');
                            if (draggedItem) {
                                draggedItem.parentNode.removeChild(draggedItem);
                            }
                        }
                            } else {
                            console.error('No item found for itemName:', itemName);
                            }
            } catch (error) {
                console.error('Error parsing JSON data:', error);
            }
        } else {
            console.warn('No JSON data found in event');
        }
  });

    // Add a dragover event listener to the items_wanted select box
    itemsWanted.addEventListener('dragover', function(event) {
        event.preventDefault();
    });

    // Add a drop event listener to the items_wanted select box
    itemsWanted.addEventListener('drop', function (event) {
        event.preventDefault();
        console.log('itemsWanted drop event');
        let itemData = JSON.parse(event.dataTransfer.getData('application/json'));
        console.log('itemData:', itemData); // added console log statement
        let itemName = itemData.name;
        let itemValue = itemData.value;

        let item = items.find(item => item.name === itemName);
        if (item) {
            // Check if the item is already in the select box
            let existingOption = Array.from(itemsWanted.options).find(option => option.value === item.name);
            if (!existingOption) {
            let option = document.createElement('option');
            option.setAttribute('value', item.name);
            option.textContent = item.value;
            itemsWanted.appendChild(option);

            // Remove the item from the item-list
            let draggedItem = document.querySelector('[data-dragged="true"]');
            if (draggedItem) {
                draggedItem.parentNode.removeChild(draggedItem);
            }
        }
    }
});

// Add the dragend event listener outside of the drop event listeners
draggableItems.forEach(function (item) {
    item.addEventListener('dragend', function (event) {
        event.target.removeAttribute('data-dragged');
    });
});
}); 





// get the item like 'wood'
    // Find the item-list div in html
    //let itemList = document.querySelector('[data-item="wood"]');
    console.log(itemList)

    // Find all the draggable items in html
    //let draggableItems = document.querySelectorAll('.draggable-item');
    console.log(draggableItems)

// add the dragstart event to item
// add the dragend event to item
// on dragend place item in