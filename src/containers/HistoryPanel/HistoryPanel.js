import React from "react";

import "./HistoryPanel.css";

const HistoryPanel = ({commandListObjs, currCmdIndex}) => {
    //console.log(typeof commandListObjs);
    return (
        <div className="HistoryPanel">
            {
                commandListObjs.map(
                    (obj, index) => {
                        let classNames = "CommandObj";
                        classNames += (!obj.isUndo) ? "" : " CommandObjGreyOut";
                        classNames += (currCmdIndex === index) ? " CommandObjActive" : "";
                        return (
                            <div className= {classNames}>
                                <p style={{textDecoration: !obj.isUndo ? "" : "line-through"}}> 
                                    {obj.commandName} 
                                </p>
                            </div>
                        )
                    }
                )
            }
        </div>
    );
};

export default HistoryPanel;