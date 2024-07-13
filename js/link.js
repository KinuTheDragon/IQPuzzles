const SIZE = 50 * UPSCALE;
const HEX_SIZE = SIZE / Math.sqrt(3);
const HEX_WIDTH = SIZE;
const HEX_HEIGHT = HEX_SIZE * 2;
const HEX_HORIZ_SPACING = HEX_WIDTH;
const HEX_VERT_SPACING = 0.75 * HEX_HEIGHT;
const COLORS = {
    tr: "#e50e30",
    tg: "#028940",
    tb: "#0b6cbe",
    to: "#ee7b39",
    lp: "#975b9f",
    lg: "#97c04d",
    lt: "#02948e",
    by: "#fac42e",
    bp: "#51358b",
    bb: "#0078bd",
    bp1: "#e74f87",
    bp2: "#e00a7d"
};
/*
{
    isBall: whether or not this part is a ball,
    connections: [openings for rings, links for balls; 0 is up-right, increase clockwise],
    position: [row, column]
}
*/
const PIECES = {
    tr: [
        {
            isBall: false,
            connections: [3],
            position: [0, 0]
        }, {
            isBall: false,
            connections: [2],
            position: [1, 1]
        }, {
            isBall: true,
            connections: [3],
            position: [1, 0]
        }
    ],
    tg: [
        {
            isBall: true,
            connections: [2],
            position: [0, 0]
        }, {
            isBall: true,
            connections: [0, 5],
            position: [0, 1]
        }, {
            isBall: false,
            connections: [0],
            position: [1, 0]
        }
    ],
    tb: [
        {
            isBall: false,
            connections: [3],
            position: [0, 0]
        }, {
            isBall: true,
            connections: [3, 4],
            position: [1, 0]
        }, {
            isBall: true,
            connections: [0],
            position: [0, 1]
        }
    ],
    to: [
        {
            isBall: true,
            connections: [2],
            position: [0, 0]
        }, {
            isBall: false,
            connections: [3],
            position: [0, 1]
        }, {
            isBall: true,
            connections: [3],
            position: [1, 0]
        }
    ],
    lp: [
        {
            isBall: true,
            connections: [1],
            position: [0, 0]
        }, {
            isBall: false,
            connections: [0, 5],
            position: [1, 0]
        }, {
            isBall: true,
            connections: [4],
            position: [2, 0]
        }
    ],
    lg: [
        {
            isBall: true,
            connections: [1],
            position: [0, 0]
        }, {
            isBall: false,
            connections: [],
            position: [1, 0]
        }, {
            isBall: false,
            connections: [5],
            position: [2, 0]
        }
    ],
    lt: [
        {
            isBall: true,
            connections: [1],
            position: [0, 0]
        }, {
            isBall: false,
            connections: [],
            position: [1, 0]
        }, {
            isBall: false,
            connections: [2],
            position: [2, 0]
        }
    ],
    by: [
        {
            isBall: false,
            connections: [0],
            position: [0, 0]
        }, {
            isBall: false,
            connections: [],
            position: [0, 1]
        }, {
            isBall: false,
            connections: [1],
            position: [0, 2]
        }
    ],
    bp: [
        {
            isBall: false,
            connections: [4],
            position: [0, 0]
        }, {
            isBall: false,
            connections: [],
            position: [0, 1]
        }, {
            isBall: true,
            connections: [5],
            position: [0, 2]
        }
    ],
    bb: [
        {
            isBall: true,
            connections: [3],
            position: [0, 0]
        }, {
            isBall: false,
            connections: [],
            position: [0, 1]
        }, {
            isBall: false,
            connections: [1],
            position: [0, 2]
        }
    ],
    bp1: [
        {
            isBall: false,
            connections: [3],
            position: [0, 0]
        }, {
            isBall: false,
            connections: [],
            position: [0, 1]
        }, {
            isBall: true,
            connections: [0],
            position: [0, 2]
        }
    ],
    bp2: [
        {
            isBall: true,
            connections: [0],
            position: [0, 1]
        }, {
            isBall: false,
            connections: [0],
            position: [0, 0]
        }, {
            isBall: true,
            connections: [4],
            position: [1, 0]
        }
    ]
};
const BASE_POSITIONS = {
    tr: [3, 1],
    tg: [4, 2],
    tb: [0, 0],
    to: [4, 0],
    lp: [3, 3],
    lg: [0, 3],
    lt: [2, 0],
    by: [0, 1],
    bp: [2, 1],
    bb: [3, 1],
    bp1: [5, 0],
    bp2: [1, 1]
};

function rowColToCenterXY(r, c) {
    return [
        (r & 1 ? 1 : 0.5) * HEX_WIDTH + HEX_HORIZ_SPACING * c,
        HEX_HEIGHT / 2 + HEX_VERT_SPACING * r
    ];
}

function centerXYToRowCol(x, y) {
    let r = (y - HEX_HEIGHT / 2) / HEX_VERT_SPACING;
    let c = (x - (r & 1 ? 1 : 0.5) * HEX_WIDTH) / HEX_HORIZ_SPACING;
    return [r, c];
}

function moveInDirection(r, c, dir) {
    switch (dir) {
        case 0:
            r--;
            if (r % 2 === 0) c++;
            break;
        case 1:
            c++;
            break;
        case 2:
            r++;
            if (r % 2 === 0) c++;
            break;
        case 3:
            r++;
            if (r % 2 === 1) c--;
            break;
        case 4:
            c--;
            break;
        case 5:
            r--;
            if (r % 2 === 1) c--;
            break;
    }
    return [r, c];
}

function drawPiece(piece) {
    let layout = piece.layout;
    ctx.fillStyle = ctx.strokeStyle = piece.color;
    ctx.lineWidth = 5 * UPSCALE;
    for (let part of layout) {
        let {isBall, connections, position} = part;
        let r = position[1] + piece.position[1];
        let c = position[0] + piece.position[0];
        if (piece.position[1] % 2 !== BASE_POSITIONS[piece.key][1] % 2) {
            if (r % 2 === 1) c--;
        }
        let [x, y] = rowColToCenterXY(r, c);
        if (isBall) {
            ctx.beginPath();
            ctx.arc(x, y, SIZE * 0.35, 0, 2 * Math.PI);
            ctx.fill();
            for (let i of connections) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                let [r2, c2] = moveInDirection(r, c, i);
                let [x2, y2] = rowColToCenterXY(r2, c2);
                x2 = x * 0.45 + x2 * 0.55;
                y2 = y * 0.45 + y2 * 0.55;
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        } else {
            for (let i = 0; i < 6; i++) {
                if (connections.includes(i)) continue;
                ctx.beginPath();
                let theta = (i - 1.5) * Math.PI / 3 - 0.1;
                ctx.arc(x, y, SIZE * 0.45, theta, theta + Math.PI / 3 + 0.2);
                ctx.stroke();
            }
        }
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
        if (this.#selected)
            color = hsvFunc(
                color,
                (h, s, v) => [h, s * 2, v * 2]
            );
        return color;
    }

    get layout() {
        let layout = JSON.parse(JSON.stringify(PIECES[this.#key]));
        // if (this.#flipped) {
        //     layout.reverse();
        //     layout = layout.map(
        //         x => x.map(
        //             y => ({x: "o", o: "x"})[y] ?? null
        //         )
        //     );
        // }
        // for (let i = 0; i < this.#rotation; i++) {
        //     let newLayout = [];
        //     for (let r = 0; r < layout[0].length; r++) {
        //         newLayout[r] = [];
        //         for (let c = 0; c < layout.length; c++) {
        //             newLayout[r][c] = layout[c][layout[0].length - r - 1];
        //         }
        //     }
        //     layout = newLayout;
        // }
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
        this.#rotation = (6 - this.#rotation) % 6;
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
        if (this.layout.some(x => x.position[0] === offsetX && x.position[1] === offsetY))
            return true;
        return false;
    }

    clampToBorders() {
        this.position[0] = Math.max(this.position[0], 0);
        this.position[1] = Math.max(this.position[1], 0);
    }
}

for (let k in PIECES) pieces.push(new Piece(k));

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 5 * UPSCALE;
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 6; c++) {
            let [x, y] = rowColToCenterXY(r, c);
            ctx.beginPath();
            ctx.arc(x, y, SIZE / 4, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }
    ctx.fillStyle = "#888";
    let separatorTop = rowColToCenterXY(3.5, 0)[1];
    let separatorBottom = rowColToCenterXY(5.5, 0)[1];
    ctx.fillRect(0, separatorTop,
                 canvas.width, separatorBottom - separatorTop);
    pieces.forEach(drawPiece);
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
    let x = event.offsetX;
    let y = event.offsetY;
    let [r, c] = centerXYToRowCol(x, y).map(i => Math.round(i));
    for (let piece of pieces.toReversed()) {
        if (piece.touches(c, r) && !piece.locked) {
            isDraggingPiece = true;
            piece.select();
            pieces.splice(pieces.indexOf(piece), 1);
            pieces.push(piece);
            pieceOffset = [piece.position[0] - c, piece.position[1] - r];
            return;
        }
    }
    pieces.find(x => x.selected)?.deselect?.();
});
addMouseMove(canvas, event => {
    if (!isDraggingPiece) return;
    let selected = pieces.find(x => x.selected);
    if (!selected) return;
    let x = event.offsetX;
    let y = event.offsetY;
    let [r, c] = centerXYToRowCol(x, y).map(i => Math.round(i));
    selected.position = [c + pieceOffset[0], r + pieceOffset[1]];
    selected.clampToBorders();
});