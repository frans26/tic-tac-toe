import './App.css';
import { useState, useEffect } from 'react';

function createMatrix(n) {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => null));
}

function Square(props) {
  return (
    <button
      className={"square" + (props.selected ? " square-selected" : "")}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

function Board(props) {
  const squares = () => createMatrix(3);

  const handleClick = (row, col) => {
    if (props.value[row][col] === null) {
      return () => props.onClick(row, col);
    }
  }

  const getSelected = (r, c) => {
    // calculate the index of the square
    const i = (r*3) + c;
    
    // highlight current selected or the winning tiles
    return (props.selected.r === r && props.selected.c === c)
      || props.winLine.includes(i);
  }

  return (
    <div>
      {
        squares().map((row, rowIndex) =>
          <div key={rowIndex} className="board-row">
            {
              row.map((column, columnIndex) =>
                <Square
                  key={columnIndex}
                  selected={getSelected(rowIndex, columnIndex)}
                  value={props.value[rowIndex][columnIndex]}
                  onClick={handleClick(rowIndex, columnIndex)}
                />
              )
            }
          </div>
        )
      }
    </div>
  );
}

function calculateWinner(matrix) {
  // spread the matrix to prevent mutation
  // and flatten to simplify the checking of winning combination
  const flattenMatrix = [...matrix].flat();

  // winning lines
  const lines = [
    // horizontal
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // vertical
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // diagonal
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (flattenMatrix[a] !== null
      && flattenMatrix[a] === flattenMatrix[b]
      && flattenMatrix[a] === flattenMatrix[c]
    ) {
      return [flattenMatrix[a], [a, b, c]];
    }
  }
  return [null, null];
}

function App() {
  const n = 3;

  const [matrix, setMatrix] = useState(() => createMatrix(n));
  const [history, setHistory]
    = useState(() => {
      return [{
        move: {
          r: null,
          c: null,
          play: '',
        },
        matrix: createMatrix(n),
      }]
    });
  const [xPlayer, setXPlayer] = useState(true);
  const [status, setStatus] = useState('Next player: X');
  const [selected, setSelected] = useState({ r: null, c: null, });
  const [winLine, setWinLine] = useState(() => Array(3).fill(null));

  useEffect(() => {
    const [winner, line] = calculateWinner(matrix);

    if (winner === null) {
      if (history.length === 10) {
        setStatus('Draw');
      } else {
        setStatus('Next player: ' + (xPlayer ? 'X' : 'O'));
      }
      setWinLine(Array(3).fill(null))
    } else {
      setStatus('Winner: ' + winner);
      setWinLine([...line])
    }
  }, [history, matrix, xPlayer]);

  const handleClick = (row, col) => {
    const mCopy = [...matrix];

    const [winner,] = calculateWinner(mCopy);
    if (winner === null) {
      const play = (xPlayer) ? 'X' : 'O';
      mCopy[row][col] = play;

      setMatrix(mCopy);
      setXPlayer(!xPlayer);
      setHistory((h) => {
        const hCopy = [...h];
        const his = {
          move: {
            r: row,
            c: col,
            play,
          },
          matrix: mCopy
        };
        // this seems ugly but this prevents mutations of the history object
        // tried spread and Object.assign but still it mutates the items
        // hCopy.push(matrix);
        // hCopy.push([...matrix]);
        // hCopy.push(Object.assign([], matrix));
        // hCopy.push(Object.assign([], [...matrix]));
        // hCopy.push(Object.freeze(Object.assign([], [...matrix])));
        // very weird. will come back later if I find proper solution to this problem
        hCopy.push(JSON.parse(JSON.stringify(his)));
        return hCopy;
      });
      setSelected({ r: row, c: col });
    }
  };

  const jumpTo = (step, move) => {
    const hCopy = [...history].slice(0, move + 1);
    const play
      = step.move.play === 'X'
        ? false
        : true;

    setMatrix([...step.matrix]);
    setXPlayer(play);
    setHistory(JSON.parse(JSON.stringify(hCopy)));
    setSelected({ r: step.move.r, c: step.move.c })
    setStatus('Next player: ' + (play ? 'X' : 'O'));
  }

  const moves = history.map((step, move) => {
    const r = step.move.r;
    const c = step.move.c;
    const play = step.move.play;

    const desc = move ?
      'Go to move #' + move + ` ${play} - (${c},${r})` :
      'Go to game start';
    return (
      <li key={move}>
        <button onClick={() => jumpTo(step, move)}>{desc}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board
          value={matrix}
          selected={selected}
          winLine={winLine}
          onClick={(r, c) => handleClick(r, c)}
        />
      </div>
      <div className="game-info">
        <div>{status}</div>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

export default App;
