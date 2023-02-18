const CS = 850; //vászon (tábla) mérete
const FL = {
    'r': '\u265C',
    'n': '\u265E',
    'b': '\u265D',
    'q': '\u265B',
    'k': '\u265A',
    'p': '\u265F',
    'R': '\u2656',
    'N': '\u2658',
    'B': '\u2657',
    'Q': '\u2655',
    'K': '\u2654',
    'P': '\u2659',
    'x': ''
}

const black_figures = ['r', 'n', 'b', 'q', 'k', 'p'];
const white_figures = ['R', 'N', 'B', 'Q', 'K', 'P'];

let canvas = document.getElementById("chesstable");
canvas.width = CS;
canvas.height = CS;
let ctx = canvas.getContext("2d");
let positions_of_figures_list = [];
let wob;
let pk;
let figure_row, figure_col;
let move_flag = false

canvas.onclick = canvas_click;

document.getElementById("reset").onclick = function () {
    main('rnbqkbnrppppppppxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxPPPPPPPPRNBQKBNR', 'New', pk)
}

function main(positions_of_figures, white_or_black, id) {
    document.getElementById('positions').value = positions_of_figures; //value
    positions_of_figures_list = [];
    for (let i = 0; i < 8; i++) {
        positions_of_figures_list.push(positions_of_figures.slice(i * 8, (i + 1) * 8).split(''));
    }
    pk = id;
    wob = white_or_black;
    draw_table();
}

function draw_table() {
    ctx.fillStyle = "#EEEEEE";
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = "#CCCCCC";

    for (let i = 0; i < 8; i += 2) {
        for (let j = 1; j < 8; j += 2) {
            ctx.fillRect(j * CS / 8, i * CS / 8, CS / 8, CS / 8);
            ctx.fillRect((j - 1) * CS / 8, (i + 1) * CS / 8, CS / 8, CS / 8);
        }
    }
    ctx.fillStyle = "#000000";
    ctx.font = "100px Arial";
    ctx.textAlign = "center";

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            ctx.fillText(FL[positions_of_figures_list[i][j]], j * CS / 8 + CS / 16, i * CS / 8 + CS / 16 + CS / 23);
        }
    }
}

function canvas_click(event) {

    let rect = canvas.getBoundingClientRect();
    x = parseInt((event.clientX - rect.left) / (rect.right - rect.left)) * CS;
    y = parseInt((event.clientY - rect.top) / (rect.bottom - rect.top)) * CS;
    let row = parseInt(y / (CS / 8));
    let col = parseInt(x / (CS / 8));

    if (move_flag === false) {
        if (positions_of_figures_list[row][col] !== 'x') {
            if (wob === "White" && black_figures.includes(positions_of_figures_list[row][col]) || (wob === "Black" || wob === "New") && white_figures.includes(positions_of_figures_list[row][col])) {
                ctx.beginPath();
                ctx.lineWidth = "5"
                ctx.strokeStyle = "darkred";
                ctx.rect(col * CS / 8, row * CS / 8, CS / 8);
                ctx.stroke();
                move_flag = true;
                figure_row = row;
                figure_col = col;
            }
        } else {
            let res = prompt('Rescued figure (r, n, b, q, k, p, R, N, B, Q, K, P, x):');
            positions_of_figures_list[row][col] = (['r', 'n', 'b', 'q', 'k', 'p', 'R', 'N', 'B', 'Q', 'K', 'P', 'x'].includes(res) ? res : 'x');
            draw_table();
        }
    } else {
        if (row === figure_row && col === figure_col) {
            draw_table();
            move_flag = false;
        } else {
            positions_of_figures_list[row][col] = positions_of_figures_list[figure_row][figure_col];
            positions_of_figures_list[figure_row][figure_col] = 'x';
            draw_table();
            move_flag = false;
        }
    }
document.getElementById('positions').value = positions_of_figures_list.toString().replaceAll(',', '');
}
