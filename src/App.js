import React, { Component } from "react";

import ControlPanel from "./containers/ControlPanel/ControlPanel";
import Workspace from "./containers/Workspace/Workspace";
import HistoryPanel from "./containers/HistoryPanel/HistoryPanel";

import ControlContext from "./contexts/control-context";
import { genId, defaultValues } from "./shared/util";
import ChangeFillColorCommandObject from "./shared/commandObjects/ChangeFillColorCommandObject";
import ChangeBorderColorCmdObj from "./shared/commandObjects/ChangeBorderColorCmdObj";
import ChangeBorderWidthCmdObj from "./shared/commandObjects/ChangeBorderWidthCmdObj";
import AddShapeCmdObj from "./shared/commandObjects/AddShapeCmdObj";
import DeleteCmdObj from "./shared/commandObjects/DeleteCmdObj";
import MoveCmdObj from "./shared/commandObjects/MoveCmdObj";

import "./App.css";


class App extends Component {
  state = {
    // controls
    currMode: defaultValues.mode,
    currBorderColor: defaultValues.borderColor,
    currBorderWidth: defaultValues.borderWidth,
    currFillColor: defaultValues.fillColor,

    // workspace
    shapes: [],
    shapesMap: {},
    selectedShapeId: undefined,

    // handling undo/redo
    commandList: [],
    currCommand: -1,
    undoAllowed: false,
    redoAllowed: false,
  };

  constructor() {
    super();

    /*
     * pass this undoHandler into command object constructors:
     *  e.g. let cmdObj = new ChangeFillColorCommandObject(this.undoHandler);
     */
    this.undoHandler = {
      registerExecution: this.registerExecution,
      updateShape: this.updateShape,
      unAddShape: this.unAddShape,
      reAddShape: this.reAddShape,
      setPaletteValues: this.setPaletteValues
      // TODO: fill this up with whatever you need for the command objects
    };
  }

  /*
   * TODO:
   * add the commandObj to the commandList so
   * that is available for undoing.
   */
  registerExecution = (commandObject) => {
    let newCmdList = [];
    if (this.state.commandList.length !== this.state.currCommand+1) {
      newCmdList = this.state.commandList.slice(0, this.state.currCommand+1 )
    }
    else{
      newCmdList = [...this.state.commandList];
    }
    this.setState({
      commandList: [...newCmdList, commandObject],
      currCommand: this.state.currCommand + 1
    });
  };

  /*
   * TODO:
   * actually call the undo method of the command at
   * the current position in the undo stack
   */
  undo = () => {
    //console.log("undo");
    if (this.state.currCommand-1 === -1){
      this.setState({
        undoAllowed: false
      }); 
    }

    if(this.state.currCommand !== -1){
      this.setState({
        selectedShapeId: this.state.commandList[this.state.currCommand].selectedShapeId
      });        
      this.state.commandList[this.state.currCommand].undo();
      //var oldValue = this.state.commandList[this.state.currCommand].oldValue;
      //this.updateShape(this.state.commandList[this.state.currCommand].selectedShapeId, { oldValue });
      this.setState({
        currCommand: this.state.currCommand - 1,
        redoAllowed: true
      });  
    }
  };

  /*
   * TODO:
   * actually call the redo method of the command at
   * the current position in the undo stack. Note that this is
   * NOT the same command as would be affected by a doUndo()
   */
  redo = () => {
    //console.log("redo"); 
    if (this.state.currCommand+1 === this.state.commandList.length-1){
      this.setState({
        redoAllowed: false,
        undoAllowed: true
      }); 
    }

    if(this.state.currCommand+1 < this.state.commandList.length) {
      this.state.commandList[this.state.currCommand+1].redo();
      this.setState({
        currCommand: this.state.currCommand + 1,
      });       
    } 
  };

  // add the shapeId to the array, and the shape itself to the map
  addShape = (shapeData) => {
    let shapes = [...this.state.shapes];
    let shapesMap = { ...this.state.shapesMap };
    const id = genId();
    shapesMap[id] = {
      ...shapeData,
      id,
    };
    shapes.push(id);
    this.setState({ shapes, shapesMap, selectedShapeId: id, undoAllowed: true });

    let cmdObj = new AddShapeCmdObj(
      this.undoHandler,
      shapeData, 
      id,
    );
    cmdObj.execute();

  };

  // get the shape by its id, and update its properties
  updateShape = (shapeId, newData) => {
    let shapesMap = { ...this.state.shapesMap };
    let targetShape = shapesMap[shapeId];
    shapesMap[shapeId] = { ...targetShape, ...newData };
    this.setState({ shapesMap });
  };

  moveShape = (newData) => {
    if (this.state.selectedShapeId) {
      this.updateShape(this.state.selectedShapeId, newData);
    }
  };

  // deleting a shape sets its visibility to false, rather than removing it
  deleteSelectedShape = () => {
    let shapesMap = { ...this.state.shapesMap };
    shapesMap[this.state.selectedShapeId].visible = false;
    this.setState({ shapesMap, selectedShapeId: undefined });

    let cmdObj = new DeleteCmdObj(
      this.undoHandler,
      shapesMap[this.state.selectedShapeId], 
      this.state.selectedShapeId,
    );
    cmdObj.execute();
  };

  changeCurrMode = (mode) => {
    if (mode === "line") {
      this.setState({
        currMode: mode,
        currBorderColor: defaultValues.borderColor,
      });
    } else {
      this.setState({ currMode: mode });
    }
  };

  changeCurrBorderColor = (borderColor) => {
    this.setState({ currBorderColor: borderColor });
    if (this.state.selectedShapeId) {
      let cmdObj = new ChangeBorderColorCmdObj(
        this.undoHandler,
        this.state.shapesMap[this.state.selectedShapeId], 
        this.state.selectedShapeId,
        this.state.currBorderColor, 
        borderColor
      );
      cmdObj.execute();
      this.updateShape(this.state.selectedShapeId, { borderColor });
    }
  };

  changeCurrBorderWidth = (borderWidth) => {
    this.setState({ currBorderWidth: borderWidth });
    if (this.state.selectedShapeId) {
      this.updateShape(this.state.selectedShapeId, { borderWidth });
    }
  };

  AddChangeBorderWidthCmd = (borderWidth, oldWidth) => {
    let cmdObj = new ChangeBorderWidthCmdObj(
      this.undoHandler,
      this.state.shapesMap[this.state.selectedShapeId], 
      this.state.selectedShapeId,
      oldWidth, 
      borderWidth
    );
    cmdObj.execute();  
  }

  changeCurrFillColor = (fillColor) => {
    
    this.setState({ currFillColor: fillColor });
    if (this.state.selectedShapeId) {
      let cmdObj = new ChangeFillColorCommandObject(
        this.undoHandler,
        this.state.shapesMap[this.state.selectedShapeId], 
        this.state.selectedShapeId,
        this.state.currFillColor, 
        fillColor
      );
      cmdObj.execute();
      this.updateShape(this.state.selectedShapeId, { fillColor });
    }
  };

  // For Undo Redo
  unAddShape = (shapeId) => {
    let shapesMap = { ...this.state.shapesMap };
    shapesMap[shapeId].visible = false;
    this.setState({shapesMap, selectedShapeId: undefined});   
  }

  reAddShape = (shapeId) => {
    let shapesMap = { ...this.state.shapesMap };
    shapesMap[shapeId].visible = true;
    this.setState({shapesMap, selectedShapeId: shapeId});   
  }

  setPaletteValues = (values) => {
    this.setState({
      currMode: values.mode,
      currBorderColor: values.borderColor,
      currBorderWidth: values.borderWidth,
      currFillColor: values.fillColor
    });
  }

  addMoveCmdObj = (oldValue, newValue) => {
    let cmdObj = new MoveCmdObj(
      this.undoHandler,
      this.state.shapesMap[this.state.selectedShapeId], 
      this.state.selectedShapeId,
      oldValue, 
      newValue
    );
    cmdObj.execute();
  }

  keyDownHandler = (e) => {
    var evtobj = window.event? window.event : e;
    if (evtobj.keyCode == 90 && evtobj.metaKey && evtobj.shiftKey) this.redo();
    else if (evtobj.keyCode == 90 && (evtobj.ctrlKey || evtobj.metaKey)) this.undo();
    if (evtobj.keyCode == 89 && evtobj.ctrlKey ) this.redo();
  }


  render() {
    const {
      currMode,
      currBorderColor,
      currBorderWidth,
      currFillColor,
      shapes,
      shapesMap,
      selectedShapeId,
      undoAllowed,
      redoAllowed
    } = this.state;

    window.addEventListener("keydown", this.keyDownHandler, true);
    //window.addEventListener("keyUp", this.keyUpHandler, true);
    // update the context with the functions and values defined above and from state
    // and pass it to the structure below it (control panel and workspace)
    return (
      <React.Fragment>
        <ControlContext.Provider
          value={{
            currMode,
            changeCurrMode: this.changeCurrMode,
            currBorderColor,
            changeCurrBorderColor: this.changeCurrBorderColor,
            currBorderWidth,
            changeCurrBorderWidth: this.changeCurrBorderWidth,
            AddChangeBorderWidthCmd: this.AddChangeBorderWidthCmd,
            currFillColor,
            changeCurrFillColor: this.changeCurrFillColor,
            addMoveCmdObj: this.addMoveCmdObj,
            shapes,
            shapesMap,
            addShape: this.addShape,
            moveShape: this.moveShape,
            selectedShapeId,
            selectShape: (id) => {
              this.setState({ selectedShapeId: id });
              if (id) {
                const { borderColor, borderWidth, fillColor } = shapesMap[
                  shapes.filter((shapeId) => shapeId === id)[0]
                ];
                this.setState({
                  currBorderColor: borderColor,
                  currBorderWidth: borderWidth,
                  currFillColor: fillColor,
                });
              }
            },
            deleteSelectedShape: this.deleteSelectedShape,

            undo: this.undo,
            redo: this.redo,
            undoAllowed,
            redoAllowed
          }}
        >
          <ControlPanel />
          <Workspace />
          <HistoryPanel commandListObjs = {this.state.commandList} currCmdIndex = {this.state.currCommand}/>
        </ControlContext.Provider>
      </React.Fragment>
    );
  }
}

export default App;
