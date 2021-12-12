function createEventTooltip(event, mapMode) {

    let contain = '';

    if (mapMode == '0') {

        eventTooltip.classList.remove('team-event-tooltip');
        eventTooltip.classList.add('classic-event-tooltip');

        contain = `
            <img id='event-class-img' src="class_icon/${ event.CarClass }.png" width="23px">
            <div id="event-marquee-block">
                <span id='event-name'>${ event.EventName }</span>
            </div>
            <img id='event-track-img' src="https://world-evolved.ru/content/tracks/${ event.EventId }.png" onerror="this.src = 'https://world-evolved.ru/content/tracks/onError.png'" width="100px">
            <div id='event-info'>
                <div>${ event.GameMode.charAt(0).toUpperCase() + event.GameMode.slice(1) }</div>
                <div>${ event.Length }KMS</div>
                <div>Laps ${ event.Laps }</div>
            </div>
            <div id='event-leaderboard' onclick='window.open("https://world-evolved.ru/stats/races/${ event.EventId }", "_blank");'>LEADERBOARD</div>
        `;
        eventTooltip.style.height = '158px';
    }

    if (mapMode == '1') {
        eventTooltip.classList.add('team-event-tooltip');
        eventTooltip.classList.remove('classic-event-tooltip');

        // let teamListBlock = '';
        // for (let i = 0; i < 10; i++) {
        //     teamListBlock += `
        //         <div class='event-team-list'>
        //             <img class="event-team-logo" src="logos/Rotor4.png" width="26px">
        //             <div class="event-team-name">Rotor4</div>
        //             <div class="event-team-count-wins">${ i }</div>
        //         </div>
        //     `;
        // }

        if (event.TeamOwner == '' ) event.TeamOwner = 'NEUTRAL';

        let teamListBlock = '';

        if (Object.keys(event.TeamList).length != 0) {
            for (const team in event.TeamList) {
                teamListBlock += `
                    <div class='event-team-list'>
                        <img class="event-team-logo" src="logos/Rotor4.png" width="26px">
                        <div class="event-team-name">${ team }</div>
                        <div class="event-team-count-wins">${ event.TeamList[team].Wins }</div>
                    </div>
                `;
            }
        }
        else {
            teamListBlock = `<div style='text-align:center; color:red'>No activity</div>`;
            // console.log('hide')
        }

        if (event.TeamOwner != 'NEUTRAL') {
           contain = `
                <img id='event-class-img' src="class_icon/${ event.CarClass }.png" width="23px">
                <div id="event-marquee-block">
                    <span id='event-name'>${ event.EventName }</span>
                </div>
                <img id='event-track-img' onerror="this.src = 'https://world-evolved.ru/content/tracks/onError.png'" src="https://world-evolved.ru/content/tracks/${ event.EventId }.png" width="100px">
                <div id='event-info'>
                    <div>${ event.GameMode.charAt(0).toUpperCase() + event.GameMode.slice(1) }</div>
                    <div>${ event.Length }KMS</div>
                    <div>Laps ${ event.Laps }</div>
                </div>

                <div id='event-owner-block'>
                    <img id='event-owner-logo' src="logos/${ event.TeamOwner }.png" width="42px">
                    <div id="event-owner-name">${ event.TeamOwner }</div>
                    <div id="event-owner-info">
                        <div id="event-owner-count-wins">${ event.TeamOwnerWins }</div>
                        <div id="event-owner-points">${ event.WinPoints }</div>
                        <div id="event-owner-rewards">+${ event.OwnerReward.toFixed(2) }</div>
                    </div>
                </div>
                <div id='event-team-list-block'>${ teamListBlock }</div>
            `;
            eventTooltip.style.height = '308px';
        }
        else {
            contain = `
                <img id='event-class-img' src="class_icon/${ event.CarClass }.png" width="23px">
                <div id="event-marquee-block">
                    <span id='event-name'>${ event.EventName }</span>
                </div>
                <img id='event-track-img' onerror="this.src = 'https://world-evolved.ru/content/tracks/onError.png'" src="https://world-evolved.ru/content/tracks/${ event.EventId }.png" width="100px">
                <div id='event-info'>
                    <div>${ event.GameMode.charAt(0).toUpperCase() + event.GameMode.slice(1) }</div>
                    <div>${ event.Length }KMS</div>
                    <div>Laps ${ event.Laps }</div>
                </div>

                <div style='text-align:center;font-size:20px; color:#999'>No activity</div>
            `;
            eventTooltip.style.height = '170px';
        }
        
    }

    eventTooltip.innerHTML = contain;

    const eventName = document.getElementById('event-name');
    const marqueeWidth = mapMode == '0' ? 168 : 182;

    if (eventName.offsetWidth > marqueeWidth) {
        eventName.classList.add('marquee');
    }
    else {
        eventName.classList.remove('marquee');
    }
}



function setEventTooltipPosition(markerPosition) {

    const markerLeft = markerPosition.left;
    const markerTop = markerPosition.top;
    const mapWidth = map._container.clientWidth;
    const mapHeight = map._container.clientHeight;
    const tooltipWidth = eventTooltip.offsetWidth;
    const tooltipHeight = eventTooltip.offsetHeight;
    
    if (markerLeft > (mapWidth - tooltipWidth) - 60) {
        eventTooltip.style.left = markerLeft - (tooltipWidth - 32) - 38 + 'px';
    }
    else {
        eventTooltip.style.left = markerLeft + 54 + 'px';
    }

    if ((markerTop + tooltipHeight) > mapHeight) {
        eventTooltip.style.top = (mapHeight - tooltipHeight) + (- 6) + 'px';
    }
    else {
        eventTooltip.style.top = markerTop + 'px';
    }
}

function setRegionTooltipPosition(regionPosition) {
    regionTooltip.hidden = false;
    const mapWidth = map._container.clientWidth;
    const tooltipWidth = regionTooltip.offsetWidth;

    if (regionPosition > (mapWidth / 2)) {
        regionTooltip.style.left = 150 + 'px';
    }
    else {
        regionTooltip.style.left = (mapWidth) - (tooltipWidth + 150) + 'px';
    }
    
}

function hideEventTooltip() {
    eventTooltip.hidden = true;
    let elems = document.querySelectorAll('.event-marker');
    for (let i = 0; i < elems.length; i++) {
        elems[i].classList.remove('event-marker-active');
    }
}

function removePrevActiveMarker(markers) {
    for (let i = 0; i < markers.length; i++) {
        markers[i]._icon.classList.remove('event-marker-active');
    }
}

