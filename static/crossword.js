

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
  
  function genCrossword(crosswordData) {
    crosswordData.sort((a, b) => a.answer.length - b.answer.length).reverse();
    maxLength = crosswordData[0].answer.length * 2;

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
        crosswordData[0].answer,
        solutionGrid,
        Math.floor(maxLength / 2),
        Math.floor(maxLength / 2) - Math.floor(crosswordData[0].answer.length / 2),
      );
      answerLocations.push({
        "answer": crosswordData[0].answer,
        "x": Math.floor(maxLength / 2),
        "y": Math.floor(maxLength / 2) - Math.floor(crosswordData[0].answer.length / 2),
        "length": crosswordData[0].answer.length,
        "orient": 1, 
        "location": "",
        "desc": crosswordData[0].desc
      });
    } else {
      writeVer(
        crosswordData[0].answer,
        solutionGrid,
        Math.floor(maxLength / 2) - Math.floor(crosswordData[0].answer.length / 2),
        Math.floor(maxLength / 2),
      );
      answerLocations.push({
        "answer": crosswordData[0].answer,
        "x": Math.floor(maxLength / 2) - Math.floor(crosswordData[0].answer.length / 2),
        "y": Math.floor(maxLength / 2),
        "length": crosswordData[0].answer.length,
        "orient": 0,
        "location": "",
        "desc": crosswordData[0].desc
      });
    }

    crosswordData.splice(0, 1);
    
    let loopingPlaced = true;

    
    while (loopingPlaced) {
      // attempt to place all words until there are no more valid spots
      loopingPlaced = false;
      for (let i = 0; i < crosswordData.length; i++) {
        let word = crosswordData[i];
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
            crosswordData.splice(i, 1);
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
            crosswordData.splice(i, 1);
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
              answerLocations[i].location = "" + counter + " Down"
              counter++;
            }
            else {
              answerLocations[i].location = "" + answerGrid[answerLocation.x][answerLocation.y] + " Down"
            }

          }
          else if (answerGrid[answerLocation.x + x][answerLocation.y] == "-") {
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
              answerLocations[i].location = "" + counter + " Across"
              counter++;
            }
            else {
              answerLocations[i].location = "" + answerGrid[answerLocation.x][answerLocation.y] + " Across"
            }
          }
          else if (answerGrid[answerLocation.x][answerLocation.y + y] == "-") {
            // normal cells
            answerGrid[answerLocation.x][answerLocation.y + y] = "#";
          }  
        }
      }
    }
    // generate the answer grid based on the solution grid
    // ... 
    // need to be able to order the words in the grid by their number
    // eg 6 down, 6 across etc
    // index the words for solving
    let crosswordOutput = {
      "answerLocations": answerLocations,
      "answerGrid": answerGrid,
      "solutionGrid": solutionGrid
    }
    return crosswordOutput;
  }
  
  const myCrosswordData = data = [
    {"answer": "orange", "desc": "Both a fruit and a colour"},
    {"answer": "oval",   "desc": "Stretched circle"},
    {"answer": "northern", "desc": "Opposite of southern"},
    {"answer": "apple", "desc": "Tech company known for phones"},
    {"answer": "strawberry", "desc": "Fruit bearing seeds on the outside"},
    {"answer": "yellow", "desc": "Colour of a submarine"},
    {"answer": "gigantic", "desc": "Extremely large"},
    {"answer": "connection", "desc": "A link between two things"},
    {"answer": "address", "desc": "Representing location"},
    {"answer": "dictionary", "desc": "Book of many words"}
]
  console.log(myCrosswordData)
  let newCrossword = genCrossword(myCrosswordData);

  console.log(newCrossword.answerLocations);
  console.log("\n");
  console.log(newCrossword.solutionGrid.map((row) => row.join(" ")).join("\n"));
  console.log("\n");
  console.log(newCrossword.answerGrid.map((row) => row.join(" ")).join("\n"));
