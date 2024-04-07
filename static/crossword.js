let crosswordData = {};

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  
  function writeHor(word, solutionGrid, x, y) {
    for (let i = 0; i < word.length; i++) {
      solutionGrid[x][y + i] = word[i];
    }
  }
  
  function writeVer(word, solutionGrid, x, y) {
    for (let i = 0; i < word.length; i++) {
      solutionGrid[x + i][y] = word[i];
    }
  }
  
  function checkVer(word, solutionGrid, x, y) {
    for (let i = 0; i < word.length; i++) {
      try {
        // check if overlap
        // then check if
        // check for starting letter
        if (i == 0) {
          if (cellOccupied(solutionGrid, x + i - 1, y)) {
            return false;
          }
        }
  
        // check for ending letter
        if (i == word.length - 1) {
          if (cellOccupied(solutionGrid, x + i + 1, y)) {
            return false;
          }
        }
  
        if (solutionGrid[x + i][y] != word[i]) {
          // check for letter adjacencies
          if (
            cellOccupied(solutionGrid, x + i, y) ||
            cellOccupied(solutionGrid, x + i, y + 1) ||
            cellOccupied(solutionGrid, x + i, y - 1)
          ) {
            return false;
          }
        }
      } catch {
        return false;
      }
    }
    return true;
  }
  
  function checkHor(word, solutionGrid, x, y) {
    for (let i = 0; i < word.length; i++) {
      try {
        // check if overlap
        // then check if
        // check for starting letter
        if (i == 0) {
          if (cellOccupied(solutionGrid, x, y + i - 1)) {
            return false;
          }
        }
  
        // check for ending letter
        if (i == word.length - 1) {
          if (cellOccupied(solutionGrid, x, y + i + 1)) {
            return false;
          }
        }
  
        if (solutionGrid[x][y + i] != word[i]) {
          // check for letter adjacencies
          if (
            cellOccupied(solutionGrid, x, y + i) ||
            cellOccupied(solutionGrid, x - 1, y + i) ||
            cellOccupied(solutionGrid, x + 1, y + i)
          ) {
            return false;
          }
        }
      } catch (err) {
        console.log(err);
        return false;
      }
    }
    return true;
  }
  
  function cellOccupied(solutionGrid, x, y) {
    if (x < 0 || y < 0 || x >= solutionGrid.length || y >= solutionGrid.length) {
      return true;
    }
    if (solutionGrid[x][y] != "-") {
      return true;
    }
    return false;
  }

  function sortTopDown (a,b) {
    if (a.x == b.x) {
      return (a.y - b.y)
    }
    else return (a.x - b.x)
  }
  
  function genCrossword(inputData) {
    inputData.sort((a, b) => a.answer.length - b.answer.length).reverse();
    maxLength = inputData[0].answer.length * 2;

    const answerGrid = Array.from({ length: maxLength }, () =>
    Array.from({ length: maxLength }, () => "-"),
    );

    const solutionGrid = Array.from({ length: maxLength }, () =>
      Array.from({ length: maxLength }, () => "-"),
    );

    const answerLocations = []
  
    // create solutionGrid
    // place first word in the centre
    // randomly choose if vertical or horizontal
    if (randInt(0, 1) == 0) {
      writeHor(
        inputData[0].answer,
        solutionGrid,
        Math.floor(maxLength / 2),
        Math.floor(maxLength / 2) - Math.floor(inputData[0].answer.length / 2),
      );
      answerLocations.push({
        "answer": inputData[0].answer,
        "x": Math.floor(maxLength / 2),
        "y": Math.floor(maxLength / 2) - Math.floor(inputData[0].answer.length / 2),
        "length": inputData[0].answer.length,
        "orient": 1, 
        "location": "",
        "desc": inputData[0].desc
      });
    } else {
      writeVer(
        inputData[0].answer,
        solutionGrid,
        Math.floor(maxLength / 2) - Math.floor(inputData[0].answer.length / 2),
        Math.floor(maxLength / 2),
      );
      answerLocations.push({
        "answer": inputData[0].answer,
        "x": Math.floor(maxLength / 2) - Math.floor(inputData[0].answer.length / 2),
        "y": Math.floor(maxLength / 2),
        "length": inputData[0].answer.length,
        "orient": 0,
        "location": "",
        "desc": inputData[0].desc
      });
    }

    inputData.splice(0, 1);
    
    let loopingPlaced = true;

    
    while (loopingPlaced) {
      // attempt to place all words until there are no more valid spots
      loopingPlaced = false;
      for (let i = 0; i < inputData.length; i++) {
        let word = inputData[i];
        let connections = [];
        // for each letter in the word
        for (let j = 0; j < word.answer.length; j++) {
          // for each cell in the solutionGrid
          for (let x = 0; x < maxLength; x++) {
            for (let y = 0; y < maxLength; y++) {
              // compare the cell to the letter
              if (solutionGrid[x][y] == word.answer[j]) {
                // if there is a match, save it
                connections.push({ x: x, y: y, index: j });
              }
            }
          }
        }
  
        // shuffle connections 
        connections.sort((a, b) => 0.5 - Math.random());

        for (let c = 0; c < connections.length; c++) {
          let connection = connections[c];

          // move to the first cell where the word would be written
          let firstX = connection.x - connection.index;
          let firstY = connection.y - connection.index;

          // check vertical connections first
          if (checkVer(word.answer, solutionGrid, firstX, connection.y)) {
            writeVer(word.answer, solutionGrid, firstX, connection.y);
            answerLocations.push({
              "answer": word.answer,
              "x": firstX,
              "y": connection.y,
              "length": word.answer.length,
              "orient": 0, 
              "location": "",
              "desc": word.desc
            });
            loopingPlaced = true;
            inputData.splice(i, 1);
            break;
          }
  
          // check horizontal connections next
          else if (checkHor(word.answer, solutionGrid, connection.x, firstY)) {
            writeHor(word.answer, solutionGrid, connection.x, firstY);
            answerLocations.push({
              "answer": word.answer,
              "x": connection.x,
              "y": firstY,
              "length": word.answer.length,
              "orient": 1,
              "location": "",
              "desc": word.desc
            });
            loopingPlaced = true;
            inputData.splice(i, 1);
            break;
          }
        }
      }
    }
    
    answerLocations.sort(sortTopDown);
    // counter for the crossword number
    let counter = 1;
    for (let i = 0; i < answerLocations.length; i++) {
      // put numbers and blank spaces where answers should go
      answerLocation = answerLocations[i]
      if (answerLocation.orient == 0) {
        // vertical
        for (let x = 0; x < answerLocation.length; x++) {
          if (x == 0) {
            if (isNaN(answerGrid[answerLocation.x][answerLocation.y])) {
              answerGrid[answerLocation.x + x][answerLocation.y] = "" + counter
              answerLocations[i].location = counter + " Down"
              counter++;
            }
            else {
              answerLocations[i].location = "" + answerGrid[answerLocation.x][answerLocation.y] + " Down"
            }

          }
          else if (isNaN(answerGrid[answerLocation.x + x][answerLocation.y])) {
            // normal cells
            answerGrid[answerLocation.x + x][answerLocation.y] = "#";
          }
        }
      }

      else {
        // horizontal
        for (let y = 0; y < answerLocation.length; y++) {
          if (y == 0) {
            if (isNaN(answerGrid[answerLocation.x][answerLocation.y])) {
              answerGrid[answerLocation.x][answerLocation.y + y] = "" + counter
              answerLocations[i].location = counter + " Across"
              counter++;
            }
            else {
              answerLocations[i].location = "" + answerGrid[answerLocation.x][answerLocation.y] + " Across"
            }
          }
          else if (isNaN(answerGrid[answerLocation.x][answerLocation.y + y])) {
            // normal cells
            answerGrid[answerLocation.x][answerLocation.y + y] = "#";
          }  
        }
      }
    }

    let crosswordOutput = {
      "answerLocations": answerLocations,
      "answerGrid": answerGrid,
      "solutionGrid": solutionGrid
    }
    return crosswordOutput;
  }

function drawCrossword(crosswordInput) {
  crosswordData = genCrossword(crosswordInput);
  
  const table = document.createElement("table");
  table.id = "crossword-table";

  // create table from 2d array
  for (let i = 0; i < crosswordData.solutionGrid.length; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < crosswordData.solutionGrid[i].length; j++) {
      const cell = document.createElement("td")
      const cellDiv = document.createElement("div")
      if (crosswordData.answerGrid[i][j] == "-") {
        cellDiv.className = "relative bg-black w-8 h-8 border border-gray-400 flex items-center justify-center";
      } 
      else {
        // mark cells that will be checked for answers later
        cell.id = "cell-answer"

        cellDiv.className = "relative bg-white w-8 h-8 border border-gray-400 flex items-center justify-center";
        const cellInput = document.createElement("input");
        cellInput.type = "text";
        cellInput.className = "w-full h-full border-none text-center";

        let cellMarkerText = crosswordData.answerGrid[i][j];

        // give the numbered cells their numbers
        if (cellMarkerText != "#") {
          const cellMarker = document.createElement("span");
          cellMarker.className ="absolute top-0 left-0 text-gray-700 p-1 text-xs";
          cellMarker.textContent = cellMarkerText;
          cellDiv.appendChild(cellMarker);
        }

        cellDiv.appendChild(cellInput);

      }
      
      cell.appendChild(cellDiv);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  const acrossDiv = document.createElement("div");
  acrossDiv.className = "w-1/2 overflow-y-scroll";
  const acrossList = document.createElement("ul");
  acrossList.className = "list-disc pl-4";
  for (let i = 0; i < crosswordData.answerLocations.length; i++) {
    const acrossItem = document.createElement("li");
    acrossItem.textContent = crosswordData.answerLocations[i].location + ": " + crosswordData.answerLocations[i].desc ;
    acrossList.appendChild(acrossItem);
  }
  
  /*
  const downDiv = document.createElement("div");
  acrossDiv.className = "w-1/2";
  */

  crosswordGrid = document.getElementById("crossword-grid");
  crosswordGrid.appendChild(table);

  crosswordHints = document.getElementById("crossword-hints");
  crosswordHints.appendChild(acrossList);
}

function checkAnswer() {
  let answers = [];

  const result = document.getElementById("hello");
  const test = document.getElementById("test");
  const table = document.getElementById("crossword-table");
  console.log("Hello");

  for(let i = 0; i < table.rows.length; i++) {
    let answerRow = [];
    const row = table.rows[i];
    for (let j = 0; j < table.rows.length; j++) {
      const cell = row.cells[j];
      if (cell.id == "cell-answer") {
        // get the input, which is in the div in the cell
        const cellInput = cell.lastChild.lastChild;
        answerRow.push(cellInput.value);
      }
      else {
        answerRow.push("-");
      }
    }
    answers.push(answerRow);
  }

  // test if answers are the same
  let answerCheck = true;
  for (let i = 0; i < crosswordData.solutionGrid.length; i++) {
    for (let j = 0; j < crosswordData.solutionGrid[i].length; j++) {
      if (answers[i][j] != crosswordData.solutionGrid[i][j]) {
        answerCheck = false;
      }
    }
  }

  result.textContent = answerCheck;
  test.textContent = answers.map(row => row.join(' ')).join('!');
}