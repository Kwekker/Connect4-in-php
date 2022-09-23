const colors = ["red", "yellow", "#777"];
let myName;
let opponent;
let key;
let addButtons = false;
let interval;

const States = {
    start: 0,
    waiting: 1,
    playing: 2
}
let state = 0;


function update() {
    console.log("update");
    if(state == States.waiting) {
        if(!addButtons) {
            $.ajax({
                type: "POST",
                url: "choose.php",
                data: {can: 1, name: myName},
                success: function(data) {
                    if(data === "1") addButtons = true;
                    else if(data !== "0") {
                        opponent = data;
                        startPlaying();
                    }
                },
            });
        }
        makeQueue();
    }
    $.ajax({
        type: "POST",
        url: "update.php",
        data: {name: myName, key: key},
        success: function (data) {
            console.log(data);
            if(data == "badkey") {
                alert("Your connection timed out. You have been kicked out of the queue. I'm sorry :(");
                location.reload();
            }
        }

    });
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

    if(data == "badname") {
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

function changeColor(x, y, color) {
    $("#c"+x+" :nth-child("+y+")").css("background-color", colors[color]);
}