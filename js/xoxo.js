const SIZE = 50 * UPSCALE;
const COLORS = {
    N: "#cd0969",
    P: "#037dbf",
    T: "#fcc527",
    U: "#6f2f80",
    V: "#42b5df",
    Y: "#ce1e26",
    L: "#849e34",
    W: "#ea5c15",
    I: "#284287",
    Z: "#188082"
};
const PIECES = {
    N: [["x", null], ["o", null], ["x", "o"], [null, "x"]],
    P: [["o", "x", "o"], ["x", "o", null]],
    T: [["x", "o", "x"], [null, "x", null], [null, "o", null]],
    U: [["o", "x", "o"], ["x", null, "x"]],
    V: [["o", "x", "o"], [null, null, "x"], [null, null, "o"]],
    Y: [[null, "x", null, null], ["x", "o", "x", "o"]],
    L: [["o", null, null, null], ["x", "o", "x", "o"]],
    W: [[null, "x", "o"], ["x", "o", null], ["o", null, null]],
    I: [["x", "o", "x", "o", "x"]],
    Z: [["o", null, null], ["x", "o", "x"], [null, null, "o"]]
};
const BASE_POSITIONS = {
    N: [0, 0],
    P: [1, 0],
    T: [4, 0],
    V: [7, 0],
    U: [6, 1],
    Z: [7, 2],
    I: [4, 4],
    L: [0, 3],
    W: [2, 1],
    Y: [3, 2],
};

function getCornerBits(piece) {
    let cornerBits = [];
    let layout = piece.layout;
    let rows = layout.length;
    let cols = Math.max(...layout.map(x => x.length));
    let originalLayout = piece.layout;
    layout = layout.map(
        x => x.concat(
            Array.from({length: cols - x.length}, () => null)
        )
    );
    layout = layout.map(x => [null].concat(x).concat([null]));
    cols += 2;
    layout = [Array.from({length: cols}, () => null)]
        .concat(layout)
        .concat([Array.from({length: cols}, () => null)]);
    rows += 2;
    let existMap = layout.map(row => row.map(x => !!x));
    for (let r = 0; r < rows - 1; r++) {
        cornerBits[r] = [];
        for (let c = 0; c < cols - 1; c++) {
            let thisCornerBits = (
                (existMap[r][c] << 3) |
                (existMap[r][c+1] << 2) |
                (existMap[r+1][c+1] << 1) |
                (existMap[r+1][c] << 0)
            );
            if (thisCornerBits === 15) thisCornerBits = 0;
            cornerBits[r][c] = thisCornerBits;
        }
    }
    return cornerBits;
}

function drawPiece(piece) {
    ctx.fillStyle = piece.color;
    let cornerBits = getCornerBits(piece);
    let originalLayout = piece.layout;
    let rows = originalLayout.length + 2;
    let cols = Math.max(...originalLayout.map(x => x.length)) + 2;
    let bitsPos = [0, 0];
    while (!cornerBits[bitsPos[0]][bitsPos[1]]) bitsPos[1]++;
    let startPos = [...bitsPos];
    let bitsDir = [0, 1];
    ctx.beginPath();
    do {
        bitsDir = [-bitsDir[1], bitsDir[0]];
        let isBroken = true;
        for (let i = 0; i < 4; i++) {
            let current = (cornerBits[bitsPos[0]] ?? [])[bitsPos[1]];
            let next = (cornerBits[bitsPos[0] + bitsDir[0]] ?? [])[bitsPos[1] + bitsDir[1]];
            let wouldJumpGap = false;
            if (current === 4 && next === 8 && bitsDir[1] === -1) wouldJumpGap = true;
            if (current === 8 && next === 4 && bitsDir[1] === 1) wouldJumpGap = true;
            if (current === 2 && next === 1 && bitsDir[1] === -1) wouldJumpGap = true;
            if (current === 1 && next === 2 && bitsDir[1] === 1) wouldJumpGap = true;
            if (current === 2 && next === 4 && bitsDir[0] === -1) wouldJumpGap = true;
            if (current === 4 && next === 2 && bitsDir[0] === 1) wouldJumpGap = true;
            if (current === 1 && next === 8 && bitsDir[0] === -1) wouldJumpGap = true;
            if (current === 8 && next === 1 && bitsDir[0] === 1) wouldJumpGap = true;
            if (next && !wouldJumpGap) {isBroken = false; break;}
            bitsDir = [bitsDir[1], -bitsDir[0]];
        }
        if (isBroken) {
            ctx.fill();
            return;
        }
        let thisCornerBits = cornerBits[bitsPos[0]][bitsPos[1]];
        let left = SIZE * (piece.position[0] + bitsPos[1] - 0.5);
        let top = SIZE * (piece.position[1] + bitsPos[0] - 0.5);
        if (bitsPos[0] === startPos[0] && bitsPos[1] === startPos[1]) {
            if (bitsDir[0] === 1) ctx.moveTo(left + SIZE, top + SIZE * 0.5);
            if (bitsDir[0] === -1) ctx.moveTo(left + SIZE, top + SIZE * 1.5);
            if (bitsDir[1] === 1) ctx.moveTo(left + SIZE * 0.5, top + SIZE);
            if (bitsDir[1] === -1) ctx.moveTo(left + SIZE * 1.5, top + SIZE);
        }
        drawPiecePart(thisCornerBits, [left, top]);
        bitsPos[0] += bitsDir[0];
        bitsPos[1] += bitsDir[1];
    } while (bitsPos[0] !== startPos[0] || bitsPos[1] !== startPos[1]);
    ctx.fill();
    ctx.lineWidth = 5 * UPSCALE;
    let strokeColor = piece.strokeColor;
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
    }
    ctx.strokeStyle = hsvFunc(
        piece.color,
        (h, s, v) => [h, s * 0.5, v * 1.5]
    );
    for (let r = 0; r < rows - 2; r++) {
        for (let c = 0; c < cols - 2; c++) {
            let type = piece.layout[r][c];
            if (!type) continue;
            let left = SIZE * (piece.position[0] + c);
            let top = SIZE * (piece.position[1] + r);
            ctx.beginPath();
            if (type === "x") {
                ctx.moveTo(left + SIZE * 0.2, top + SIZE * 0.2);
                ctx.lineTo(left + SIZE * 0.8, top + SIZE * 0.8);
                ctx.moveTo(left + SIZE * 0.8, top + SIZE * 0.2);
                ctx.lineTo(left + SIZE * 0.2, top + SIZE * 0.8);
            } else if (type === "o") {
                ctx.moveTo(left + SIZE * 0.8, top + SIZE * 0.5);
                ctx.arc(left + SIZE * 0.5, top + SIZE * 0.5, SIZE * 0.3, 0, 2 * Math.PI);
            }
            ctx.stroke();
        }
    }
}

function drawPiecePart(num, [left, top]) {
    let x1 = left;
    let x2 = left + SIZE * 0.25;
    let x3 = left + SIZE * 0.5;
    let x4 = left + SIZE * 0.75;
    let x5 = left + SIZE;
    let y1 = top;
    let y2 = top + SIZE * 0.25;
    let y3 = top + SIZE * 0.5;
    let y4 = top + SIZE * 0.75;
    let y5 = top + SIZE;
    let radius = SIZE * 0.25;
    let pi = Math.PI;
    let eta = pi / 2;
    switch (num) {
        case 1:
            ctx.lineTo(x2, y3);
            ctx.arc(x2, y4, radius, -eta, 0);
            ctx.lineTo(x3, y5);
            break;
        case 2:
            ctx.lineTo(x3, y4);
            ctx.arc(x4, y4, radius, -pi, -eta);
            ctx.lineTo(x5, y3);
            break;
        case 3:
            ctx.lineTo(x5, y3);
            break;
        case 4:
            ctx.lineTo(x4, y3);
            ctx.arc(x4, y2, radius, eta, pi);
            ctx.lineTo(x3, y1);
            break;
        case 6:
            ctx.lineTo(x3, y1);
            break;
        case 7:
            ctx.lineTo(x2, y3);
            ctx.arc(x2, y2, radius, eta, 0, true);
            ctx.lineTo(x3, y1);
            break;
        case 8:
            ctx.lineTo(x3, y2);
            ctx.arc(x2, y2, radius, 0, eta);
            ctx.lineTo(x1, y3);
            break;
        case 9:
            ctx.lineTo(x3, y5);
            break;
        case 11:
            ctx.lineTo(x3, y2);
            ctx.arc(x4, y2, radius, pi, eta, true);
            ctx.lineTo(x5, y3);
            break;
        case 12:
            ctx.lineTo(x1, y3);
            break;
        case 13:
            ctx.lineTo(x4, y3);
            ctx.arc(x4, y4, radius, -eta, -pi, true);
            ctx.lineTo(x3, y5);
            break;
        case 14:
            ctx.lineTo(x3, y4);
            ctx.arc(x2, y4, radius, 0, -eta, true);
            ctx.lineTo(x1, y3);
            break;
    }
}

let pieces = [];

class Piece {
    #key;
    #rotation;
    #flipped;
    #selected;
    
    constructor(key) {
        this.#key = key;
        this.position = BASE_POSITIONS[key].map(x => x);
        this.position[1] += 6;
        this.#rotation = 0;
        this.#flipped = false;
        this.#selected = false;
        this.locked = false;
    }

    get key() {
        return this.#key;
    }

    get color() {
        let color = COLORS[this.#key];
        if (this.locked)
            color = hsvFunc(
                color,
                (h, s, v) => [h, s * 0.6, v]
            );
        return color;
    }

    get strokeColor() {
        if (this.#selected) return "#fff";
        if (!this.locked)
            return hsvFunc(
                this.color,
                (h, s, v) => [h, s * 1.5, v * 0.75]
            );
    }

    get layout() {
        let layout = PIECES[this.#key].map(x => [...x]);
        if (this.#flipped) {
            layout.reverse();
            layout = layout.map(
                x => x.map(
                    y => ({x: "o", o: "x"})[y] ?? null
                )
            );
        }
        for (let i = 0; i < this.#rotation; i++) {
            let newLayout = [];
            for (let r = 0; r < layout[0].length; r++) {
                newLayout[r] = [];
                for (let c = 0; c < layout.length; c++) {
                    newLayout[r][c] = layout[c][layout[0].length - r - 1];
                }
            }
            layout = newLayout;
        }
        return layout;
    }

    get selected() {
        return this.#selected;
    }

    select() {
        if (this.locked) return;
        pieces.forEach(x => x.deselect());
        this.#selected = true;
    }

    deselect() {
        this.#selected = false;
    }

    flipV() {
        this.#flipped = !this.#flipped;
        this.#rotation = (4 - this.#rotation) % 4;
    }

    flipH() {
        let position = [...this.position];
        this.flipV();
        this.rotate(2);
        this.position = position; // To prevent moving weirdness
    }

    rotate(i) {
        let oldLayout = this.layout;
        let oldRotation = this.#rotation;
        this.#rotation += i;
        this.#rotation %= 4;
        this.#rotation += 4;
        this.#rotation %= 4;
        let newLayout = this.layout;
        let newRotation = this.#rotation;
        if (this.#flipped) {
            oldRotation ^= 2;
            newRotation ^= 2;
        }

        function getCenter(x, r) {
            switch (x.length * 10 + x[0].length) {
                case 51: return [0, 2];
                case 42: return [0, 1];
                case 33: return [1, 1];
                case 32: return r === 1 ? [1, 1] : [0, 1];
                case 23: return r === 0 ? [1, 1] : [1, 0];
                case 24: return [1, 0];
                case 15: return [2, 0];
            }
        }

        let oldCenter = getCenter(oldLayout, oldRotation);
        let newCenter = getCenter(newLayout, newRotation);

        this.position = [
            this.position[0] + oldCenter[0] - newCenter[0],
            this.position[1] + oldCenter[1] - newCenter[1]
        ];
        this.clampToBorders();
    }

    touches(x, y) {
        let offsetX = x - this.position[0];
        let offsetY = y - this.position[1];
        return !!(this.layout[offsetY] ?? [])[offsetX];
    }

    clampToBorders() {
        this.position[0] = Math.max(this.position[0], 0);
        this.position[1] = Math.max(this.position[1], 0);
        let width = this.layout[0].length;
        let height = this.layout.length;
        this.position[0] = Math.min(this.position[0], 10 - width);
        this.position[1] = Math.min(this.position[1], 11 - height);
    }
}

for (let k in PIECES) pieces.push(new Piece(k));

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 10; c++) {
            if ((r + c) % 2 === 0) {
                ctx.beginPath();
                ctx.arc((c + 0.5) * SIZE, (r + 0.5) * SIZE,
                        SIZE / 4, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }
    ctx.fillStyle = "#888";
    ctx.fillRect(0, 5 * SIZE, canvas.width, SIZE);
    let gridSize = SIZE / 20;
    for (let r = 1; r < 11; r++) {
        ctx.fillRect(0, r * SIZE - gridSize / 2, canvas.width, gridSize);
    }
    for (let c = 1; c < 10; c++) {
        ctx.fillRect(c * SIZE - gridSize / 2, 0, gridSize, canvas.height);
    }
    pieces.forEach(drawPiece);
    pieces.filter(x => x.strokeColor).forEach(drawPiece);
    pieces.filter(x => x.selected).forEach(drawPiece);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2 * UPSCALE;
    let hadError = false;
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 10; c++) {
            let isError = false;
            let touching = pieces.filter(x => x.touches(c, r));
            if (touching.length !== 1) isError = true;
            else if ((r + c) % 2 === 0) {
                let layout = touching[0].layout
                    [r - touching[0].position[1]]
                    [c - touching[0].position[0]];
                if (layout === "o") isError = true;
            }
            if (isError && touching.length) {
                ctx.beginPath();
                ctx.moveTo((c + 1) * SIZE, (r + 0.5) * SIZE);
                ctx.arc((c + 0.5) * SIZE, (r + 0.5) * SIZE,
                        SIZE / 2, 0, 2 * Math.PI);
                ctx.stroke();
            }
            hadError ||= isError;
        }
    }
    if (!hadError) {
        ctx.strokeStyle = "#0f0";
        ctx.lineWidth = 5 * UPSCALE;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }
}
setInterval(draw, 1);

let isMouseDown = false;
let pieceOffset = null;
let isDraggingPiece = false;
addMouseDown(document, event => {
    isMouseDown = true;
});
addMouseUp(document, event => {
    isMouseDown = isDraggingPiece = false;
});

document.addEventListener("keydown", event => {
    let selected = pieces.find(x => x.selected);
    if (!selected) return;
    switch (event.key) {
        case "q":
        case "Q":
            selected.rotate(1);
            break;
        case "e":
        case "E":
            selected.rotate(-1);
            break;
        case "a":
        case "A":
            selected.flipH();
            break;
        case "d":
        case "D":
            selected.flipV();
            break;
        default:
            return;
    }
    event.preventDefault();
});

addMouseDown(canvas, event => {
    let x = Math.floor(event.offsetX / SIZE);
    let y = Math.floor(event.offsetY / SIZE);
    for (let piece of pieces.toReversed()) {
        if (piece.touches(x, y) && !piece.locked) {
            isDraggingPiece = true;
            piece.select();
            pieces.splice(pieces.indexOf(piece), 1);
            pieces.push(piece);
            pieceOffset = [piece.position[0] - x, piece.position[1] - y];
            return;
        }
    }
    pieces.find(x => x.selected)?.deselect?.();
});
addMouseMove(canvas, event => {
    if (!isDraggingPiece) return;
    let selected = pieces.find(x => x.selected);
    if (!selected) return;
    let x = Math.floor(event.offsetX / SIZE);
    let y = Math.floor(event.offsetY / SIZE);
    selected.position = [x + pieceOffset[0], y + pieceOffset[1]];
    selected.clampToBorders();
});

function loadPuzzle(index) {
    pieces = [];
    for (let k in PIECES) pieces.push(new Piece(k));
    if (index < 0) return;
    loadPuzzleData(PUZZLE_DATA[index]);
}

function loadPuzzleData(rawData) {
    let grid = rawData.split("\n").map(x => [...x]);
    let lockedPieces = new Set(rawData);
    lockedPieces.delete(".");
    lockedPieces.delete("\n");
    for (let k of lockedPieces) {
        let piece = pieces.find(p => p.key === k);
        piece.locked = true;
        let r = 0, c = 0;
        for (; r < 5; r++) {
            if (grid[r].includes(k)) break;
        }
        for (; c < 10; c++) {
            if (grid.map(x => x[c]).includes(k)) break;
        }
        let map = grid.map(x => x.map(y => y === k));
        for (let i = 0; i < 2; i++) {
            map = map.filter(x => x.some(y => y));
            map = map[0].map((_, ci) => map.map(row => row[ci]));
        }
        map = map.map((x, ri) => x.map((y, ci) => {
            if (!y) return null;
            if ((r + c) % 2 === (ri + ci) % 2) return "x";
            return "o";
        }));
        let matchesMap = () => {
            let x = piece.layout;
            if (x.length !== map.length) return false;
            if (x[0].length !== map[0].length) return false;
            for (let i = 0; i < x.length; i++) {
                for (let j = 0; j < x[0].length; j++) {
                    if (x[i][j] !== map[i][j]) return false;
                }
            }
            return true;
        };
        for (let flipped of [false, true]) {
            for (let rotation = 0; rotation < 4; rotation++) {
                if (matchesMap()) break;
                piece.rotate(1);
            }
            if (matchesMap()) break;
            piece.flipV();
        }
        if (!matchesMap()) {
            pieces = [];
            for (let k in PIECES) pieces.push(new Piece(k));
            alert("Invalid puzzle layout.");
            return;
        }
        piece.position = [c, r];
    }
}

function copyState() {
    let stateGrid = Array.from(
        {length: 5},
        () => Array.from(
            {length: 10},
            () => "."
        )
    );
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 10; c++) {
            for (let piece of pieces) {
                if (piece.touches(c, r)) {
                    stateGrid[r][c] = piece.key;
                    break;
                }
            }
        }
    }
    let toCopy = stateGrid.map(x => x.join("")).join("\n");
    navigator.clipboard.writeText(toCopy);
    alert("Copied!");
}

function pasteState() {
    navigator.clipboard.readText().then(text => {
        text = text.replaceAll("\r", "");
        if (!/^([NPTUVYLWIZ.]{10}\n){5}$/.test(text + "\n")) {
            alert("Invalid puzzle to load from clipboard.");
            return;
        }
        loadPuzzleData(text);
    });
}

let puzzleIndex = 0;
for (let difficulty of "Starter Junior Expert Master Wizard".split(" ")) {
    let optgroup = document.createElement("optgroup");
    optgroup.setAttribute("label", difficulty + " Puzzles");
    for (let i = 0; i < 24; i++) {
        let option = document.createElement("option");
        option.setAttribute("value", puzzleIndex++);
        option.appendChild(document.createTextNode("Puzzle #" + puzzleIndex));
        optgroup.appendChild(option);
    }
    document.getElementById("level").appendChild(optgroup);
}