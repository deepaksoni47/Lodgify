

document.addEventListener("DOMContentLoaded", function () {
    if (!listingData || !listingData.lat || !listingData.lng) {
        console.error("Listing data is missing!");
        return;
    }

    var map = L.map('map').setView([listingData.lat, listingData.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([listingData.lat, listingData.lng])
        .addTo(map)
        .bindPopup("<b>" + listingData.title + "</b><br>" + listingData.location)
        .openPopup();

    var circle = L.circle([listingData.lat, listingData.lng], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 300
    }).addTo(map);
});


// var map = L.map('map').setView([51.505, -0.09], 13);
//     L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//     }).addTo(map);
//     var marker = L.marker([51.5, -0.09]).addTo(map);