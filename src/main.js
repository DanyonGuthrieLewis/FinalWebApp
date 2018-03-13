
var convert = require('xml-js');

let UserToken = "USDJJBR08KN";
let RouteID = 750;
let OnwardCalls = false;

let name = 'World';

let utaApiUrl = 'https://h0ibin383f.execute-api.us-east-2.amazonaws.com/alpha/' //Definetly m

let getData = (url, data) => {
    return fetch(url, {
        body: JSON.stringify(data),
        cache: 'no-cache',
        headers: {
        'content-type': 'application/json'
        },
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        referrer: 'no-referrer',
    })
    .then(response => response.json())
}

let update = () => {
    let routeNumber = document.getElementById('route_select').value;
    
    getData(utaApiUrl, {route: routeNumber})
    .then(data => {
        let traxCars = convert.xml2js(data.route).elements[0].elements[1].elements[2];
        let locations = "";
        console.log("Getting trains on", routeNumber);
        if (window.hasInit) {
            console.log("Updating positions");
            for(let i = 1; i < traxCars.elements.length; i++) {
                console.log("Updating marker", i);
                let location = traxCars.elements[i].elements[7];
                let latitude = parseFloat(location.elements[1].elements[0].text);
                let longitude = parseFloat(location.elements[0].elements[0].text);
                window.marker_pool[i - 1].setPosition(new google.maps.LatLng(latitude, longitude)); 
            }
        } else {
            console.log("Creating new markers");
            if (window.marker_pool) {
                for(let i = 0; i < window.marker_pool.length; i++) {
                    window.marker_pool[i].setMap(null);
                }
            }
            
            window.marker_pool = [];
            
            for(let i = 1; i < traxCars.elements.length; i++) {
                let location = traxCars.elements[i].elements[7];
                let latitude = parseFloat(location.elements[1].elements[0].text);
                let longitude = parseFloat(location.elements[0].elements[0].text);
                window.marker_pool[i - 1] = new google.maps.Marker({
                    position: new google.maps.LatLng(latitude, longitude),
                });
                window.marker_pool[i - 1].setMap(window.map);
                locations += "lat: " + latitude + ", lng: " + longitude + "\n";
            }

            console.log(locations);

            window.hasInit = true;
        }
    }) 
    .catch(error => {
        console.error(error);
        console.log(window.marker_pool);
    })
        

    
}

window.initMap = () => {
    window.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: {lat: 40.6669, lng: -111.8880}
    });
    
    update();
    setInterval(update, 5000);
}

window.changeRoute = () => {
    window.hasInit = false;

    //update();
}