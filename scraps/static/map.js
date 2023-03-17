function initMap() {
  var mapOptions = {
      zoom: 10,
      center: {lat: 52.5200, lng: 13.4050}
  };

  var map = new google.maps.Map(document.getElementById('map'), mapOptions);

  // Create a search box and link it to the search input field
  var input = document.getElementById('search-input');
  var searchBox = new google.maps.places.SearchBox(input);

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
}

  // Attach initMap to the window object
  window.initMap = initMap;

  function loadGoogleMapsAPI() {
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCd6qgYy2GvHr1zhkmQIcORpRU1ztngtWA&libraries=places&callback=initMap';
    script.async = true;
    document.head.appendChild(script);
}

// Call the loadGoogleMapsAPI function when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    loadGoogleMapsAPI();
});