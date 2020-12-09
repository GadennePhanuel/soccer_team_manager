import React from 'react';

const SlotPoste = ({ id, num, tactic, className, children }) => {

    const slotWidth = 66;
    const slotHeight = 79.2;
    const x = tactic[num][0]
    const y = tactic[num][1]

    return (
        <div id={id} className={className} style={{ top: y + "%", left: x + "%", width: slotWidth, height: slotHeight }} >
            <div title={tactic[num][2]}>
                <p className="position-name">{tactic[num][2]}</p>
                {children}
            </div>
        </div>
    )
};

export default SlotPoste;