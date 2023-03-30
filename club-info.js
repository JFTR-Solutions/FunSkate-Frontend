function updateClubInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    document.getElementById("club-name").textContent = urlParams.get("name");
    document.getElementById("club-locationName").textContent = urlParams.get("locationName");
    document.getElementById("club-streetName").textContent = urlParams.get("streetName");
    document.getElementById("club-city").textContent = urlParams.get("city");
    document.getElementById("club-zipCode").textContent = urlParams.get("zipCode");
  }
  
  // Call updateClubInfo when the page loads
  updateClubInfo();
  
  function initMap() {
    const address = urlParams.get("address");
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === "OK") {
        const map = new google.maps.Map(document.getElementById("map"), {
          center: results[0].geometry.location,
          zoom: 15,
        });
        const marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
        });
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  }
  
  updateClubInfo();
  