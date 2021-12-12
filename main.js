let mapMode = localStorage.getItem('WE_mapMode');
let currentRotation = localStorage.getItem('WE_rotation');

const playerLayers = L.layerGroup();
const layerRaces = L.layerGroup();
const layerOthers = L.layerGroup();
const layerRegionName = L.layerGroup();
const layerRegions = L.layerGroup();
const layerTeamLogos = L.layerGroup();

const bounds = [[-1900, 50], [4200, 11200]];
const map = L.map('map', {
    crs: L.CRS.Simple,
    maxBounds: bounds,
    maxBoundsViscosity: 1,
    // preferCanvas : true,
    // maxZoom: -0.60,
    maxZoom: -1.2,
    minZoom: -2.8,
    zoomDelta: 0.5,
    zoomSnap: 0.5,
    doubleClickZoom: false,
    zoomControl: false
});
map.fitBounds(bounds);

L.control.zoom({ position: 'topleft' }).addTo(map);

L.imageOverlay('background.png', bounds).addTo(map);
const bgs = L.imageOverlay('done11.png', bounds).addTo(map).setZIndex(1000);
bgs._image.classList.add('bgs');

// bgs._image.style.filter ='saturate(550%) brightness(50%)'

const mapModeBlock = document.querySelectorAll('#map-mode-block input[type=radio]');
const teamRacesInfoBlock = document.getElementById('team-races-info-block');
// const teamRacesInfoBlockBlock = document.getElementById('team-races-info-block');
const teamRacesStat = document.getElementById('team-races-stat');
const showStat = document.getElementById('show-stat');
const showStatLabel = document.getElementById('show-stat-label');


const rotationSelector = document.getElementsByClassName('rotation-selector');

const togglePlayers = document.getElementById('toggle-players');
const toggleRaces = document.getElementById('toggle-races');
const toggleOthers = document.getElementById('toggle-others');
const toggleMarkers = document.getElementsByClassName('toggle');
const toggleRegions = document.getElementById('toggle-regions');
const toggleRegionsActive = document.getElementById('toggle-regions-active');
const toggleTeamLogos = document.getElementById('toggle-team-logos');

const teamRacesListOptions = document.getElementById('team-races-list-options');
const freeroamListOptions = document.getElementById('freeroam-list-options');

const control = document.getElementsByClassName('control');

const eventTooltip = document.getElementById('event-tooltip');
const regionTooltip = document.getElementById('region-tooltip');

const listPlayersBlock = document.getElementById('list-players-block');

Array.from(control, e => e.oninput = hideEventTooltip);
listPlayersBlock.onclick = hideEventTooltip;


if (!localStorage.getItem('WE_mapMode')) {
    localStorage.setItem('WE_mapMode', '0'); // default
    mapMode = '0';
}

if (localStorage.getItem('WE_mapMode') == '0') {
    mapModeBlock[0].checked = true;
    runFreeroamMode();
    mapMode = '0';
}

if (localStorage.getItem('WE_mapMode') == '1') {
    mapModeBlock[1].checked = true;
    runTeamRaceMode();
    mapMode = '1';
}

mapModeBlock[0].checked ? mapMode = '0' : mapMode = '1';

for (let i = 0; i < mapModeBlock.length; i++) {

    mapModeBlock[i].onclick = function() {
        if (this.checked && i == 0) {
            mapMode = '0'; 
            runFreeroamMode();
            localStorage.setItem('WE_mapMode', mapMode);
        }
        if (this.checked && i == 1) {
            mapMode = '1'; 
            runTeamRaceMode();
            localStorage.setItem('WE_mapMode', mapMode);
        }
    }
};

showStat.onclick = function() {
            
    if (this.checked) {
        showStatLabel.innerText = 'Hide Stats';
        teamRacesStat.style.transform = 'translateY(0)';
    }
    else {
        showStatLabel.innerText = 'Show Stats';
        teamRacesStat.style.transform = 'translateY(-'+ teamRacesStat.clientHeight +'px)';
    }
}


toggleRaces.onclick = function() {
    let currentRotation = localStorage.getItem('WE_rotation');
    if (this.checked) {
        layerRaces.addTo(map);
        getLoadedData('worldMap.json', renderRaces, currentRotation, layerRaces, mapMode);
    }
    else {
        layerRaces.removeFrom(map);
    }
}
toggleOthers.onclick = function() {
    let currentRotation = localStorage.getItem('WE_rotation');
    if (this.checked) {
        layerOthers.addTo(map);
        getLoadedData('otherData.json', renderOthers, currentRotation, layerOthers, mapMode);
    }
    else {
        layerOthers.clearLayers();
    }
}

toggleRegions.onclick = function() { 
    this.checked ? layerRegions.addTo(map) : layerRegions.removeFrom(map);
    if (!this.checked) {
        if (toggleRaces.checked) {
            Array.from(Object.keys(layerRaces._layers), e => {
                layerRaces._layers[e]._icon.style.pointerEvents = 'auto';
            });
        }
    }
};

const isActive = toggleRegionsActive.checked ? '1' : '0';
localStorage.setItem('WE_regionsActive', isActive);

toggleRegionsActive.onclick = function() {
    const isActive = this.checked ? '1' : '0';
    localStorage.setItem('WE_regionsActive', isActive);
}

toggleTeamLogos.onclick = function() {
    if (this.checked) {
        layerTeamLogos.addTo(map);
    }
    else {
        layerTeamLogos.removeFrom(map);
    }
}






for (let i = 0; i < rotationSelector.length; i++) {
    rotationSelector[i].onclick = function() {
        currentRotation = i + 1;
        if (this.checked) {
            localStorage.setItem('WE_rotation', currentRotation);

            layerRaces.clearLayers();
            // layerRaces.removeFrom(map)
            layerOthers.clearLayers();

            if (mapMode == '0') {
                if (toggleRaces.checked) {
                    getLoadedData('worldMap.json', renderRaces, currentRotation, layerRaces, mapMode);
                }
                if (toggleOthers.checked) {
                    getLoadedData('otherData.json', renderOthers, currentRotation, layerOthers, mapMode);
                }
            }
            if (mapMode == '1') {
                if (toggleRaces.checked) {
                    getLoadedData('worldMap.json', renderRaces, currentRotation, layerRaces, mapMode);
                }
            } 
        }
    }
};

function onMapClick(e) {
    console.log(`Coor: ${ Math.ceil(e.latlng.lat) }, ${ Math.ceil(e.latlng.lng) }`);
}
map.on('click', onMapClick);




function runFreeroamMode() {
    teamRacesInfoBlock.style.display = 'none';
    // showStat.style.display = 'none';
    teamRacesStat.style.transform = 'translateY(-'+ teamRacesStat.clientHeight +'px)';

    map.options.minZoom = -2.8;
    map.setZoom(-2.8);

    loadJSON('worldMap.json')
    .then((response) => {

        let currentRotation = response.CurrentRotation;

        localStorage.setItem('WE_rotation', currentRotation);
        
        rotationSelector[currentRotation -1].checked = true;

        console.log('>',currentRotation)
        if (toggleRaces.checked) {
            // layerRaces.addTo(map);
            getLoadedData('worldMap.json', renderRaces, currentRotation, layerRaces, mapMode='0');
        }

        if (toggleOthers.checked) {
            // layerOthers.addTo(map);
            getLoadedData('otherData.json', renderOthers, currentRotation, layerOthers, mapMode='0');
        }

        layerRegions.removeFrom(map);
        layerTeamLogos.removeFrom(map);

        if (toggleOthers.checked) {
            layerOthers.addTo(map);
        }

        teamRacesListOptions.hidden = true;
        freeroamListOptions.hidden = false;
    })


}
// console.log(map.invalidateSize())
let defSize = map._size.x;

// console.log(defSize/100*75)
// console.log(defSize/4*3)
const stat = document.getElementById('stat');

// show.oninput = function() {


//     if (this.checked) {
//         setTimeout(()=> {
//             map._size.x = defSize - stat.offsetWidth;
//             map._container.style.width = defSize - stat.offsetWidth + 'px';
//         },200)
        
//         listPlayersBlock.style.right = stat.offsetWidth + 10 + 'px';
//         stat.style.transform = 'translateX(0px)';
//     }
//     else {
//         stat.style.transform = `translateX(${ stat.offsetWidth }px)`;
//         map._size.x = defSize;
//         map._container.style.width = defSize + 'px';
//         // setTimeout(function(){map.invalidateSize(true);},500);
//         // map.redraw()
//         document.body.style.width = defSize + 'px';
//         listPlayersBlock.style.right = '10px'
//     }
//     // map.invalidateSize()._size.x = 900;

// }
// map._size.x



function runTeamRaceMode() {
    teamRacesInfoBlock.style.display = 'block';
    // showStat.style.display = 'block';

    if (showStat.checked) {
        showStatLabel.innerText = 'Hide Stats';
        teamRacesStat.style.transform = 'translateY(0)';
    }
    else {
        showStatLabel.innerText = 'Show Stats';
        teamRacesStat.style.transform = 'translateY(-'+ teamRacesStat.clientHeight +'px)';
    }
    

    map.options.minZoom = -3.2555555;
    map.setZoom(-2.6);

    loadJSON('worldMap.json')
    .then((response) => {

        let currentRotation = response.CurrentRotation;

        localStorage.setItem('WE_rotation', currentRotation);
        
        rotationSelector[currentRotation -1].checked = true;

        if (toggleRaces.checked) {
            // layerRaces.addTo(map);
            getLoadedData('worldMap.json', renderRaces, currentRotation, layerRaces, mapMode='1');
        }

        layerOthers.removeFrom(map);


        if (toggleRegions.checked) {
            layerRegions.addTo(map);
        }

        if (toggleTeamLogos.checked) {
            layerTeamLogos.addTo(map);
        }

        teamRacesListOptions.hidden = false;
        freeroamListOptions.hidden = true;
    });

}

loadJSON('otherData.json')
.then((data) => renderRegionName(data))
.catch((error) => console.log(error));

loadJSON('regionPoints.json')
.then((data) => renderTeamLogos(data))
.catch((error) => console.log(error));

// loadJSON('regionPoints.json')
// .then((data) => renderRegions(data))
// .catch((error) => console.log(error));

loadJSON('regionPoints.json')
    .then((points) => {
        loadJSON('teamsMap.json')
            .then((data) => renderRegions(points, data))
            .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));

function getLoadedData(src, render, rotation, layer, mapMode) {

    if (mapMode == '0') {
        const data = {};
        loadJSON(src)
            .then((response) => {
                data.worldMap = response;
                render(data, rotation, layer, mapMode);
            })
            .catch((error) => console.log(error));
    }

    if (mapMode == '1') {
        const data = {};
        loadJSON(src)
            .then((response) => data.worldMap = response)
            .catch((error) => console.log(error));
        loadJSON('teamsMap.json')
            .then((response) => data.teamsMap = response)
            .catch((error) => console.log(error));
        loadJSON('teamsInfo.json')
            .then((response) => {
                data.teamsInfo = response;
                render(data, rotation, layer, mapMode);
            })
            .catch((error) => console.log(error));
    }
}

async function loadJSON(src) {
    let key = 'WE_' + src;

    if (localStorage.getItem(key)) {
        const storageData = JSON.parse(localStorage.getItem(key));
        console.log(key, 'from Storage!');
        return storageData;
    }

    const response = await fetch(src);
    const data = await response.json();

    const toString = JSON.stringify(data);
    localStorage.setItem(key, toString);

    if (response.ok) {
        console.log('Success load!');
    }
    else {
        throw new Error(`HTTP error! status: ${ response.status }`);
    }
    return data;
}


map.on('zoom', () => {
    const markers = document.getElementsByClassName('region-name');
    for (let i = 0; i < markers.length; i++) {
        if (map._zoom < -3) {
            markers[i].style.opacity = '0';
        }
        else {
            markers[i].style.opacity = '0.7';
        }
    }
});
//------------------------------------------------------------------------------

playerTest()
function playerTest() {
    const playerIcon = L.icon({
        iconUrl: 'icons/arrow.png',
        iconSize: [20, 20],
        tooltipAnchor: [8, 0],
        className: 'player-marker'
    });

    const convAngle = angle => (-angle + 450) % 360;

    const players = [ 
        {
            "name": "PLAYER1",
            "y": 1686,
            "x": 5748,
            "rotation": 90
        },
        {
            "name": "PLAYER2",
            "y": 1912,
            "x": 5528,
            "rotation": 110
        },
        {
            "name": "PLAYER3",
            "y": 3058,
            "x": 5426,
            "rotation": -20
        },
        {
            "name": "PLAYER4",
            "y": 1338,
            "x": 4367,
            "rotation": -20
        }
    ]

    function renderPlayers() {

        const countPlayers = document.getElementById('count-players').children[0];

        const markers = [];
        const list = document.getElementsByClassName('entry');
        let count = 0;
        for (const player of players) {
            markers[player.name] = L.marker([player.y, player.x], {icon: playerIcon, rotationAngle: convAngle(player.rotation), rotationOrigin: 'center'}).addTo(playerLayers);
            markers[player.name].bindTooltip(player.name);

            Array.from(list, function(e) {
                // player.name = e.innerText
                e.onclick = () => {
                        map.flyTo(markers[e.innerText].getLatLng());
                        markers[e.innerText].openTooltip();
                        console.log(e.innerText);
                }
            });
            count++;
        }

        countPlayers.innerHTML = `<b>${ count }</b>`

        let angl = 4752;
        let rot = 90;
        let isZoom = false;
        setInterval(() => {
            // pl.setLatLng([3385, angl]);
            
            if (!isZoom)
                markers["PLAYER2"].setRotationAngle(rot);
            
            // hiding the drifting when zooming
            map.on('zoomstart', () => isZoom = true);
            map.on('zoomend', () => isZoom = false);

            angl = angl + 1;
            if (rot >= 360)
                rot = 0;
            rot = rot + 1;

        }, 30);

        return true;
    }
    // flag for calling the function once
    let isRenderedPlayers = togglePlayers.checked ? renderPlayers() : false;

    // console.log(isRenderedPlayers);

    if (togglePlayers.checked) {
        playerLayers.addTo(map);
        listPlayersBlock.hidden = false;
    }
    else {
        listPlayersBlock.hidden = true;
    }

    togglePlayers.onclick = function() {
        isRenderedPlayers ? null : renderPlayers(); isRenderedPlayers = true;
        if (this.checked) {
            playerLayers.addTo(map);                
            listPlayersBlock.hidden = false;
        }
        else {
            playerLayers.removeFrom(map);
            listPlayersBlock.hidden = true;
        }
    }
}