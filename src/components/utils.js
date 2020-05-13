export const populateDeviceList = (elementId, genericName, devices, additionalOptions) => {
    const list = document.getElementById(elementId)
    while (list.firstElementChild) {
        list.removeChild(list.firstElementChild);
    }
    for (let i = 0; i < devices.length; i++) {
        const option = document.createElement('option');
        list.appendChild(option);
        option.text = devices[i].label || `${genericName} ${i + 1}`;
        option.value = devices[i].deviceId;
    }
    if (additionalOptions.length > 0) {
        const separator = document.createElement('option');
        separator.disabled = true;
        separator.text = '──────────';
        list.appendChild(separator);
        for (const additionalOption of additionalOptions) {
            const option = document.createElement('option');
            list.appendChild(option);
            option.text = additionalOption;
            option.value = additionalOption;
        }
    }
    if (!list.firstElementChild) {
        const option = document.createElement('option');
        option.text = 'Device selection unavailable';
        list.appendChild(option);
    }
}

export const populateInMeetingDeviceList = (elementId, genericName, devices, additionalOptions, callback) => {
    const menu = document.getElementById(elementId)
    while (menu.firstElementChild) {
        menu.removeChild(menu.firstElementChild)
    }
    for (let i = 0; i < devices.length; i++) {
        createDropdownMenuItem(menu, devices[i].label || `${genericName} ${i + 1}`, () => {
            callback(devices[i].deviceId);
        })
    }
    if (additionalOptions.length > 0) {
        createDropdownMenuItem(menu, '──────────', () => { }).classList.add('text-center');
        for (const additionalOption of additionalOptions) {
            createDropdownMenuItem(
                menu,
                additionalOption,
                () => {
                    callback(additionalOption);
                },
                `${elementId}-${additionalOption.replace(/\s/g, '-')}`
            );
        }
    }
    if (!menu.firstElementChild) {
        createDropdownMenuItem(menu, 'Device selection unavailable', () => { });
    }
}

const createDropdownMenuItem = (menu, title, clickHandler, id) => {
    const button = document.createElement('button')
    menu.appendChild(button)
    button.innerHTML = title
    button.classList.add('dropdown-item')
    if (id !== undefined) { button.id = id }
    button.addEventListener('click', () => {
        clickHandler()
    })
    return button
}

export const updateRoster = (roster) => {
    let rosterText = '';
    for (const attendeeId in roster) {
        rosterText +=
            '<li class="list-group-item d-flex justify-content-between align-items-center">';
        rosterText += roster[attendeeId].name;
        let score = roster[attendeeId].score;
        if (!score) {
            score = 0;
        }
        score = Math.floor(score * 100);
        if (score) {
            rosterText += ` (${score})`
        }
        rosterText += '<span class="badge badge-pill ';
        let status = '';
        if (roster[attendeeId].signalStrength < 1) {
            status = '&nbsp;';
            rosterText += 'badge-warning';
        } else if (roster[attendeeId].signalStrength === 0) {
            status = '&nbsp;';
            rosterText += 'badge-danger';
        } else if (roster[attendeeId].muted) {
            status = 'MUTED';
            rosterText += 'badge-secondary';
        } else if (roster[attendeeId].active) {
            status = 'SPEAKING';
            rosterText += 'badge-success';
        } else if (roster[attendeeId].volume > 0) {
            status = '&nbsp;';
            rosterText += 'badge-success';
        }
        rosterText += `">${status}</span></li>`;
    }
    const rosterElem = document.getElementById('roster');
    if (rosterElem.innerHTML !== rosterText) {
        rosterElem.innerHTML = rosterText;
    }
}

export const tileIdForAttendeeId = (attendeeId, audioVideo) => {
    for (const tile of audioVideo.getAllVideoTiles()) {
        const state = tile.state()
        if (state.boundAttendeeId === attendeeId) {
            return state.tileId
        }
    }
    return null
}

export const getVisibleTileIndices = () => {
    let tiles = []
    const screenViewTileIndex = 17
    for (let tileIndex = 0; tileIndex <= screenViewTileIndex; tileIndex++) {
        const tileElement = document.getElementById(`tile-${tileIndex}`)
        if (tileElement.style.display === 'block') {
            if (tileIndex === screenViewTileIndex) {
                // Hide videos when viewing screen
                for (const tile of tiles) {
                    const tileToSuppress = document.getElementById(`tile-${tile}`)
                    tileToSuppress.style.visibility = 'hidden';
                }
                tiles = [screenViewTileIndex];
            } else {
                tiles.push(tileIndex);
            }
        }
    }
    return tiles
}

export const getActiveTileId = (roster, audioVideo) => {
    for (const attendeeId in roster) {
        if (roster[attendeeId].active) {
            return tileIdForAttendeeId(attendeeId, audioVideo);
        }
    }
    return null;
}

export const hideTile = (tileIndex, layoutVideoTiles) => {
    const tileElement = document.getElementById(`tile-${tileIndex}`);
    tileElement.style.display = 'none';
    layoutVideoTiles();
}

const updateTilePlacement = (tileIndex, x, y, w, h) => {
    const tile = document.getElementById(`tile-${tileIndex}`)
    const insetWidthSize = 4;
    const insetHeightSize = insetWidthSize / (16 / 9);
    tile.style.position = 'absolute';
    tile.style.left = `${x + insetWidthSize}px`;
    tile.style.top = `${y + insetHeightSize}px`;
    tile.style.width = `${w - insetWidthSize * 2}px`;
    tile.style.height = `${h - insetHeightSize * 2}px`;
    tile.style.margin = '0';
    tile.style.padding = '0';
    tile.style.visibility = 'visible';
    const video = document.getElementById(`video-${tileIndex}`)
    if (video) {
        video.style.position = 'absolute';
        video.style.left = '0';
        video.style.top = '0';
        video.style.width = `${w}px`;
        video.style.height = `${h}px`;
        video.style.margin = '0';
        video.style.padding = '0';
        video.style.borderRadius = '8px';
    }
    const nameplate = document.getElementById(`nameplate-${tileIndex}`)
    const nameplateSize = 24;
    const nameplatePadding = 10;
    nameplate.style.position = 'absolute';
    nameplate.style.left = '0px';
    nameplate.style.top = `${h - nameplateSize - nameplatePadding}px`;
    nameplate.style.height = `${nameplateSize}px`;
    nameplate.style.width = `${w}px`;
    nameplate.style.margin = '0';
    nameplate.style.padding = '0';
    nameplate.style.paddingLeft = `${nameplatePadding}px`;
    nameplate.style.color = '#fff';
    nameplate.style.backgroundColor = 'rgba(0,0,0,0)';
    nameplate.style.textShadow = '0px 0px 5px black';
    nameplate.style.letterSpacing = '0.1em';
    nameplate.style.fontSize = `${nameplateSize - 6}px`;

    let button = document.getElementById(`video-pause-${tileIndex}`)

    if (button) {
        button.style.position = 'absolute';
        button.style.display = 'inline-block';
        button.style.right = '0px';
        // button.style.top = `${h - nameplateSize - nameplatePadding}px`;
        button.style.height = `${nameplateSize}px`;
        // button.style.width = `${w}px`;
        button.style.margin = '0';
        button.style.padding = '0';
        button.style.paddingLeft = `${nameplatePadding}px`;
        button.style.color = '#fff';
        button.style.backgroundColor = 'rgba(0,0,0,0)';
        button.style.textShadow = '0px 0px 5px black';
        button.style.letterSpacing = '0.1em';
        button.style.fontSize = `${nameplateSize - 6}px`;
    }

    button = document.getElementById(`video-resume-${tileIndex}`)

    if (button) {
        button.style.position = 'absolute';
        button.style.left = '0px';
        button.style.top = '0px';
        button.style.height = `${nameplateSize}px`;
        // button.style.width = `${w}px`;
        button.style.margin = '0';
        button.style.padding = '0';
        button.style.paddingLeft = `${nameplatePadding}px`;
        button.style.color = '#fff';
        button.style.backgroundColor = 'rgba(0,0,0,0)';
        button.style.textShadow = '0px 0px 5px black';
        button.style.letterSpacing = '0.1em';
        button.style.fontSize = `${nameplateSize - 6}px`;
    }
}

export const layoutVideoTilesActiveSpeaker = (visibleTileIndices, aTileId, tileIndexToTileId) => {
    const tileArea = document.getElementById('tile-area')
    const width = tileArea.clientWidth;
    const height = tileArea.clientHeight;
    const widthToHeightAspectRatio = 16 / 9;
    const maximumRelativeHeightOfOthers = 0.3;

    const activeWidth = width;
    const activeHeight = width / widthToHeightAspectRatio;
    const othersCount = visibleTileIndices.length - 1;
    let othersWidth = width / othersCount;
    let othersHeight = width / widthToHeightAspectRatio;
    if (othersHeight / activeHeight > maximumRelativeHeightOfOthers) {
        othersHeight = activeHeight * maximumRelativeHeightOfOthers;
        othersWidth = othersHeight * widthToHeightAspectRatio;
    }
    if (othersCount === 0) {
        othersHeight = 0;
    }
    const totalHeight = activeHeight + othersHeight;
    const othersTotalWidth = othersWidth * othersCount;
    const othersXOffset = width / 2 - othersTotalWidth / 2;
    const activeYOffset = height / 2 - totalHeight / 2;
    const othersYOffset = activeYOffset + activeHeight;

    let othersIndex = 0;
    for (let i = 0; i < visibleTileIndices.length; i++) {
        const tileIndex = visibleTileIndices[i];
        const tileId = tileIndexToTileId[tileIndex];
        let x = 0,
            y = 0,
            w = 0,
            h = 0;
        if (tileId === aTileId) {
            x = 0;
            y = activeYOffset;
            w = activeWidth;
            h = activeHeight;
        } else {
            x = othersXOffset + othersIndex * othersWidth;
            y = othersYOffset;
            w = othersWidth;
            h = othersHeight;
            othersIndex += 1;
        }
        updateTilePlacement(tileIndex, x, y, w, h);
    }
}

export const layoutVideoTilesGrid = (visibleTileIndices) => {
    const tileArea = document.getElementById('tile-area')
    const width = tileArea.clientWidth;
    const height = tileArea.clientHeight;
    const widthToHeightAspectRatio = 16 / 9;
    let columns = 1;
    let totalHeight = 0;
    let rowHeight = 0;
    for (; columns < 18; columns++) {
        const rows = Math.ceil(visibleTileIndices.length / columns);
        rowHeight = width / columns / widthToHeightAspectRatio;
        totalHeight = rowHeight * rows;
        if (totalHeight <= height) {
            break;
        }
    }
    for (let i = 0; i < visibleTileIndices.length; i++) {
        const w = Math.floor(width / columns);
        const h = Math.floor(rowHeight);
        const x = (i % columns) * w;
        const y = Math.floor(i / columns) * h + (height / 2 - totalHeight / 2);
        updateTilePlacement(visibleTileIndices[i], x, y, w, h);
    }
}

export const setAudioPreviewPercent = (percent) => {
    const audioPreview = document.getElementById('audio-preview')
    if (audioPreview === null) return
    if (audioPreview.getAttribute('aria-valuenow') !== `${percent}`) {
        audioPreview.style.width = `${percent}%`
        audioPreview.setAttribute('aria-valuenow', `${percent}`)
    }
    const transitionDuration = '33ms'
    if (audioPreview.style.transitionDuration !== transitionDuration) {
        audioPreview.style.transitionDuration = transitionDuration
    }
}

export const displayButtonStates = (buttonStates) => {
    for (const button in buttonStates) {
        const element = document.getElementById(button)
        const drop = document.getElementById(`${button}-drop`)
        const on = buttonStates[button]
        element.classList.add(on ? 'btn-success' : 'btn-outline-secondary')
        element.classList.remove(on ? 'btn-outline-secondary' : 'btn-success')
        element.firstElementChild.classList.add(on ? 'svg-active' : 'svg-inactive')
        element.firstElementChild.classList.remove(on ? 'svg-inactive' : 'svg-active')
        if (drop) {
            drop.classList.add(on ? 'btn-success' : 'btn-outline-secondary')
        }
    }
}

export const toggleButton = (buttonStates, button, state) => {
    if (state === 'on') {
        buttonStates[button] = true;
    } else if (state === 'off') {
        buttonStates[button] = false;
    } else {
        buttonStates[button] = !buttonStates[button];
    }
    displayButtonStates();
    return buttonStates[button];
}
