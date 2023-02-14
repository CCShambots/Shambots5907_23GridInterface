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
                                entry={rowIndex == nextRow && colIndex == nextCol ? "next" : entry} //TODO: encapsulate this logic in the entry more
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

function transpose(columnByRow) {
    let newArr = new Array(columnByRow[0].length);

    for(let i = 0; i<newArr.length; i++) {
        newArr[i] = new Array(columnByRow.length)
    }

    for(let i = 0; i<columnByRow.length; i++) {
        for( let j = 0; j<columnByRow[0].length; j++) {
            newArr[j][i] = columnByRow[i][j]
        }
    }

    return newArr;
}

function evaluateNext(grid, numLinks, linkBonusAttained) {
    let gridTranspose = transpose(grid)

    if(numLinks < linkBonusAttained ? 4 : 5) { //Only look to complete links if we haven't gotten the RP for links yet


    } else {
        return nextHighest(gridTranspose)
    }
}

function getLinks(grid) {
    let transpose = transpose(grid);

    for(let row = 0; row<transpose; row++) {
        
    }
}

function linkCompletions(gridTranspose) {

    let completions = new Array();

    for(let row = 0; row<gridTranspose.length; row++) {
        for(let col = 0; col<gridTranspose[0].length; col++) {
            if(!gridSpaceFilled(gridTranspose[row][col])) { //Only evaluate for pairs if the node is not filled
                if(col >= 2) {
                    if(gridSpaceFilled(gridTranspose[row][col-2]) && gridSpaceFilled(gridTranspose[row][col-1])) {
                        completions.push({row: row, col: col}); //Add this node to the list if the two nodes to the left are filled
                    }
                }

                if(col <= gridTranspose[0].length - 2) {
                    if(gridSpaceFilled(gridTranspose[row][col+2]) && gridSpaceFilled(gridTranspose[row][col+1])) {
                        completions.push({row: row, col: col}) //Add this node to the list if the two nodes to the right are filled
                    }
                }
            }
        }
    }

    return completions;
}

function linkAdvancements(gridTranspose) {

    let advancements = new Array();

    for(let row = 0; row<gridTranspose.length; row++) {
        for(let col = 1; col<gridTranspose[0].length-1; col++) {
            if(!gridSpaceFilled(gridTranspose[row][col])) { //Only evaluate for pairs if the node is not filled
                if(gridSpaceFilled(gridSpaceFilled(gridTranspose[row][col-1]))) {
                    advancements.push({row: row, col: col}); //Add this node to the list if the two nodes to the left are filled
                }
                if(gridSpaceFilled(gridTranspose[row][col+2]) && gridSpaceFilled(gridTranspose[row][col+1])) {
                    advancements.push({row: row, col: col}) //Add this node to the list if the two nodes to the right are filled
                }
            }
        }
    }

    return advancements;
}

function nextHighest(gridTranspose) {
    for(let row=0; row<gridTranspose.length; row++) {
        for(let col = 0; col<gridTranspose[0].length; col++) {
            if(gridTranspose[row][col]) return {row: row, col: col}
        }
    }

    return {row: 0, col: 0};
}

function gridSpaceFilled(entry) {
    return entry != "";
}


export default Grid;
