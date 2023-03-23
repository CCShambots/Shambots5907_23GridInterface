import React, { useState } from 'react';
import './Grid.css';

function GridEntry(props) {
    let value = props.entry;

    if(!value && props.force != "none") {
        //Set the element to be valid if it matches the current force type
        if(isValid(props.rowIndex, props.colIndex, props.force)) value = "valid"
    }

    if(props.rowIndex == props.nextRow && props.colIndex == props.nextCol) value = "next";
    if(props.link) value = "link"


    return (
        <td
            className={`entry ${value}`}
            onClick={() => props.handleClick(props.rowIndex, props.colIndex)}
        ></td>
    )
}

const Grid = () => {
    //This will be used by both the bot and the ds to indicate what location should be scored in next
    const [nextRow, setNextRow] = useState(2); //The next row to place an element
    const [nextCol, setNextCol] = useState(0); //The next column to place an element

    //This will be used for the robot to indicate that it just scored at a certain location
    const [placedRow] = useState(-1); //The row of an element just placed
    const [placedCol] = useState(-1); //The column of an element just placed
    const [justPlaced, setJustPlaced] = useState(false); //Flag to indicate the bot just placed a cone

    //This will be used by the robot to indicate if it needs a certain type
    const [forceElement] = useState("none");


    const [grid0, setGrid0] = useState(new Array(9).fill(""))
    const [grid1, setGrid1] = useState(new Array(9).fill(""))
    const [grid2, setGrid2] = useState(new Array(9).fill(""))

    let grid = () => {
        let grid = new Array(3);

        grid[0] = grid0;
        grid[1] = grid1;
        grid[2] = grid2;

        return grid;
    }

    let setGrid = (grid) => {
        setGrid0(grid[0])
        setGrid1(grid[1])
        setGrid2(grid[2])
    }

    const [override, setOverride] = useState(false);

    const [runAlgoOnce, setRunAlgoOnce] = useState(true);

    let handleClick = (rowIndex, colIndex) => {

        if(!override) {
            const newGrid = [...grid()];

            if(colIndex == nextCol && rowIndex == nextRow) {
                setNextRow(-1);
                setNextCol(-1);
            }

            if (newGrid[rowIndex][colIndex] === "") {
                newGrid[rowIndex][colIndex] = determineElementType(rowIndex, colIndex);
            } else {
                newGrid[rowIndex][colIndex] = "";
            }
            setGrid(newGrid);
            setRunAlgoOnce(true);
        } else {
            setNextRow(rowIndex);
            setNextCol(colIndex);
        }
    };

    /*
    If the bot has just placed an element, and it's been placed in an empty node,
    fill the node, indicate that we've handled the "just placed" element, and run the algorithm to determine the next type once
     */
    if(justPlaced && !gridSpaceFilled(grid()[placedRow][placedCol])) {
        handleClick(placedRow, placedCol);
        setJustPlaced(false);
        setRunAlgoOnce(true);
    }

    let nextType = determineElementType(nextRow, nextCol);
    if(nextType == "both") nextType = "cube"; //TODO: determine this in a more sensible way

    //Set the next element type to a force element type if one has been selected by the bot
    if(forceElement != "none") nextType = forceElement;

    //Get the completed links
    let links = getLinks(grid());
    //Get the coordinates of all completed links
    let linkCoords = getLinkCoords(links);

    //If we're not in override mode, or we should run the algorithm once, do so
    if(runAlgoOnce) {
        //TODO: make advancements conditional to the highest unfilled row
        let next = evaluateNext(grid(), linkCoords, links.length, false, forceElement); //TODO: decide when not to go for advancements

        console.log(next.row + " " + next.col)

        setNextRow(next.row)
        setNextCol(next.col)

        setRunAlgoOnce(false)
    }

    return (
        <div>
            <p className={nextType + "-next top-info"}>Next: {nextType}</p>
            {/*<!--<p className={forceElement+ "-next top-info"}>Force: {forceElement}</p>-->*/}
            <table className="grid">
                <tbody>
                    {grid().map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((entry, colIndex) => (
                                    <GridEntry
                                        entry={entry}
                                        link={isPartOfLink(rowIndex, colIndex, linkCoords)}
                                        nextRow={nextRow}
                                        nextCol={nextCol}
                                        rowIndex={rowIndex}
                                        colIndex={colIndex}
                                        handleClick={handleClick}
                                        force={forceElement}
                                        key={rowIndex.toString() + colIndex.toString()}
                                    />
                            ))}
                        </tr>
                    ))}
                </tbody>
           </table>
{/*             <div onClick={() => { */}
{/*                 if(override) { */}
{/*                     setOverride(false); */}
{/*                     setRunAlgoOnce(true); */}
{/*                 } else { */}
{/*                     setOverride(true); */}
{/*                 } */}
{/*             }} className={(override ? "override" : "indicate") + " bottom-button"}> */}
{/*                 <p className={"bottom-text"}>{override ? "OVERRIDE" : "INDICATE"}</p> */}
{/*             </div> */}
        </div>
    );
};

function isValid(row, col, forceType) {
    let type = determineElementType(row, col);
    return forceType == "none" || type == forceType || type == "both";
}

function determineElementType(row, col) {
    if(row == 0) return "both"
    else if (col==1 || col==4 || col==7) return "cube"
    else return "cone"
}

function getLinks(grid) {

    let links = new Array();

    let numLinks = 0;

    for(let row = 0; row<grid.length; row++) {
        for(let col = 0; col<grid[0].length-2; col++) {
            if(gridSpaceFilled(grid[row][col]) &&
                gridSpaceFilled(grid[row][col+1]) &&
                gridSpaceFilled(grid[row][col+2])) {
                numLinks++;

                links.push({
                    id: numLinks,
                    row: row,
                    col1: col,
                    col2: col+1,
                    col3: col+2
                })

                col+= 2
            }
        }
    }

    return links;
}

function getLinkCoords(links) {
    let coords = new Array();
    for(let i = 0; i<links.length; i++) {
        let thisLink = links[i];
        coords.push({row: thisLink.row, col: thisLink.col1});
        coords.push({row: thisLink.row, col: thisLink.col2});
        coords.push({row: thisLink.row, col: thisLink.col3});
    }

    return coords;
}

function isPartOfLink(row, col, linkCoords) {
    return linkCoords.filter((e) => e.row == row && e.col == col).length > 0
}

function evaluateNext(grid, linkCoords, numLinks, goForAdvancements, forceType) {

    let completions = linkCompletions(grid, linkCoords);

    if(completions.length > 0) {
        for(let i = 0; i<completions.length; i++) {
            let thisElement = completions[i];
            if(isValid(thisElement.row, thisElement.col, forceType)) {
                return thisElement;
            }
        }
    }

    if(goForAdvancements) {
        let advancements = linkAdvancements(grid, linkCoords)

        if(advancements.length > 0) {
            for(let i = 0; i<advancements.length; i++) {
                let thisElement = advancements[i];
                if(isValid(thisElement.row, thisElement.col, forceType)) {
                    return thisElement;
                }
            }
        }
    }

    return nextHighest(grid, forceType)
}

function linkCompletions(grid, linkCoords) {

    let completions = new Array();

    for(let row = grid.length-1; row>=0; row--) {
        for(let col = 0; col<grid[0].length; col++) {
            if(!gridSpaceFilled(grid[row][col])) { //Only evaluate for pairs if the node is not filled
                if(col >= 2) {
                    if(isGoodEntry(grid, row, col-2, linkCoords) && isGoodEntry(grid, row, col-1, linkCoords)) {
                        completions.push({row: row, col: col}); //Add this node to the list if the two nodes to the left are filled
                    }
                }

                if(col >= 1) {
                    if(isGoodEntry(grid, row, col-1, linkCoords) && isGoodEntry(grid, row, col+1, linkCoords)) {
                        completions.push({row: row, col: col}); //Add this node to the list if the nodes on either side are filled
                    }
                }

                if(col <= grid[0].length - 2) {
                    if(isGoodEntry(grid, row, col+2, linkCoords) && isGoodEntry(grid, row, col+1, linkCoords)) {
                        completions.push({row: row, col: col}) //Add this node to the list if the two nodes to the right are filled
                    }
                }
            }
        }
    }

    return completions;
}

function linkAdvancements(grid, linkCoords) {

    let advancements = new Array();

    for(let row = grid.length-1; row>=0; row--) {
        for(let col = 1; col<grid[0].length-1; col++) {
            if(!gridSpaceFilled(grid[row][col])) { //Only evaluate for pairs if the node is not filled
                if(isGoodEntry(grid, row, col-1, linkCoords)) {
                    advancements.push({row: row, col: col}); //Add this node to the list if the node to the left is good
                }
                if(isGoodEntry(grid, row, col+1, linkCoords)) {
                    advancements.push({row: row, col: col}) //Add this node to the list if the node to the right is good
                }
            }
        }
    }

    return advancements;
}

function nextHighest(grid, forceType) {
    for(let row = grid.length-1; row>=0; row--) {
        for(let col = 0; col<grid[0].length; col++) {
            if(!grid[row][col] && isValid(row, col, forceType)) {
                return {row: row, col: col}
            }
        }
    }

    return {row: 2, col: 0};
}

/**
 * Whether the grid space has an element in it or not
 * @param entry the entry in the grid
 * @returns {boolean} whether the node has an element or not
 */
function gridSpaceFilled(entry) {
    return entry != "";
}

function isGoodEntry(grid, row, col, linkCoords) {
    return grid[row][col] != "" && !isPartOfLink(row, col, linkCoords)
}


export default Grid;
