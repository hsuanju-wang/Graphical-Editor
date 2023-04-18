import CommandObject from "./CommandObject";

export default class DeleteCmdObj extends CommandObject {
  constructor(undoHandler, newSelectedObj, selectedShapeId) {
    super(undoHandler, true);
    this.commandName = "Delete " +  newSelectedObj.type;
    
    if (newSelectedObj !== null) {
      this.targetObject = newSelectedObj; // global variable for selected
      this.selectedShapeId = selectedShapeId;
      this.isUndo = false;
    }
    //selectedShapeId = newSelectedShapeId;
    //selectedObj = newSelectedObj;
  }

  /* override to execute the action of this command.
   * pass in false for addToUndoStack if this is a command which is NOT
   * put on the undo stack, like Copy, or a change of selection or Save
   */
  execute() {
    // Note that this command object must be a NEW command object so it can be
    // registered to put it onto the stack
    if (this.addToUndoStack) this.undoHandler.registerExecution(this);
  }

  /* override to undo the operation of this command
   */
  undo() {
    this.isUndo = true;
    this.undoHandler.reAddShape(this.selectedShapeId);
    // maybe also need to fix the palette to show this object's color?
  }

  /* override to redo the operation of this command, which means to
   * undo the undo. This should ONLY be called if the immediate
   * previous operation was an Undo of this command. Anything that
   * can be undone can be redone, so there is no need for a canRedo.
   */
  redo() {
    this.isUndo = false;
    this.undoHandler.unAddShape(this.selectedShapeId);
    // maybe also need to fix the palette to show this object's color?
  }

  /* override to return true if this operation can be repeated in the
   * current context
   */
  canRepeat() {
    // return selectedObj !== null;
  }

  /* override to execute the operation again, this time possibly on
   * a new object. Thus, this typically uses the same value but a new
   * selectedObject.
   */
  repeat() {
    // if (selectedObj !== null) {
    //   this.targetObject = selectedObj; // get new selected obj
    //   this.oldValue = selectedObj.fillColor; // object's current color
    //   // no change to newValue since reusing the same color
    //   selectedObj.fillColor = this.newValue; // actually change

    //   // Note that this command object must be a NEW command object so it can be
    //   // registered to put it onto the stack
    //   if (this.addToUndoStack) this.undoHandler.registerExecution({ ...this });
    // }
  }
}