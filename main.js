const colors = ["#777", "red", "yellow"];
let myName;
let opponent;
let key;
let addButtons = false;
let interval;
let debugThing;
let board;

const States = {
    start: 0,
    waiting: 1,
    playing: 2
}
let state = 0;

addEventListener('beforeunload', (event) => {
    $.ajax({
        type: "POST",
        url: "update.php",
        data: {leave: 1, name: myName, key: key}
    });
});

function update() {
    if(state == States.waiting) {
        console.log("Wait update");
        if(!addButtons) {
            $.ajax({
                type: "POST",
                url: "choose.php",
                data: {can: 1, name: myName},
                success: function(data) {
                    if(data == "1") addButtons = true;
                    else if(data != "0") {
                        console.log("Started playing against " + data);
                        opponent = data;
                        startPlaying();
                    }
                },
            });
        }
        makeQueue();
    }
    else {
        console.log("Play update");
        updateBoard();
    }

    $.ajax({
        type: "POST",
        url: "update.php",
        data: {name: myName, key: key},
        success: function (data) {
            console.log(data);
            if(data == "badkey") {
                badKey();
            }
        }

    });
}


function updateBoard() {
    fetch('data/board.dat?r=' + Math.random()).then((response) => response.arrayBuffer()).then((array) => {
        board = new Uint8Array(array);
        for(let j = 0; j < 6; j++) {
            for(let i = 0; i < 7; i++) {
                if(board[j * 7 + i]) {
                    changeColor(i, j, (0x0f & board[j * 7 + i]));
                }
            }
        }
    });
}


function drop(col) {
    if(state == States.playing) {
        console.log("Dropping piece on col " + col + "...");
        $.ajax({
            type: "POST",
            url: "drop.php",
            data: {name: myName, key: key, col: col},

            success: function (data) {
                let str = data + "";
                console.log(str);
                if(str == "badkey") badKey();
                else if(str == "badturn") {
                    gameMessage("It's not your turn nerd");
                }
                else if(str == "fullcol") {
                    gameMessage("That column is already filled to the brim");
                }
                else {
                    changeColor(col, str.substring(1) & 0xf, !(str.charAt(0) & 0xf) + 1);
                }
            }
        });
    }
}


function makeQueue() {
    let queue = $("#queue");
    queue.empty();
    fetch('data/queue.txt?r=' + Math.random()).then((response) => response.text()).then((text) => {
        let array = text.split(":");
        for(let name of array) {
            name = name.trim();
            if(name.length < 2) continue;

            let el;
            if(!addButtons) {
                el = document.createElement("div");
                el.onclick = "chooseOpponent"
            }
            else el = document.createElement("button");

            if (name == myName)
                queue.append("<div class='me'>" + name + "</div>");
            else if(!addButtons) 
                queue.append("<div>" + name + "</div>");
            else
                queue.append("<button onclick='chooseOpponent(\"" + name + "\")'>" + name + "</button>");
        }
    });
}

function chooseOpponent(oppo) {
    $.ajax({
        type: "POST",
        url: "choose.php",
        data: {name: myName, key: key, oppo: oppo},
        success: function(data) {
            if(data == "yes") {
                opponent = oppo;
                addButtons = false;
                startPlaying();
            }
        },
    });
}

function startPlaying() {
    state = States.playing;
    let sideInfo = $("#sideinfo");
    sideInfo.empty();
    sideInfo.append("<h2>" + myName + "</h2><hr><h3>Playing against " + opponent + "</h3><div class='queue' id='queue'></div>");
}

function submitName(event) {
    myName = $("#name").val();
    $.ajax({
        type: "POST",
        url: "addme.php",
        data: {name: myName},
        success: recKey,
    });
    event.preventDefault();
    return false;
}

function recKey(data) {
    console.log("key = " + data);
    if(data == "taken") {
        $("#message").text("That name was already taken.");
        return;
    }

    if(data == "cringe") {
        $("#message").text("That name is cringe.");
        return;
    }

    key = data;
    state = States.waiting;

    console.log($("#sideinfo"));
    $("#sideinfo").empty();
    $("#sideinfo").append("<h2>" + myName + "</h2><hr><h3>Waiting in queue:</h3><div class='queue' id='queue'></div>");
    $("#message").empty();

    makeQueue();
    if(interval == undefined) interval = setInterval(update, 3500);
}

function gameMessage(message) {
    $("#gameMessage").text(message);
    setTimeout(() => {
        $("#gameMessage").empty();
    }, 2000);
}

function badKey() {
    console.log("Nah if you're seeing this you were probably trying to hack into the mainframe weren't you? Silly little goose");
    alert("Your connection timed out. You have been kicked out of the queue/game. I'm sorry :(");
    location.reload();
}

function changeColor(x, y, color) {
    if(colors[color] == undefined) console.log(color, " is not a color I know sadly");
    console.log(x, y, color);
    $("#c"+ x +" :nth-child("+ (y + 1) +")").css("background-color", colors[color]);
}