const CS = 800; //vászon (tábla) mérete
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
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const coordinates_2D = [
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], ['1', '2', '3', '4', '5', '6', '7', '8']
];

let canvas = document.getElementById("chesstable");
canvas.onclick = function semmit_nem_tesz(c) {
}
canvas.width = CS;
canvas.height = CS;
let ctx = canvas.getContext("2d");
let positions_of_figures_list = [];
let wob;
let pk;
let figure_row, figure_col;
let move_flag = false;

canvas.onclick = canvas_click;

function main(positions_of_figures, white_or_black, id) {
    document.getElementById('positions').value = positions_of_figures; //value
    positions_of_figures_list = [];
    for (let i = 0; i < 8; i++) {
        positions_of_figures_list.push(positions_of_figures.slice(i * 8, (i + 1) * 8).split(''));
    }
    piece_detector(positions_of_figures_list); // melyik bábu hol van
    coordinates('e8', positions_of_figures_list);
    pk = id;
    wob = white_or_black;
    draw_table();
    setInterval("api()", 3000);
}

document.getElementById("reset").onclick = function () {
    main('rnbqkbnrppppppppxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxPPPPPPPPRNBQKBNR', 'New', pk)
}


function api() {
    console.log("Hello")
    $.ajax({
        url: 'api',
        data: {
            'pk': pk
        },
        dataType: 'json',
        success: function (data) {
            if (data.reload) {
                window.location.href = '';
            }
        }
    })
}

function draw_table() {
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = "#BBB";

    for (let i = 0; i < 8; i += 2) { // szurke negyzetek szinezese
        for (let j = 1; j < 8; j += 2) {
            ctx.fillRect(j * CS / 8, i * CS / 8, CS / 8, CS / 8);
            ctx.fillRect((j - 1) * CS / 8, (i + 1) * CS / 8, CS / 8, CS / 8);
        }
    }

    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 8; i += 2) { //  feher negyzetek szinezese
        for (let j = 0; j < 9; j += 2) {
            ctx.fillRect(j * CS / 8, i * CS / 8, CS / 8, CS / 8);
            ctx.fillRect((j - 1) * CS / 8, (i + 1) * CS / 8, CS / 8, CS / 8);
        }
    }

    ctx.fillStyle = "#000"; // babuk szinei
    ctx.font = "100px Arial";
    ctx.textAlign = "center";

    for (let i = 0; i < 8; i++) { // babuk pozicionalasa
        for (let j = 0; j < 8; j++) {
            ctx.fillText(FL[positions_of_figures_list[i][j]], j * CS / 8 + CS / 16, i * CS / 8 + CS / 16 + CS / 23);
        }
    }
}


function canvas_click(event) {

    let rect = canvas.getBoundingClientRect();
    x = Math.floor(((event.clientX - rect.left) / (rect.right - rect.left)) * CS);
    y = Math.floor(((event.clientY - rect.top) / (rect.bottom - rect.top)) * CS);

    let row = parseInt(y / (CS / 8)); // hanyas sor / oszlop bal felulrol kszamova 0,0 rol
    let col = parseInt(x / (CS / 8));
    console.log(row, col);
    console.log(coordinates_2D[0][col] + coordinates_2D[1][7 - row]);

    if (move_flag === false) {
        console.log("False a move_flag --> még nincs kijelolve babu");// nincs jelolve a babu
        if (positions_of_figures_list[row][col] !== 'x') {
            console.log("Nem üres mező");
            if ((wob === "White" && black_figures.includes(positions_of_figures_list[row][col])) ||
                ((wob === "Black" || wob === "New") && white_figures.includes(positions_of_figures_list[row][col]))) {
                console.log("Kijelölés");
                ctx.beginPath();
                ctx.lineWidth = "10";
                ctx.strokeStyle = "darkred";
                ctx.rect(col * CS / 8, row * CS / 8, CS / 8, CS / 8);
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
    } else { // ki van jelolve a babu
        if (row === figure_row && col === figure_col) {
            console.log("Kijelölés vissza");
            draw_table();
            move_flag = false;
        } else {
            console.log("Átmozgatás");
            positions_of_figures_list[row][col] = positions_of_figures_list[figure_row][figure_col];
            positions_of_figures_list[figure_row][figure_col] = 'x';
            draw_table();
            move_flag = false;
            check();
        }
    }
}

document.getElementById('positions').value = positions_of_figures_list.toString().replaceAll(',', '');
console.log(positions_of_figures_list);


function get_white_king_position(list) {
    list=positions_of_figures_list;
    for(let i=0; i<8; i++){
        for(let j=0; j<8; j++){
            if(positions_of_figures_list[i][j]==='K'){
                console.log("Világos király " + coordinates_2D[0][8-j] + coordinates_2D[1][7 - i] + '-n!');
            }
        }
    }
}

function get_black_king_position(list) {
    list=positions_of_figures_list;
    for(let i=0; i<8; i++){
        for(let j=0; j<8; j++){
            if(positions_of_figures_list[i][j]==='k'){
                console.log("Sötét király " + coordinates_2D[0][8-j] + coordinates_2D[1][7-i] + '-n!');
            }
        }
    }
}

function piece_detector(list){
     list=positions_of_figures_list;
         for(let i=0; i<8; i++){
        for(let j=0; j<8; j++){
            if(positions_of_figures_list[i][j]==='k'){
                console.log("Sötét király " + coordinates_2D[0][j] + coordinates_2D[1][7-i] + '-n!');
            }
            else if(positions_of_figures_list[i][j]==='K'){
                console.log("Világos király " + coordinates_2D[0][j] + coordinates_2D[1][7-i] + '-n!');
            }
            else if(positions_of_figures_list[i][j]==='q'){
                console.log("Sötét vezér " + coordinates_2D[0][j] + coordinates_2D[1][7-i] + '-n!');
            }
            else if(positions_of_figures_list[i][j]==='Q'){
                console.log("Világos vezér " + coordinates_2D[0][j] + coordinates_2D[1][7-i] + '-n!');
            }
            else if(positions_of_figures_list[i][j]==='b'){
                console.log("Sötét futó " + coordinates_2D[0][j] + coordinates_2D[1][7-i] + '-n!');
            }
            else if(positions_of_figures_list[i][j]==='B'){
                console.log("Világos futó " + coordinates_2D[0][j] + coordinates_2D[1][7-i] + '-n!');
            }
            else if(positions_of_figures_list[i][j]==='n'){
                console.log("Sötét huszár " + coordinates_2D[0][j] + coordinates_2D[1][7-i] + '-n!');
            }
            else if(positions_of_figures_list[i][j]==='N'){
                console.log("Világos huszár " + coordinates_2D[0][j] + coordinates_2D[1][7-i] + '-n!');
            }
            else if(positions_of_figures_list[i][j]==='r'){
                console.log("Sötét bástya " + coordinates_2D[0][j] + coordinates_2D[1][7-i] + '-n!');
            }
            else if(positions_of_figures_list[i][j]==='R'){
                console.log("Világos bástya " + coordinates_2D[0][j] + coordinates_2D[1][7-i] + '-n!');
            }
            else if(positions_of_figures_list[i][j]==='p'){
                console.log("Sötét gyalog " + coordinates_2D[0][j] + coordinates_2D[1][7-i] + '-n!');
            }
            else if(positions_of_figures_list[i][j]==='P'){
                console.log("Világos gyalog " + coordinates_2D[0][j] + coordinates_2D[1][7-i] + '-n!');
            }
        }
    }
}

function coordinates(coordinate, list){ //pl. a4
    list= positions_of_figures_list
    coordinate.split('');
    for(let i=0; i<8; i++){
        for(let j=0; j<8; j++){
            if(coordinate[0]===coordinates_2D[0][j] && coordinate[1] === coordinates_2D[1][7-i]){
                if(positions_of_figures_list[i][j]==='k'){
                console.log(coordinate+": Sötét király");
            }
            else if(positions_of_figures_list[i][j]==='K'){
                console.log(coordinate+": Világos király");
            }
            else if(positions_of_figures_list[i][j]==='q'){
                console.log(coordinate+": Sötét vezér");
            }
            else if(positions_of_figures_list[i][j]==='Q'){
                console.log(coordinate+": Világos vezér");
            }
            else if(positions_of_figures_list[i][j]==='b'){
                console.log(coordinate+": Sötét futó");
            }
            else if(positions_of_figures_list[i][j]==='B'){
                console.log(coordinate+": Világos futó");
            }
            else if(positions_of_figures_list[i][j]==='n'){
                console.log(coordinate+": Sötét huszár");
            }
            else if(positions_of_figures_list[i][j]==='N'){
                console.log(coordinate+": Világos huszár");
            }
            else if(positions_of_figures_list[i][j]==='r'){
                console.log(coordinate+": Sötét bástya");
            }
            else if(positions_of_figures_list[i][j]==='R'){
                console.log(coordinate+": Világos bástya");
            }
            else if(positions_of_figures_list[i][j]==='p'){
                console.log(coordinate+": Sötét gyalog");
            }
            else if(positions_of_figures_list[i][j]==='P'){
                console.log(coordinate+": Világos gyalog");
            }
            else console.log(coordinate+": Semmi");
            }
        }
    }
}


function check(row, col) {
    let coordinates = coordinates_2D[0][col] + coordinates_2D[1][7 - row];
    if (positions_of_figures_list[row][col].includes(white_figures)) {

    } else {

    }
}

