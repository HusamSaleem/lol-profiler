const server_link = "https://league-profiler.herokuapp.com";

let playerInfo = {}; // Stores summoner information like id, name, level, etc...
let queueTypes = {};
let matchIndex = 0;

async function getAllSummonerInfo() {
    let name = document.getElementById("summonerNameInput").value;

    if (name.length < 3 || name.length > 16) {
        showErrorPopup("Name is too short or too long!");
        return;
    }

    hideProfileAndTable();
    showLoader();

    await fetch(server_link + `/api/summoner/info/all/${name}`, {
        method: 'GET',
    })
        .then(function (res) {
            console.log(res.status);
            if (res.status == 200) {
                res.json().then(function (data) {
                    playerInfo = data;
                    updateProfile();
                    resetArrows();
                    updateMatchTable(playerInfo['matchesInfo'], matchIndex);
                });
            } else if (res.status == 400) {
                // Bad client info, usually incorrect username
                showErrorPopup("That summoner doesn't exist!");
            } else if (res.status == 404) {
                // Bad url
                showErrorPopup("Bad API call! Try again");
            } else if (res.status == 502) {
                // Can't connect to server
                showErrorPopup("Couldn't connect to server :(");
            }
        }).catch(e => showErrorPopup("Unexpected error has happened! (Server possibly down)"));

    hideLoader();
}

function updateProfile() {
    if (playerInfo["name"] == null) {
        return;
    }

    document.getElementsByClassName("playerProfile")[0].style.visibility = 'visible';
    document.getElementById("name").innerText = playerInfo['name'];
    document.getElementById("level").innerText = "Level: " + playerInfo['summonerLevel'];

    if (playerInfo['rank'] != null) {
        document.getElementById("rank").innerText = playerInfo['tier'] + " " + playerInfo['rank'];
        document.getElementById("winsLosses").innerText = playerInfo['wins'] + "W " + playerInfo['losses'] + "L";
        let winRatio = playerInfo['wins'] + playerInfo['losses'];
        winRatio = Math.ceil((playerInfo['wins'] / winRatio) * 100);

        document.getElementById("winRatio").innerText = "Win Ratio: " + winRatio + "%";
        document.getElementById("leaguePoints").innerText = playerInfo['leaguePoints'] + " LP";
    } else {
        document.getElementById("rank").innerText = "UNRANKED";
    }
}

function updateMatchTable(match, curMatch) {
    if (match == null || match.length == 0 || curMatch < 0 || curMatch > 19) {
        showErrorPopup("Player has no matches!");
        hideArrows();
        return;
    }

    clearRows();
    document.getElementsByClassName("tableContainer")[0].style.visibility = 'visible';
    let table = document.getElementsByClassName("matchTable")[0].getElementsByTagName('tbody')[0];

    let gameType = match[curMatch]["queueId"];
    document.getElementById("gameMetaData").innerText = queueTypes[gameType]
    updateMatchMetaData(match, curMatch);

    for (let i = 0; i < match[curMatch]['allPlayers'].length; i++) {
        let row = table.insertRow();
        let name = row.insertCell(-1);
        let championName = row.insertCell(-1);
        let kda = row.insertCell(-1);
        let cs = row.insertCell(-1);
        let damage = row.insertCell(-1);
        let goldEarned = row.insertCell(-1);
        let win = row.insertCell(-1);

        name.innerText = match[curMatch]['allPlayers'][i]['summonerName'];
        championName.innerText = match[curMatch]['allPlayers'][i]['championName'];
        kda.innerText = match[curMatch]['allPlayers'][i]['kills'] + " / " + match[curMatch]['allPlayers'][i]['deaths'] + " / " + match[curMatch]['allPlayers'][i]['assists'];
        cs.innerText = match[curMatch]['allPlayers'][i]['cs'];
        damage.innerText = match[curMatch]['allPlayers'][i]['totalDamageDealtToChampions'];
        goldEarned.innerText = match[curMatch]['allPlayers'][i]['goldEarned'];
        win.innerText = match[curMatch]['allPlayers'][i]['win'];
    }
}

function updateMatchMetaData(match, curMatch) {
    let date = new Date(match[curMatch]['gameCreation']).toLocaleDateString();
    let duration = new Date(match[curMatch]['gameDuration']);
    let minutes = duration.getMinutes();
    let seconds = duration.getSeconds();

    console.log(`Game started on ${date} and lasted for ${minutes}:${seconds}`);
    document.getElementById("gameMetaData").innerText += ` (${date}) (${minutes}m ${seconds}s Game Duration)`

}

function resetArrows() {
    matchIndex = 0;
    document.getElementById("prevGameBtn").style.visibility = 'hidden';
    document.getElementById("nextGameBtn").style.visibility = 'visible';
}

function loadNextMatchInfo() {
    if (matchIndex < 20 && playerInfo['matchesInfo'][matchIndex + 1] != null) {
        matchIndex++;
    } else {
        return;
    }

    document.getElementById("prevGameBtn").style.visibility = 'visible';
    clearRows();
    updateMatchTable(playerInfo['matchesInfo'], matchIndex);

    if (matchIndex == 19 || playerInfo['matchesInfo'][matchIndex + 1] == null) {
        document.getElementById("nextGameBtn").style.visibility = 'hidden';
    } else {
        document.getElementById("nextGameBtn").style.visibility = 'visible';
    }
}

function loadPrevMatchInfo() {
    if (matchIndex - 1 >= 0 && playerInfo['matchesInfo'][matchIndex - 1] != null) {
        matchIndex--;
    } else {
        return;
    }

    document.getElementById("nextGameBtn").style.visibility = 'visible';
    clearRows();
    updateMatchTable(playerInfo['matchesInfo'], matchIndex);

    if (matchIndex == 0 || playerInfo['matchesInfo'][matchIndex - 1] == null) {
        document.getElementById("prevGameBtn").style.visibility = 'hidden';
    } else {
        document.getElementById("prevGameBtn").style.visibility = 'visible';
    }
}

function clearRows() {
    let tbody = document.getElementsByClassName("matchTable")[0].getElementsByTagName("tbody")[0];
    for (let i = 0; i < 10; i++) {
        try {
            tbody.deleteRow(0);
        } catch (e) {
            break;
        }
    }
}

function showErrorPopup(message) {
    closeErrorPopup(); // S multiple errors dont stack

    let errorPopup = document.getElementsByClassName("alert")[0];
    errorPopup.classList.remove("hide");
    errorPopup.classList.add("show");

    document.getElementsByClassName("msg")[0].innerText = message;
}

function hideProfileAndTable() {
    clearRows();
    document.getElementsByClassName("playerProfile")[0].style.visibility = 'hidden';
    document.getElementsByClassName("tableContainer")[0].style.visibility = 'hidden';
    hideArrows();
}

function hideArrows() {
    document.getElementById("prevGameBtn").style.visibility = 'hidden';
    document.getElementById("nextGameBtn").style.visibility = 'hidden';
}

function showLoader() {
    let loader = document.getElementsByClassName("loading-spinner")[0];
    loader.classList.remove("hide");
    loader.classList.add("show");
}

function hideLoader() {
    let loader = document.getElementsByClassName("loading-spinner")[0];
    loader.classList.add("hide");
    loader.classList.remove("show");
}

function closeErrorPopup() {
    let errorPopup = document.getElementsByClassName("alert")[0];
    errorPopup.classList.remove("show");
    errorPopup.classList.add("hide");
}

function addInputEnterListener() {
    let input = document.getElementById("summonerNameInput");

    input.addEventListener("keyup", e => {
        if (e.key == 'Enter') {
            e.preventDefault();
            getAllSummonerInfo();
        }
    });
}

function readTextFile(file, callback) {
    let rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status === 200) {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function initQueueTypes() {
    readTextFile("./queueType.json", function (text) {
        let data = JSON.parse(text);

        data.forEach(function (queue) {
            queueTypes[queue.queueId] = queue.description;
        })
    });
}

initQueueTypes();
addInputEnterListener();