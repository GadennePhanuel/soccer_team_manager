import React from 'react'
import FieldPosition from "./FieldPosition";

export default function TacticField(props) {
  //  const positions = {}
  //  if(props.tactic.type === "test"){
    //todo la surface de TacticField fait 512px sur 512/
        const positions = {
            pos1 : [230,422],
            pos2 : [60,250],
            pos3 : [130,310],
            pos4 : [230,325],
            pos5 : [330,310],
            pos6 : [400,250],
            pos7 : [110,150],
            pos8 : [230,187],
            pos9 : [352,150],
            pos10 : [150,50],
            pos11 : [310,50]
        }
  //  }
    return <div id="soccerField">
        <FieldPosition playerId={props.tactic.pos1Id} posX={positions.pos1[0]} posY={positions.pos1[1]} />
        <FieldPosition playerId={props.tactic.pos2Id} posX={positions.pos2[0]} posY={positions.pos2[1] - 50} />
        <FieldPosition playerId={props.tactic.pos3Id} posX={positions.pos3[0]} posY={positions.pos3[1] - 100}  />
        <FieldPosition playerId={props.tactic.pos4Id} posX={positions.pos4[0]} posY={positions.pos4[1] - 150} />
        <FieldPosition playerId={props.tactic.pos5Id} posX={positions.pos5[0]} posY={positions.pos5[1] - 200} />
        <FieldPosition playerId={props.tactic.pos6Id} posX={positions.pos6[0]} posY={positions.pos6[1] - 250} />
        <FieldPosition playerId={props.tactic.pos7Id} posX={positions.pos7[0]} posY={positions.pos7[1] - 300} />
        <FieldPosition playerId={props.tactic.pos8Id} posX={positions.pos8[0]} posY={positions.pos8[1] - 350} />
        <FieldPosition playerId={props.tactic.pos9Id} posX={positions.pos9[0]} posY={positions.pos9[1] - 400} />
        <FieldPosition playerId={props.tactic.pos10Id} posX={positions.pos10[0]} posY={positions.pos10[1] - 450} />
        <FieldPosition playerId={props.tactic.pos11Id} posX={positions.pos11[0]} posY={positions.pos11[1] - 500} />
    </div>
}