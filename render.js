function eventIcon(type) {
    const icon = L.icon({
        iconUrl: 'icons/' + type + '.png',
        iconSize: [44, 44],
        className: 'event-marker'
    });
    return icon;
}

function renderOthers(data, rotation, layer) {

    if (Object.keys(layer._layers).length != 0) return true;
    
    console.log(data)
    const markers = [];
    let i = 0;
    for (const event of data.worldMap.OtherEvent) {
        if (event.Rotation == rotation || event.Rotation == 'ALL') {
            markers[i] = L.marker([event.PosY, event.PosX], {icon:eventIcon(event.GameMode)}).addTo(layer);
            markers[i]._icon.title = event.EventName;
        }
        i++;
    }

}

function renderRaces(data, rotation, layer, mapMode) {
    console.log('----->', mapMode)

    // if (Object.keys(layer._layers).length != 0) return true;
    if (Object.keys(layer._layers).length != 0) layer.clearLayers();

    layer.addTo(map);

    const markers = [];
    let i = 0;
    // console.log(data.teamsMap.MapRegion[0].MapEvent[0].WinPoints)
    // return 0;
    // for (let i = 0; i < data.teamsMap.MapRegion.length; i++) {
    //     let area = data.teamsMap.MapRegion;
    //     for (let x = 0; x < area.length; x++) {
    //             console.log(area[i].MapEvent[x])

    //     }
    //     // console.log(area[i].MapEvent)
    // }

    // let x = 0;
    // for (const region of data.worldMap.MapRegion) {
    //     let regionId = region.RegionId;
    //     // let x = 0;
    //     if (regionId == data.teamsMap.MapRegion[x].RegionId) {
            
    //         // console.log(eventId);
    //         let i = 0;
    //         // for (const event of data.worldMap.MapRegion[x].MapEvent) {
    //         for (const event of region.MapEvent) {
    //             if (event.Rotation == rotation) {
    //             let eventId = data.teamsMap.MapRegion[x].MapEvent[i].EventId;
    //             // if (eventId == event.EventId) {
    //                 // console.log(event.EventId)
    //                 // console.log(eventId)
    //                 console.log(event.EventId, data.teamsMap.MapRegion[x].MapEvent[i].WinPoints)
    //                 // console.log(data.worldMap.MapRegion[x].MapEvent[i].EventId, ":  ", event.WinPoints)
    //                 i++

    //             // }
    //         }}
    //     }
    //     x++
    // }
    // // console.log(x)

    // console.log(data.teamsInfo.ActiveTeams[0].EventStats[0])
    // for (const info of data.teamsInfo.ActiveTeams) {
    //     for (const eventInfo of info.EventStats) {
    //         console.log(eventInfo.EventId)

    //     }
    //     console.log(info)
    // }
    // return false
    // console.log(data.teamsInfo)

    let countPoints = 0;

    let x = 0;
    for (const region of data.worldMap.MapRegion) {
        let y = 0;
        for (const event of region.MapEvent) {
            if (mapMode == '1') {
                if (event.GameMode == 'SPRINT' || event.GameMode == 'CIRCUIT') {
                    const eventTeam1 = data.teamsMap.MapRegion[x].MapEvent[y];
                    countPoints += eventTeam1.WinPoints;
                }
            }

            if (event.Rotation == rotation) {
                
                if (mapMode == '1') {
                    if (event.GameMode == 'DRAG') continue;

                    const eventClassic = data.worldMap.MapRegion[x].MapEvent[y];
                    const eventTeam = data.teamsMap.MapRegion[x].MapEvent[y];
                    // console.log(eventTeam.WinPoints, eventClassic.Length);
                    
                    // console.log(eventTeam)

                    event.TeamOwner = eventTeam.TeamWinner;
                    event.WinPoints = eventTeam.WinPoints;
                    event.OwnerReward = eventTeam.OwnerReward;

                    const teamList = {};
                    for (const team of data.teamsInfo.ActiveTeams) {
                        for (const teamEvent of team.EventStats) {
                            // console.log(event.EventId)
                            if (teamEvent.EventId == event.EventId) {
                                // console.log(team)
                                // teamList[team.Name].Name = team.Name;
                                if (event.TeamOwner == team.Name) {
                                    event.TeamOwnerWins = teamEvent.Wins;
                                    // console.log('yees')
                                    continue;
                                }
                                teamList[team.Name] = teamEvent;
                                
                            }

                        }
                    }
                    // console.log(teamList['LSDTEAM'])

                    event.TeamList = teamList;
                    // console.log(teamList)
                    for (const x in teamList) {
                        console.log(teamList[x].EventId)
                    }
                }

                markers[i] = L.marker([event.PosY, event.PosX], {icon:eventIcon(event.GameMode), riseOnHover: true}).addTo(layer);
                
                markers[i].on('mouseover click', function(e) {

                    removePrevActiveMarker(markers);
                    createEventTooltip(event, mapMode);

                    eventTooltip.hidden = false;
                    this._icon.classList.add('event-marker-active');

                    setEventTooltipPosition(this._icon.getBoundingClientRect());

                    map.on('zoom move', () => {
                        if (this._icon != null) {
                            setEventTooltipPosition(this._icon.getBoundingClientRect());
                        }
                    });

                    // map.on('click', () => {
                    map.on('mousedown', () => {
                        eventTooltip.hidden = true;
                        if (this._icon != null) {
                            this._icon.classList.remove('event-marker-active');
                        }
                    });

                    eventTooltip.onclick = function(e) {
                        // console.log(e.target)
                        markers.forEach(e => {
                            if (e._icon != null) {
                                e._icon.classList.remove('event-marker-active');
                            }
                        });
                        this.hidden = true;
                    }

                });

                markers[i].on('mouseout', function(e) {
                    markers.forEach(e => {
                        if (e != this) {
                            e._icon.classList.remove('event-marker-active');
                        }
                    });
                });
                i++;
            }
            y++;
        }
        x++;
    }
    console.log("count",countPoints)
    return true;
}



function renderRegionName(data) {
    for (let region of data.RegionName) {
        const divIcon = L.divIcon({
            className: 'region-name',
            html: `<pre>${region.RegionName.toUpperCase()}</pre>`,
            iconSize: [100, 40]
        });
        // console.log(region.RegionName, region.PosX, region.PosY)
        L.marker([region.PosY, region.PosX], {icon: divIcon}).addTo(layerRegionName);
    }
    layerRegionName.addTo(map);
}

function teamLogo(logoName) {
    const icon = L.icon({
        iconUrl: 'logos/'+ logoName +'.png',
        iconSize: [43, 43],
        className: 'team-logo-marker'
    });
    return icon;
}

function renderTeamLogos(poins) {
    let markers = [];
    let i = 0;
    for (const area in poins) {
        for (const region of poins[area]) {
            let logo = 'Bushido';
            if (i > 5) logo = 'StackedDeck';
            if (i > 8) logo = '21stStreetCrew';
            if (i > 12) logo = 'BlackHearts';
            if (i > 15) logo = 'Rotor4';
            if (i > 20) logo = 'Scorpios';
            if (i > 24) logo = 'Kings';
            if (i > 27) logo = 'raven';
            if (i > 32) logo = 'TFK';

            markers[i] = L.marker(region.center, {icon:teamLogo(logo)});
            markers[i].addTo(layerTeamLogos);
            markers[i].setOpacity(.9)
            markers[i].setZIndexOffset(1000);
            i++;
        }
    }
}

// map.setZoomAround([478, 4185], 0.4)
// map.panTo()
const regionName = document.getElementById('region-name')
function renderRegions(poins, data) {

    const arr = ["url(textures/tfk.png)", "url(textures/bs.png)", "url(textures/bs.png)"]
    let i = 0;
    const polygons = [];

    // console.log("data",data.MapRegion[0].MapEvent)

    for (const region of data.MapRegion) {
        // for (const event of region.MapEvent) {
        //     console.log(event.EventName)
        // }
        // console.log(region.RegionId)
    }
    // console.log(data.MapRegion[0])

    const canvas = L.canvas({padding:2});

    for (const area in poins) {
        for (const region of poins[area]) {

            // polygons[i] = L.polygon(region.latlngs, {color: "#111", fill: "url(textures/21s.png)", fillOpacity: .8, weight:2.5, className: "polygon"}).addTo(layerRegions);
            let fillColor = 'green';
            if (i > 5) fillColor = 'red';
            if (i > 8) fillColor = 'teal';
            if (i > 12) fillColor = 'gold';
            if (i > 15) fillColor = 'red';
            if (i > 20) fillColor = 'teal';
            if (i > 24) fillColor = '#222';
            if (i > 27) fillColor = 'silver';
            if (i > 32) fillColor = 'blue';

            polygons[i] = L.polygon(region.latlngs, {renderer:canvas, fillColor:fillColor, color: "#111", fillOpacity: .4, weight: 1.5, className: "polygon"}).addTo(layerRegions);

            polygons[i].id = region.id;
            // console.log(region.id)
            // console.log("<",data.MapRegion[0].RegionId)


            // console.log(data.MapRegion[i].RegionName)

            polygons[i].on('mouseover', function(e) {



                console.log(this.id)
                console.log(data.MapRegion[i].RegionId)
                
                // console.log(e.containerPoint)
                // console.log(map._container.clientWidth)
                let isActive = localStorage.getItem('WE_regionsActive');
                // console.log(isActive)

                if (isActive == '1') {

                    for (let i = 0; i < data.MapRegion.length; i++) {
                        if (this.id == data.MapRegion[i].RegionId) {
                            regionName.innerText = data.MapRegion[i].RegionName;
                        }
                    }
                    

                    setRegionTooltipPosition(e.containerPoint.x);
                    this.bringToFront();
                    this.setStyle({ color: "white"});
                    // console.log(this.getCenter())

                    if (toggleRaces.checked) {

                        // получение маркеров через слой
                        // Array.from(Object.keys(layerRaces._layers), e => {
                        //     layerRaces._layers[e]._icon.style.pointerEvents = 'none';
                        // });

                        let markers = document.getElementsByClassName('event-marker');
                        Array.from(markers, e => {
                            e.style.pointerEvents = 'none';
                        });
                    }

                    if (toggleTeamLogos.checked) {
                        let markers = document.getElementsByClassName('team-logo-marker');
                        Array.from(markers, e => {
                            e.style.pointerEvents = 'none';
                        });
                    }

                }
                if (isActive == '0') {

                    if (toggleRaces.checked) {
                        
                        // Array.from(Object.keys(layerRaces._layers), e => {
                        //     layerRaces._layers[e]._icon.style.pointerEvents = 'auto';
                        // })

                        let markers = document.getElementsByClassName('event-marker');
                        Array.from(markers, e => {
                            e.style.pointerEvents = 'auto';
                        });
                    }
                    // return true;
                    // this.setStyle({ bubblingMouseEvents: false })
                }

            });

            polygons[i].on('mouseout', function() {
                this.setStyle({color: "#111"});
                regionTooltip.hidden = true;
            });

            i++;
        }
        console.log(i)
    }
    // polygon = L.polygon(poins.silverton.latlngs, {color: "white", fill:"url(TTR/textures/un.png)", weight:1, fillOpacity:.4}).addTo(map);
}


