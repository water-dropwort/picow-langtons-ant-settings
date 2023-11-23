const MAX_ANT_COUNT = 10;

// Create a table for entering ants' parameters.
document.addEventListener("DOMContentLoaded", function() {
    let antParametersTableBody = document
        .getElementById("antParametersTable")
        .getElementsByTagName('tbody')[0];

    for (let i = 0; i < MAX_ANT_COUNT; i++) {
        let row = antParametersTableBody.insertRow(i);

        // Enable
        let cell0 = row.insertCell(0);
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "ant-enable[" + i + "]";
        cell0.appendChild(checkbox);

        // X Initial Position
        let cell1 = row.insertCell(1);
        let xPositionInput = document.createElement("input");
        xPositionInput.type = "number";
        xPositionInput.id = "ant-xposition[" + i + "]";
        cell1.appendChild(xPositionInput);

        // Y Initial Position
        let cell2 = row.insertCell(2);
        let yPositionInput = document.createElement("input");
        yPositionInput.type = "number";
        yPositionInput.id = "ant-yposition[" + i + "]";
        cell2.appendChild(yPositionInput);

        // Direction
        let cell3 = row.insertCell(3);
        let directions = ["east", "west", "north", "south"];
        for (let j = 0; j < directions.length; j++) {
            let directionInput = document.createElement("input");
            directionInput.type = "radio";
            directionInput.name = "ant-direction[" + i + "]";
            directionInput.value = directions[j];
            if (j === 0) {
                directionInput.checked = true;
            }

            let label = document.createElement("label");
            label.appendChild(directionInput);
            label.appendChild(document.createTextNode(" " + directions[j]));

            cell3.appendChild(label);
        }
    }
});

// Send the request.
function submitForm() {
    // Destination URL
    const url = document.getElementById("url").value;
    if(url == "") {
        alert("The URL is blank.");
        return;
    }

    // Rule
    let json = {}
    const rule = document.getElementById("rule").value;
    let ruleNum = 0;
    if(rule.length < 1) {
        alert("The length of the rule is less than 1.");
        return;
    }
    else {
        for(i = 0; i < rule.length; i++) {
            let c = rule.charAt(i);
            if(c == 'L')
                ruleNum = (0 << (i * 2)) | ruleNum;
            else if(c == 'R')
                ruleNum = (1 << (i * 2)) | ruleNum;
            else if(c == 'N')
                ruleNum = (2 << (i * 2)) | ruleNum;
            else if(c == 'T')
                ruleNum = (3 << (i * 2)) | ruleNum;
            else {
                alert("The rule contains invalid characters.");
                return;
            }
        }
    }
    
    const ruleJson = {
        "length" : rule.length,
        "rule" : ruleNum
    }

    // Ants' parameters
    let antParams = [];
    for(i = 0; i < MAX_ANT_COUNT; i++) {
        if(false == document.getElementById("ant-enable[" + i + "]").checked) { continue; }

        let p = 0;
        // Directoin
        dir = document.querySelector('input[name="ant-direction[' + i + ']"]:checked').value;
        if(dir == "north")
            p = 0;
        else if(dir == "east")
            p = 1;
        else if(dir == "south")
            p = 2;
        else if(dir == "west")
            p = 3;
        else
            return;

        // X Initial Position
        xpos = parseInt(document.getElementById("ant-xposition[" + i + "]").value);
        if(isNaN(xpos)) {
            alert("The X initial position is not a number.");
            return;
        }
        else
            p = ((xpos & 0xFF) << 2) | p;

        // Y Initial Position
        ypos = parseInt(document.getElementById("ant-yposition[" + i + "]").value);
        if(isNaN(ypos)) {
            alert("The Y initial position is not a number.");
            return;
        }
        else
            p = ((ypos & 0x1FF) << 10) | p;

        antParams.push(p);
    }

    if(antParams.length == 0) {
        alert("The number of enabled ants is zero.");
        return;
    }
    
    const antsJson = {
        "count" : antParams.length,
        "params" : antParams
    }

    // This JSON data will be sent to the Raspberry Pi Pico.
    const langtonJson = {
        "ants" : antsJson,
        "rule" : ruleJson
    };

    console.log(JSON.stringify(langtonJson));

    const request = new Request(url, {
        method:"POST",
        body: JSON.stringify(langtonJson)
    });
    request.body = JSON.stringify(langtonJson);

    console.log(request);
    
    // Send
    fetch(request)
        .then(response => response.statusText)
        .then(txt => alert(txt))
        .catch(error => console.error("Error:", error));
}
