import React, { useState } from 'react';
import './Grid.css';

import useEntry from '../networktables/useEntry';

function GridEntry(props) {

    return (
        <div
            className={`entry ${props.entry}`}
            onClick={() => props.handleClick(props.rowIndex, props.colIndex)}
        ></div>
    )
}

const Grid = () => {
    const [nextRow, setNextRow] = useEntry('/cone-ui/next/row', 0);
    const [nextCol, setNextCol] = useEntry('/cone-ui/next/col', 0);

    let startGrid = Array(9);

    for(let i = 0; i<startGrid.length; i++) {
        startGrid[i] = Array(3).fill("");
    }

    const [grid, setGrid] = useState(startGrid);

    let handleClick = (rowIndex, colIndex) => {
        const newGrid = [...grid];

        if(colIndex == nextCol && rowIndex == nextRow) {
            setNextRow(-1);
            setNextCol(-1);
        }

        if (newGrid[colIndex][rowIndex] === "") {
            if (colIndex === 1 || colIndex === 4 || colIndex === 7) {
                newGrid[colIndex][rowIndex] = "cube";
            } else {
                newGrid[colIndex][rowIndex] = "cone";
            }
        } else {
            newGrid[colIndex][rowIndex] = "";
        }
        setGrid(newGrid);
    };

    let nextType = determineNextType(nextCol)

    return (
        <div>
            <p className={nextType + "-next"}>Next: {nextType}</p>
            <div className="grid">
                {grid.map((row, colIndex) => (
                    <div className="row" key={colIndex}>
                        {row.map((entry, rowIndex) => (
                            <GridEntry
                                entry={rowIndex == nextRow && colIndex == nextCol ? "next" : entry}
                                rowIndex={rowIndex}
                                colIndex={colIndex}
                                handleClick={handleClick}
                                key={rowIndex.toString() + colIndex.toString()}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

function determineNextType(col) {
    return col == 1 || col == 4 || col == 7 ? "cube" : "cone"
}


export default Grid;
