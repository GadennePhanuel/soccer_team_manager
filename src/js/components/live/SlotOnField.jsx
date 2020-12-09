import React from 'react';
import { useContext } from 'react';
import { useDrop } from 'react-dnd';
import { LivePlayersContext } from '../../pages/LivePage';


const SlotOnField = ({ id, num, tacticType, className, children, parentCallBackSubstitute, parentCallBackExchange }) => {

    const { playersSelected, playersSubstitute, playersOut, tactic } = useContext(LivePlayersContext)


    const callBackSubstitute = (playersSelectedCopy, playersSubstituteCopy, playersOutCopy, tacticCopy, playerDrag, playerTarget) => {
        parentCallBackSubstitute(playersSelectedCopy, playersSubstituteCopy, playersOutCopy, tacticCopy, playerDrag, playerTarget)
    }

    const callBackExchange = (playersSelectedCopy, tacticCopy) => {
        parentCallBackExchange(playersSelectedCopy, tacticCopy)
    }


    const [, drop] = useDrop({
        accept: "PlayerCardLive",
        drop: (item) => {
            let playerDrag = item.player   //-> c'est le player qu'on drag
            let posOriginDrag = item.posOrigin  //--> origin du player qu'on drag

            let playerTarget = children.props.player    //--> c'est le player à la position qu'on vise
            let posOriginTarget = children.props.posOrigin // --> position qu'on vise


            //1. on cherche a mettre un joueur remplacant sur le terrain (donc a la place d'un joueur déja sur le terrain)
            if (posOriginDrag === "free" && playersOut.length < 3) {


                //le joueur qui entre dans le terrain doit etre set dans playersSelected à la place du joueur sorti
                let playersSelectedCopy = [...playersSelected] //copy du tableau
                let indexPlayerOnField = playersSelected.indexOf(playerTarget) //on récupére l'index du joueur deja présent
                playersSelectedCopy[indexPlayerOnField] = playerDrag  //on set le nouveau joueur dans le tableau A LA MEME PLACE que le joueur qu'il remplace

                //on retire de playersSubstitute le joueur qui vient de rentrer
                let playersSubstituteCopy = [...playersSubstitute] //copy du tableau
                let indexPlayerDrag = playersSubstituteCopy.indexOf(playerDrag)
                playersSubstituteCopy.splice(indexPlayerDrag, 1)

                //on ajoute le joueur qui sort à playersOut
                let playersOutCopy = [...playersOut] //copie du tableau
                playersOutCopy.push(playerTarget)

                //on met a jour la tacticArch
                let tacticCopy = { ...tactic }
                tacticCopy[posOriginTarget] = playerDrag
                tacticCopy["substitutes"] = playersSubstituteCopy
                tacticCopy["substitutesOut"] = playersOutCopy

                callBackSubstitute(playersSelectedCopy, playersSubstituteCopy, playersOutCopy, tacticCopy, playerDrag, playerTarget)
            }
            else {
                //2. on intervertis 2 joueurs qui sont deja sur le terrain

                let playersSelectedCopy = [...playersSelected] //copy du tableau
                let indexPlayerTarget = playersSelected.indexOf(playerTarget) //on récupére l'index du joueur cible
                let indexPlayerDrag = playersSelected.indexOf(playerDrag)   //on récupére l'index du joueur drag
                //on intervertis les deux dans la copie
                playersSelectedCopy[indexPlayerTarget] = playerDrag
                playersSelectedCopy[indexPlayerDrag] = playerTarget

                //on met a jour la tacticArch
                let tacticCopy = { ...tactic }
                tacticCopy[posOriginTarget] = playerDrag
                tacticCopy[posOriginDrag] = playerTarget

                callBackExchange(playersSelectedCopy, tacticCopy)

            }

        }
    });

    const slotWidth = 110;
    const slotHeight = 110;
    const x = tacticType[num][0]
    const y = tacticType[num][1]

    return (
        <div ref={drop} id={id} className={className} style={{ top: y + "%", left: x + "%", width: slotWidth, height: slotHeight }} >
            <div>
                {children}
            </div>
        </div>
    )
};

export default SlotOnField;