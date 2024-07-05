const SIZE = 50 * UPSCALE;
const COLORS = {
    red: "#e41d31",
    blue: "#1ba6e3",
    yellow: "#fad535",
    green: "#a3c41f"
};
const PIECES = {
    S: {
        color: "red",
        layout: [
            ["x", null],
            ["o", "x"],
            [null, "x"]
        ]
    },
    J: {
        color: "red",
        layout: [
            [null, null, "x"],
            ["o", "x", "o"]
        ]
    },
    i: {
        color: "yellow",
        layout: [
            ["x"],
            ["x"],
            ["o"]
        ]
    },
    R: {
        color: "yellow",
        layout: [
            [null, null, "o"],
            ["x", "x", "o"],
            [null, "o", null]
        ]
    },
    L: {
        color: "green",
        layout: [
            ["x", "o"],
            [null, "o"]
        ]
    },
    T: {
        color: "green",
        layout: [
            ["o", null],
            ["x", "o"],
            ["x", null]
        ]
    },
    I: {
        color: "blue",
        layout: [
            ["x", "o", "x", "x"]
        ]
    },
    P: {
        color: "blue",
        layout: [
            ["o", "o", null],
            ["x", "x", "x"]
        ]
    }
};
const BASE_POSITIONS = {
    S: [2, 0],
    J: [5, 2],
    i: [0, 1],
    R: [5, 0],
    L: [0, 0],
    T: [4, 1],
    I: [3, 0],
    P: [1, 2]
};

function drawPiece(piece) {
    let m = 0.9;
    let s = Math.sqrt(2) / 2 * SIZE * m;
    ctx.fillStyle = piece.color;
    for (let r = 0; r < piece.layout.length; r++) {
        for (let c = 0; c < piece.layout[0].length; c++) {
            let piecePart = piece.layout[r][c];
            if (!piecePart) continue;
            let x = (c + piece.position[0] + 0.5) * SIZE;
            let y = (r + piece.position[1] + 0.5) * SIZE;
            ctx.beginPath();
            ctx.arc(x, y, SIZE * 0.5 * m, 0, Math.PI * 2);
            if (piecePart === "o")
                ctx.arc(x, y, SIZE * 0.3, 0, Math.PI * 2, true);
            ctx.fill();
            if ((piece.layout[r - 1] ?? [])[c]) {
                ctx.beginPath();
                ctx.moveTo(x - s / 2, y - s / 2);
                ctx.lineTo(x, y - s);
                ctx.lineTo(x + s / 2, y - s / 2);
                ctx.arc(x, y, SIZE / 2 * m, Math.PI / 4, Math.PI * 3 / 4, true);
                ctx.fill();
            }
            if ((piece.layout[r + 1] ?? [])[c]) {
                ctx.beginPath();
                ctx.moveTo(x - s / 2, y + s / 2);
                ctx.lineTo(x, y + s);
                ctx.lineTo(x + s / 2, y + s / 2);
                ctx.arc(x, y, SIZE / 2 * m, -Math.PI / 4, -Math.PI * 3 / 4);
                ctx.fill();
            }
            if (piece.layout[r][c - 1]) {
                ctx.beginPath();
                ctx.moveTo(x - s / 2, y - s / 2);
                ctx.lineTo(x - s, y);
                ctx.lineTo(x - s / 2, y + s / 2);
                ctx.arc(x, y, SIZE / 2 * m, -Math.PI * 3 / 4, Math.PI * 3 / 4, true);
                ctx.fill();
            }
            if (piece.layout[r][c + 1]) {
                ctx.beginPath();
                ctx.moveTo(x + s / 2, y - s / 2);
                ctx.lineTo(x + s, y);
                ctx.lineTo(x + s / 2, y + s / 2);
                ctx.arc(x, y, SIZE / 2 * m, -Math.PI / 4, Math.PI / 4);
                ctx.fill();
            }
        }
    }
}

let pieces = [];
let pegs = [];

class Piece {
    #key;
    #rotation;
    #flipped;
    #selected;

    constructor(key) {
        this.#key = key;
        this.position = BASE_POSITIONS[key].map(x => x);
        this.position[1] += 5;
        this.#rotation = 0;
        this.#flipped = false;
        this.#selected = false;
    }

    get key() {
        return this.#key;
    }

    get colorName() {
        return PIECES[this.#key].color;
    }

    get color() {
        let color = COLORS[this.colorName];
        if (this.#selected)
            color = hsvFunc(color, (h, s, v) => [h, s * 0.8, v * 1.2]);
        return color;
    }

    get layout() {
        let layout = PIECES[this.#key].layout.map(x => [...x]);
        if (this.#flipped)
            layout.reverse();
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

        function getCenter(x, r) {
            switch (x.length * 10 + x[0].length) {
                case 41: return r === 1 ? [0, 2] : [0, 1];
                case 33: return [1, 1];
                case 32:
                    switch (r) {
                        case 0: return [0, 1];
                        case 1: return [1, 1];
                        case 2: return [1, 1];
                        case 3: return [0, 1];
                    }
                case 31: return [0, 1];
                case 23:
                    switch (r) {
                        case 0: return [1, 1];
                        case 1: return [1, 1];
                        case 2: return [1, 0];
                        case 3: return [1, 0];
                    }
                case 22: return [0, 0];
                case 14: return r === 0 ? [1, 0] : [2, 0];
                case 13: return [1, 0];
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
        this.position[0] = Math.min(this.position[0], 8 - width);
        this.position[1] = Math.min(this.position[1], 9 - height);
    }
}

for (let k in PIECES) pieces.push(new Piece(k));

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#888";
    ctx.fillRect(0, 4 * SIZE, canvas.width, SIZE);
    let gridSize = SIZE / 20;
    for (let r = 1; r < 9; r++) {
        ctx.fillRect(0, r * SIZE - gridSize / 2, canvas.width, gridSize);
    }
    for (let c = 1; c < 8; c++) {
        ctx.fillRect(c * SIZE - gridSize / 2, 0, gridSize, canvas.height);
    }
    for (let peg of pegs) {
        ctx.fillStyle = COLORS[peg.color];
        ctx.beginPath();
        ctx.arc((peg.position[0] + 0.5) * SIZE, (peg.position[1] + 0.5) * SIZE,
                SIZE * 0.25, 0, 2 * Math.PI);
        ctx.fill();
    }
    pieces.forEach(drawPiece);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2 * UPSCALE;
    let hadError = false;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 8; c++) {
            let isError = false;
            let touching = pieces.filter(x => x.touches(c, r));
            if (touching.length !== 1) isError = true;
            else if (pegs.some(x => x.position[0] === c && x.position[1] === r)) {
                let peg = pegs.find(x => x.position[0] === c && x.position[1] === r);
                let toucher = touching[0];
                let part = toucher.layout[r - toucher.position[1]][c - toucher.position[0]];
                if (part === "x") isError = true;
                else if (peg.color !== toucher.colorName) isError = true;
            }
            if (isError && touching.length) {
                ctx.beginPath();
                ctx.moveTo((c + 0.9) * SIZE, (r + 0.5) * SIZE);
                ctx.arc((c + 0.5) * SIZE, (r + 0.5) * SIZE,
                        SIZE * 0.4, 0, 2 * Math.PI);
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
    pegs = [];
    if (index < 0) return;
    loadPuzzleData(PUZZLE_DATA[index]);
}

function loadPuzzleData(rawData) {
    let data = rawData.split(" ").map(x => x.split(",").filter(y => y !== "-"));
    for (let i = 0; i < 4; i++) {
        let color = ["red", "green", "blue", "yellow"][i];
        for (let namedPosition of data[i]) {
            let x = namedPosition[0] - 1;
            let y = namedPosition[1].charCodeAt(0) - 65;
            pegs.push({
                color,
                position: [x, y]
            });
        }
    }
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