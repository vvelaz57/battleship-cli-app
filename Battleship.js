const rs = require("readline-sync");
let battleShipFleet = [];
let renderedBoard = {};
let debugBoard = {};
let printedBoard = {};
let hitsLanded = [];

class Cell {
  constructor(gridPoint, id, hit) {
    (this.gridPoint = gridPoint), (this.id = id), (this.hit = hit);
  }
}

function createCells(gridSize, gridPoint) {
  row = [];
  for (let i = 0; i < gridSize; i++) {
    row.push(new Cell(`${gridPoint}${i}`, 0, false));
  }
  return row;
}

function createGrid(size) {
  for (let i = 0; i < size; i++) {
    const gridRow = String.fromCharCode(65 + i);
    renderedBoard[gridRow] = createCells(size, gridRow);
  }
}

function selectGridSize() {
  const gridSizes = ["4X4", "5X5", "6X6"];
  const selectSize = rs.keyInSelect(gridSizes, "Select Board Size:");
  if (selectSize > -1) {
    return selectSize + 4;
  }
}

function createDebugBoard(board) {
  //convert rendered board into debug mode
  for (const [row, cells] of Object.entries(board)) {
    debugBoard[row] = cells.map((cell) => {
      let cellStatus = `${cell.id},${cell.hit}`;
      switch (cellStatus) {
        case "0,false":
          return "-";
        case "1,true":
        case "1,false":
          return "🔵";
        case "2,true":
        case "2,false":
          return "🟠";
        case "0,true":
          return "❗";
      }
    });
  }
  console.clear();
  console.table(debugBoard);
}

function printBoard(board, debug) {
  if (debug) {
    createDebugBoard(board);
  } else {
    for (const [row, cells] of Object.entries(board)) {
      printedBoard[row] = cells.map((cell) => {
        let cellStatus = `${cell.id},${cell.hit}`;
        switch (cellStatus) {
          case "0,false":
          case "1,false":
          case "2,false":
            return "-";
          case "1,true":
            return "🔵";
          case "2,true":
            return "🟠";
          case "0,true":
            return "❗";
        }
      });
    }
    console.clear();
    console.table(printedBoard);
  }
}

function createFlatGrid(board) {
  let result = [];
  for (const [row, cells] of Object.entries(board)) {
    result.push(cells.map((cell) => cell.gridPoint));
  }
  return result.flat();
}

function enterAttackInput() {
  return rs
    .question("Make a guess eg.. A1, B2 etc...", {
      limit: createFlatGrid(renderedBoard),
      limitMessage: "Please enter a valid location",
    })
    .toUpperCase();
}

function getRandomGridPoint(board) {
  const rows = Object.keys(board);
  const selectedRow = rows[Math.floor(Math.random() * rows.length)];
  return selectedRow;
}

function placeLargeShip() {
  const verticalRows = Object.keys(renderedBoard);
  const verticalRowCount = Object.keys(renderedBoard).length;
  const selectedRow = getRandomGridPoint(renderedBoard);
  const selectedRowIndex = selectedRow.charCodeAt(0) - 65;
  const getRandomInt = (max) => Math.floor(Math.random() * max);
  const selectedColumn = getRandomInt(Object.keys(renderedBoard).length);
  const getDirection = Math.floor(Math.random() * 2);
  //Establish first grid point
  if (renderedBoard[selectedRow][selectedColumn].id === 0) {
    renderedBoard[selectedRow][selectedColumn].id = 1;
  } else {
    return placeLargeShip();
  }
  //Determine Direction
  if (getDirection > 0) {
    //horizontal
    if (selectedColumn >= verticalRowCount - 2) {
      if (renderedBoard[selectedRow][selectedColumn - 1].id === 0) {
        renderedBoard[selectedRow][selectedColumn - 1].id = 1;
      } else {
        renderedBoard[selectedRow][selectedColumn].id = 0;
        return placeLargeShip();
      }
      if (renderedBoard[selectedRow][selectedColumn - 2].id === 0) {
        renderedBoard[selectedRow][selectedColumn - 2].id = 1;
      } else {
        renderedBoard[selectedRow][selectedColumn].id = 0;
        renderedBoard[selectedRow][selectedColumn - 1].id = 0;
        placeLargeShip();
      }
    } else {
      if (renderedBoard[selectedRow][selectedColumn + 1].id === 0) {
        renderedBoard[selectedRow][selectedColumn + 1].id = 1;
      } else {
        renderedBoard[selectedRow][selectedColumn].id = 0;
        return placeLargeShip();
      }
      if (renderedBoard[selectedRow][selectedColumn + 2].id === 0) {
        renderedBoard[selectedRow][selectedColumn + 2].id = 1;
      } else {
        renderedBoard[selectedRow][selectedColumn].id = 0;
        renderedBoard[selectedRow][selectedColumn + 1].id = 0;
        placeLargeShip();
      }
    }
  } else {
    //vertical
    if (
      selectedRow === verticalRows[verticalRowCount - 2] ||
      selectedRow === verticalRows[verticalRowCount - 1]
    ) {
      if (
        renderedBoard[verticalRows[selectedRowIndex - 1]][selectedColumn].id ===
        0
      ) {
        renderedBoard[verticalRows[selectedRowIndex - 1]][
          selectedColumn
        ].id = 1;
      } else {
        renderedBoard[selectedRow][selectedColumn].id = 0;
        return placeLargeShip();
      }
      if (
        renderedBoard[verticalRows[selectedRowIndex - 2]][selectedColumn].id ===
        0
      ) {
        renderedBoard[verticalRows[selectedRowIndex - 2]][
          selectedColumn
        ].id = 1;
      } else {
        renderedBoard[selectedRow][selectedColumn].id = 0;
        renderedBoard[verticalRows[selectedRowIndex - 1]][
          selectedColumn
        ].id = 0;
        placeLargeShip();
      }
    } else {
      if (
        renderedBoard[verticalRows[selectedRowIndex + 1]][selectedColumn].id ===
        0
      ) {
        renderedBoard[verticalRows[selectedRowIndex + 1]][
          selectedColumn
        ].id = 1;
      } else {
        renderedBoard[selectedRow][selectedColumn].id = 0;
        return placeLargeShip();
      }
      if (
        renderedBoard[verticalRows[selectedRowIndex + 2]][selectedColumn].id ===
        0
      ) {
        renderedBoard[verticalRows[selectedRowIndex + 2]][
          selectedColumn
        ].id = 1;
      } else {
        renderedBoard[selectedRow][selectedColumn].id = 0;
        renderedBoard[verticalRows[selectedRowIndex + 1]][
          selectedColumn
        ].id = 0;
        placeLargeShip();
      }
    }
  }
}

function placeSmallShip() {
  const verticalRows = Object.keys(renderedBoard);
  const verticalRowCount = Object.keys(renderedBoard).length;
  let selectedRow = getRandomGridPoint(renderedBoard);
  const selectedRowIndex = selectedRow.charCodeAt(0) - 65;
  const getRandomInt = (max) => Math.floor(Math.random() * max);
  let selectedColumn = getRandomInt(Object.keys(renderedBoard).length);
  const getDirection = Math.floor(Math.random() * 2);
  //place first grid point
  if (renderedBoard[selectedRow][selectedColumn].id === 0) {
    renderedBoard[selectedRow][selectedColumn].id = 2;
  } else {
    return placeSmallShip();
  }
  //Get Direction
  if (getDirection > 0) {
    //horizontal
    if (selectedColumn === verticalRowCount - 1) {
      if (renderedBoard[selectedRow][selectedColumn - 1].id === 0) {
        renderedBoard[selectedRow][selectedColumn - 1].id = 2;
      } else {
        renderedBoard[selectedRow][selectedColumn].id = 0;
        placeSmallShip();
      }
    } else {
      if (renderedBoard[selectedRow][selectedColumn + 1].id === 0) {
        renderedBoard[selectedRow][selectedColumn + 1].id = 2;
      } else {
        renderedBoard[selectedRow][selectedColumn].id = 0;
        placeSmallShip();
      }
    }
  } else {
    //vertical
    if (selectedRow === verticalRows[verticalRowCount - 1]) {
      if (
        renderedBoard[verticalRows[selectedRowIndex - 1]][selectedColumn].id ===
        0
      ) {
        renderedBoard[verticalRows[selectedRowIndex - 1]][
          selectedColumn
        ].id = 2;
      } else {
        renderedBoard[selectedRow][selectedColumn].id = 0;
        placeSmallShip();
      }
    } else {
      if (
        renderedBoard[verticalRows[selectedRowIndex + 1]][selectedColumn].id ===
        0
      ) {
        renderedBoard[verticalRows[selectedRowIndex + 1]][
          selectedColumn
        ].id = 2;
      } else {
        renderedBoard[selectedRow][selectedColumn].id = 0;
        placeSmallShip();
      }
    }
  }
}

function fillBattleshipFleet() {
  for (let [row, cells] of Object.entries(renderedBoard)) {
    battleShipFleet.push(
      ...cells.filter((cell) => cell.id > 0).map((cell) => cell.gridPoint)
    );
  }
}

function playerSelection(input) {
  const [row, cell] = input.split("");
  if (renderedBoard[row][cell].hit === false) {
    renderedBoard[row][cell].hit = true;
    return input;
  }
}

function startGame() {
  console.clear();
  console.log("Welcome to Battleship 🚢");
  let selectedGridSize = selectGridSize();

  if (selectedGridSize === undefined) {
    console.log("Are you scared to play? lol");
    return;
  } else {
    createGrid(selectedGridSize);
  }

  switch (Object.keys(renderedBoard).length) {
    case 4:
      placeLargeShip();
      placeSmallShip();
      break;
    case 5:
      placeLargeShip();
      placeSmallShip();
      placeSmallShip();
      break;
    case 6:
      placeLargeShip();
      placeLargeShip();
      placeSmallShip();
      placeSmallShip();
      break;
  }

  fillBattleshipFleet();

  while (hitsLanded.length < battleShipFleet.length) {
    printBoard(renderedBoard, false);
    let selection = enterAttackInput();
    let [row, cell] = selection.split("");
    if (
      battleShipFleet.includes(playerSelection(selection)) &&
      !hitsLanded.includes(selection)
    ) {
      hitsLanded.push(selection);
    }
  }
  console.log(`========
    __   _______ _   _   _    _ _____ _   _
    \ \ / /  _  | | | | | |  | |_   _| \ | |
     \ V /| | | | | | | | |  | | | | |  \| |
      \ / | | | | | | | | |/\| | | | | . ' |
      | | \ \_/ / |_| | \  /\  /_| |_| |\  |
      \_/  \___/ \___/   \/  \/ \___/\_| \_/
    ========`);

  const restartGame = rs.keyInYNStrict("Would you like to play again?");

  if (restartGame) {
    console.clear();
    battleShipFleet = [];
    renderedBoard = {};
    debugBoard = {};
    printedBoard = {};
    hitsLanded = [];
    startGame();
  } else {
    console.clear();
  }
}

startGame();
