import React from 'react';
import { useDrop } from 'react-dnd';

const SlotSelection = ({ id, num, tactic, className, children }) => {
    const [, drop] = useDrop({
        accept: "playerCard",
        drop: () => ({ name: id }),
    });

    /** DIMENSSION ET POSITIONNEMENT DES SLOTSELECTION
     * travailler en %
     * gérer decalage sur Y eventuel due position relative
     * gerer dimenssion dynamique des slots.
     * large slot 75px, large terrain 512
     * x = pourcentage de position - la moitié de la largeur de slot convertit en pourcent
     * y = pourcentage de position - la moitié de la largeur de slot convertit en pourcent avec gestion decalage relatif
     * @type {number}
     */
    const fieldWitdh = 512;
    const fieldHeight = 685;
    const slotWidth = 75;
    const slotHeight = 80;
    const x = tactic[num][0] - (slotWidth*100/fieldWitdh/2)
    const y = tactic[num][1] - (num-1)*(slotHeight*100/fieldHeight) - (slotHeight*100/fieldHeight/2)

    //todo format slotSelection here
    return (
        <div ref={drop} id={id} className={className} style={{top:y+"%", left:x+"%", width:slotWidth, height:slotHeight }} >
            <abbr title={tactic[num][2]}>
                <p>{tactic[num][2]}</p>
                {children}
            </abbr>
        </div>
    )
};

export default SlotSelection;