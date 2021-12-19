// browser saves will be stored under the id "bipsi"
const storage = new maker.ProjectStorage("bipsi");

// type definitions for the structure of bipsi project data. useful for the
// code editor, ignored by the browser 
/**
 * @typedef {Object} BipsiDataSettings
 * @property {string} title
 */

/**
 * @typedef {Object} BipsiDataEventField
 * @property {string} key
 * @property {string} type
 * @property {any} data
 */

/**
 * @typedef {Object} BipsiDataEvent
 * @property {number} id
 * @property {number[]} position
 * @property {BipsiDataEventField[]} fields
 */

/**
 * @typedef {Object} BipsiDataRoom
 * @property {number} id
 * @property {number} palette
 * @property {number[][]} tilemap
 * @property {number[][]} backmap
 * @property {number[][]} foremap
 * @property {number[][]} wallmap
 * @property {BipsiDataEvent[]} events
 */

/**
 * @typedef {Object} BipsiDataTile
 * @property {number} id
 * @property {number[]} frames
 */

/**
 * @typedef {Object} BipsiDataProject
 * @property {BipsiDataRoom[]} rooms
 * @property {string[][]} palettes
 * @property {string} tileset
 * @property {BipsiDataTile[]} tiles
 */

/**
 * @typedef {Object} BipsiDataLocation 
 * @property {number} room
 * @property {number[]} position
 */

/**
 * Return a list of resource ids that a particular bipsi project depends on. 
 * @param {BipsiDataProject} data 
 * @returns {string[]}
 */
function getManifest(data) {
    // all embedded files
    const files = allEvents(data)
        .flatMap((event) => event.fields)
        .filter((field) => field.type === "file")
        .map((field) => field.data);

    // + tileset
    return [data.tileset, ...files];
}

const constants = {
    tileSize: 8,
    roomSize: 16,
    frameInterval: 400,

    tileset: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAjUlEQVR42u3XMQ4AEBAEwPv/p2kUIo5ScmYqQWU3QsSkDbu5TFBHVoDTfqemAFQKfy3BOs7WKBT+HLQCfBB+dgPcHnoKULAIp7ECfFoA30AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOCFDjCu5xlD93/uAAAAAElFTkSuQmCC",

    wallTile: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAAXNSR0IArs4c6QAAAAlQTFRFAAAA////AAAAc8aDcQAAAAN0Uk5TAP//RFDWIQAAADlJREFUGJVlj0EOACAIw2D/f7QmLAa7XeyaKFgVkfSjum1M9xhDeN24+pjdbVYPwSt8lGMDcnV+DjlaUACpjVBfxAAAAABJRU5ErkJggg==",
    eventTile: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAAXNSR0IArs4c6QAAAAlQTFRFAAAA////AAAAc8aDcQAAAAN0Uk5TAP//RFDWIQAAACVJREFUGJVjYMAATCgAJMCIBCACCHmYAFz3AAugOwzd6eieQwMAdfAA3XvBXggAAAAASUVORK5CYII=",
    startTile: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAAXNSR0IArs4c6QAAAAZQTFRFAAAA////pdmf3QAAAAJ0Uk5TAP9bkSK1AAAAJUlEQVQYlWNgwACMKAC7ALJqnALIqkEETD8lAhiGEnIHIb+gAQBFEACBGFbz9wAAAABJRU5ErkJggg==",

    colorwheelMargin: 12,
}
const TEMP_128 = createRendering2D(128, 128);
const TEMP_256 = createRendering2D(256, 256);

/**
 * @param {HTMLCanvasElement} tileset 
 * @param {number} index 
 */
function getTileCoords(tileset, index) {
    const size = constants.tileSize;
    const columns = tileset.width / size;

    return {
        x: size * (index % columns),
        y: size * Math.floor(index / columns),
        size,
    }
}

/**
 * @param {CanvasRenderingContext2D} tileset 
 * @param {number} tileIndex 
 * @param {CanvasRenderingContext2D} destination 
 * @returns {CanvasRenderingContext2D}
 */
function copyTile(tileset, tileIndex, destination = undefined) {
    const { x, y, size } = getTileCoords(tileset.canvas, tileIndex);
    const tile = copyRendering2D(tileset, destination, { x, y, w: size, h: size });
    return tile;
}

/**
 * @param {CanvasRenderingContext2D} tileset 
 * @param {number} tileIndex
 * @param {CanvasRenderingContext2D} tile 
 */
function drawTile(tileset, tileIndex, tile) {
    const { x, y, size } = getTileCoords(tileset.canvas, tileIndex);
    tileset.clearRect(x, y, size, size);
    tileset.drawImage(tile.canvas, x, y);
}

/**
 * @param {BipsiDataTile[]} tiles 
 * @param {number} frame 
 * @returns {Map<number, number>} 
 */
function makeTileToFrameMap(tiles, frame) {
    /** @type {[number, number][]} */
    return new Map(tiles.map((tile) => [
        tile.id, 
        tile.frames[frame] ?? tile.frames[0],
    ]));
}

function drawTilemapLayer(destination, tileset, tileToFrame, palette, { tilemap, backmap, foremap }) {
    drawRecolorLayer(destination, (backg, color, tiles) => {
        for (let ty = 0; ty < 16; ++ty) {
            for (let tx = 0; tx < 16; ++tx) {
                const back = backmap[ty][tx];
                const fore = foremap[ty][tx];
                const tileIndex = tilemap[ty][tx];
                
                const frameIndex = tileToFrame.get(tileIndex);
                const { x, y, size } = getTileCoords(tileset.canvas, frameIndex);

                if (tileIndex === 0) continue;

                backg.fillStyle = palette[back];
                backg.fillRect(tx * size, ty * size, size, size);

                color.fillStyle = palette[fore];
                color.fillRect(tx * size, ty * size, size, size);

                tiles.drawImage(
                    tileset.canvas,
                    x, y, size, size, 
                    tx * size, ty * size, size, size,
                );
            }
        }
    });
}

function drawEventLayer(destination, tileset, tileToFrame, palette, events) {
    const [background, foreground, highlight] = palette;

    drawRecolorLayer(destination, (backg, color, tiles) => {
        events.forEach((event) => {
            const [tx, ty] = event.position;
            const graphicField = oneField(event, "graphic", "tile");
            if (graphicField) {
                const frameIndex = tileToFrame.get(graphicField.data) ?? 0;
                const { x, y, size } = getTileCoords(tileset.canvas, frameIndex);
    
                if (background && !eventIsTagged(event, "transparent")) {
                    backg.fillStyle = background;
                    backg.fillRect(tx * size, ty * size, size, size);
                }

                color.fillStyle = highlight;
                color.fillRect(tx * size, ty * size, size, size);

                tiles.drawImage(
                    tileset.canvas,
                    x, y, size, size, 
                    tx * size, ty * size, size, size,
                );
            }
        });
    });
}

/**
 * @param {any[][]} map 
 * @param {number} dx 
 * @param {number} dy 
 */
function cycleMap(map, dx, dy) {
    const x = dx > 0 ? dx : 16 + dx;
    const y = dy > 0 ? dy : 16 + dy;
    
    map.push(...map.splice(0, y));
    map.forEach((row) => {
        row.push(...row.splice(0, x));
    });
}

/**
 * @param {BipsiDataEvent[]} events 
 * @param {number} dx
 * @param {number} dy 
 */
function cycleEvents(events, dx, dy) {
    events.forEach((event) => {
        event.position[0] = (event.position[0] + 16 + dx) % 16;
        event.position[1] = (event.position[1] + 16 + dy) % 16;
    });
}

/**
 * @param {BipsiDataEvent[]} events 
 * @param {number} x
 * @param {number} y 
 */
function getEventsAt(events, x, y, ignore=undefined) {
    return events.filter((event) => event.position[0] === x 
                                 && event.position[1] === y 
                                 && event !== ignore);
}

/**
 * @template {{id: number}} T
 * @param {T[]} items 
 * @param {number} id 
 * @returns {T}
 */
function getById(items, id) {
    return items.find((item) => item.id === id);
}

/** 
 * @param {BipsiDataProject} data 
 * @param {number} id
 */
function getRoomById(data, id) {
    return getById(data.rooms, id);
}

/** 
 * @param {BipsiDataProject} data 
 * @param {number} id
 */
function getEventById(data, id) {
    return getById(allEvents(data), id);
}

/** 
 * @param {BipsiDataProject} data 
 * @param {number} id
 */
function getTileById(data, id) {
    return getById(data.tiles, id);
}

/**
 * @param {BipsiDataTile[]} tiles
 */
function findFreeFrame(tiles) {
    const frames = new Set(tiles.flatMap((tile) => tile.frames));
    const max = Math.max(...frames);

    for (let i = 0; i < max; ++i) {
        if (!frames.has(i)) return i;
    }

    return max + 1;
}

/**
 * @param {{id: number}[]} items 
 * @returns {number}
 */
function nextId(items) {
    const max = Math.max(0, ...items.map((item) => item.id ?? 0));
    return max + 1;
}

/** @param {BipsiDataProject} data */
const nextRoomId = (data) => nextId(data.rooms);

/** @param {BipsiDataProject} data */
const nextTileId = (data) => nextId(data.tiles);

/** @param {BipsiDataProject} data */
const nextEventId = (data) => nextId(data.rooms.flatMap((room) => room.events));

/**
 * @param {CanvasRenderingContext2D} tileset 
 * @param {BipsiDataTile[]} tiles
 */
function resizeTileset(tileset, tiles) {
    const maxFrame = Math.max(...tiles.flatMap((tile) => tile.frames));
    const size = 8
    const cols = 16;
    const rows = Math.ceil((maxFrame + 1) / cols);
    resizeRendering2D(tileset, cols * size, rows * size);
}
