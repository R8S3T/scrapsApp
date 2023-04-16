/* let mapInitialized = false; */
let mapReady = false;
let map;
let markers = [];

function addMarkersAndInfoWindows(userData) {
  // Clear existing markers
  markers.forEach(marker => marker.setMap(null));
  markers = [];

  let currentInfoWindow = null;

  for (let i = 0; i < userData.length; i++) {
      let user = userData[i];
      let marker = new google.maps.Marker({
          position: new google.maps.LatLng(user.lat, user.lng),
          map: map,
          title: user.username
      });

      // Add the marker to markers array
      markers.push(marker);

      let infoWindowContent = `<div>
          <h4>${user.username}</h4>
          ${user.address ? `<p>${user.address}</p>` : ''}
          <p>Items for Trade: ${user.items_for_trade.join(', ')}</p>
          <p>Items wanted: ${user.items_wanted.join(', ')}</p>
          <button onclick="window.location.href='/user/${encodeURIComponent(user.username)}'">View Profile</button>
      </div>`;

      let infoWindow = new google.maps.InfoWindow({
          content: infoWindowContent
      });

      // Open infoWindow when marker is clicked
      marker.addListener("click", () => {
          if (currentInfoWindow) {
              currentInfoWindow.close();
          }
          infoWindow.open(map, marker);
          currentInfoWindow = infoWindow;
      });
  }
  console.log('Markers added:', markers);
}

function loadGoogleMapsAPI() {
  return new Promise((resolve, reject) => {
    const apiKey = document.querySelector('meta[name="google-maps-api-key"]').content;

    if (!apiKey) {
      console.error('Google Maps API key is missing!');
      reject('Google Maps API key is missing');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer =true;

    // Eventlistener for script loading
    script.addEventListener('load', () => {
      resolve();
    });
    script.addEventListener('error', () => {
      reject('Error loading Google Maps API script');
    });

    document.body.appendChild(script);
  });
}

function waitForMap() {
  return new Promise((resolve) => {
    if (mapReady) {
      console.log('Map is ready');
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (mapReady) {
          clearInterval(checkInterval);
          console.log('Map is ready');
          resolve();
        }
      }, 100);
    }
  });
}


function initMap() {
  return new Promise((resolve) => {
    let mapOptions = {
      zoom: 12,
      minZoom: 2,
      center: {lat: 52.5200, lng: 13.4050}
  };

  map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Create a search box and link it to the search input field
    let input = document.getElementById('search-input');
    let searchBox = new google.maps.places.SearchBox(input);
  
    // Google Places API will prioritize results 
    // that are within the current map's viewport
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    // Add a listener for the place_changed event
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

          if (places.length === 0) {
            return;
        }

        // For each place, get the icon, name, and location
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            // Create a marker for the place
            new google.maps.Marker({
                map: map,
                title: place.name,
                position: place.geometry.location
            });

            // Update the map bounds based on the place's location
            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });

        map.fitBounds(bounds);
    });

        resolve();
        mapReady = true;
        /* mapInitialized = true; */
  });
}

async function fetchUserData() {
  try {
    const response = await fetch("api/users");
    if (response.ok) {
      const userData = await response.json();

      // Call the function to add markers and info windows
      addMarkersAndInfoWindows(userData);
    } else {
      console.error(
        "Error fetching user data",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}


// GET USER DATA

let allUsers = [];

// Fetch all users when page loads
window.onload = async function () {
  const response = await fetch("/api/users");
  allUsers = await response.json();

  console.log("Fetched users:", allUsers);

  // Fetch user data and call searchItems after the map is initialized
  fetchUserData();
};

let previousItemsForTradeSearch = '';
let previousItemsWantedSearch = '';

async function searchItems() {
  const itemsForTradeSearch = document.getElementById('itemsForTradeSearch').value.toLowerCase();
  const itemsWantedSearch = document.getElementById('itemsWantedSearch').value.toLowerCase();

  if (itemsForTradeSearch === previousItemsForTradeSearch && itemsWantedSearch === previousItemsWantedSearch) {
    return;
  }

  previousItemsForTradeSearch = itemsForTradeSearch;
  previousItemsWantedSearch = itemsWantedSearch;

  const filteredUsers = allUsers.filter(user =>  {
    const itemsForTrade = user.items_for_trade.map(item => item.toLowerCase());
    const itemsWanted = user.items_wanted.map(item => item.toLowerCase());

    const itemsForTradeMatch = itemsForTrade.includes(itemsForTradeSearch);
    const itemsWantedMatch = itemsWanted.includes(itemsWantedSearch);

    return itemsForTradeMatch || itemsWantedMatch;
  });

  await waitForMap();
  addMarkersAndInfoWindows(filteredUsers);

  // Update map bounds to fit filtered markers
  let bounds = new google.maps.LatLngBounds();
  if (markers.length > 0) {
    markers.forEach(marker => bounds.extend(marker.getPosition()));
    map.fitBounds(bounds);
  
    google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
      let zoom = map.getZoom();
      let maxZoom = 15;
      let minZoom = 10;
      if (zoom > maxZoom) {
        map.setZoom(maxZoom);
      } else if (zoom < minZoom) {
        map.setZoom(minZoom);
      }
    });
  }
}


// Attach initMap to the window object
window.initMap = initMap;

document.addEventListener("DOMContentLoaded", async function() {
  try {
    await loadGoogleMapsAPI();
    await initMap();
    fetchUserData();
  } catch (error) {
    console.error('Error initializing Google Maps:', error);
  }
});
