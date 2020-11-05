import React from 'react';
import { useDrop } from 'react-dnd';

const SlotSelection = ({id, className, child}) => {
    const [, drop] = useDrop({
        accept: "playerCard",

    });

    return (
        <div ref={drop} id={id} className={className}>
            {child}
        </div>
    )
};

export default SlotSelection;