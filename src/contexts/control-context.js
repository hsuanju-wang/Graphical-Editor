import { createContext } from "react";

// create a context with default values
const controlContext = createContext({
  currMode: "",
  changeCurrMode: () => {},
  currBorderColor: "",
  changeCurrBorderColor: () => {},
  currBorderWidth: 1,
  changeCurrBorderWidth: () => {},
  AddChangeBorderWidthCmd: () => {},
  currFillColor: "",
  changeCurrFillColor: () => {},

  addMoveCmdObj: () => {},
  
  shapes: [],
  shapesMap: {},
  addShape: () => {},
  moveShape: () => {},
  selectedShapeId: "", // a string or undefined
  selectShape: () => {},
  deleteSelectedShape: () => {},

  undo: () => {},
  redo: () => {},
  undoAllowed: undefined,
  redoAllowed: undefined,
});

export default controlContext;
