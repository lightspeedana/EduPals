

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  
  function writeVer(word, solutionGrid, x, y) {
    for (let i = 0; i < word.length; i++) {
      solutionGrid[x][y + i] = word[i];
    }
  }
  
  function writeHor(word, solutionGrid, x, y) {
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
  
  function genCrossword(words) {
    words = words.sort((a, b) => a.length - b.length).reverse();
    maxLength = words[0].length * 2;

    const answerGrid = Array.from({ length: maxLength }, () =>
    Array.from({ length: maxLength }, () => "-"),
    );

    const solutionGrid = Array.from({ length: maxLength }, () =>
      Array.from({ length: maxLength }, () => "-"),
    );
  
    // create solutionGrid
    // place first word in the centre
    // randomly choose if vertical or horizontal
    if (randInt(0, 1) == 0) {
      writeVer(
        words[0],
        solutionGrid,
        Math.floor(maxLength / 2),
        Math.floor(maxLength / 2) - Math.floor(words[0].length / 2),
      );
    } else {
      writeHor(
        words[0],
        solutionGrid,
        Math.floor(maxLength / 2) - Math.floor(words[0].length / 2),
        Math.floor(maxLength / 2),
      );
    }

    words.splice(0, 1);
  
    let loopingPlaced = true;
    while (loopingPlaced) {
      // attempt to place all words until there are no more valid spots
      loopingPlaced = false;
      for (let i = 0; i < words.length; i++) {
        let word = words[i];
        let connections = [];
        // for each letter in the word
        for (let j = 0; j < word.length; j++) {
          // for each cell in the solutionGrid
          for (let x = 0; x < maxLength; x++) {
            for (let y = 0; y < maxLength; y++) {
              // compare the cell to the letter
              if (solutionGrid[x][y] == word[j]) {
                // if there is a match, save it
                connections.push({ x: x, y: y, index: j });
              }
            }
          }
        }
  
        // shuffle connections 
        connections = connections.sort((a, b) => 0.5 - Math.random());

        for (let c = 0; c < connections.length; c++) {
          let connection = connections[c];

          // move to the first cell where the word would be written
          let firstX = connection["x"] - connection["index"];
          let firstY = connection["y"] - connection["index"];

          // check vertical connections first
          if (checkVer(word, solutionGrid, firstX, connection["y"])) {
            writeHor(word, solutionGrid, firstX, connection["y"]);
            loopingPlaced = true;
            words.splice(i, 1);
            break;
          }
  
          // check horizontal connections next
          else if (checkHor(word, solutionGrid, connection["x"], firstY)) {
            writeVer(word, solutionGrid, connection["x"], firstY);
            loopingPlaced = true;
            words.splice(i, 1);
            break;
          }
        }
      }
    }
  
    // generate the answer grid based on the solution grid
    // ... 
    // need to be able to order the words in the grid by their number
    // eg 6 down, 6 across etc
    // index the words for solving
    return solutionGrid;
  }
  
  const myWords = ["orange", "oval", "northern", "apple", "strawberry", "yellow", "gigantic", "connection", "address", "dictionary"];
  console.log(myWords)
  let newGrid = genCrossword(myWords);
  console.log(newGrid.map((row) => row.join(" ")).join("\n"));
  