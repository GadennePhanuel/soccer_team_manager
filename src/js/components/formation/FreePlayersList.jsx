import React from 'react';
import { useDrop } from 'react-dnd';

const FreePlayersList = ({id, className, children}) => {
    const [, drop] = useDrop({
        accept: "playerCard",

    });

    return (
        <div ref={drop} id={id} className={className}>
            {children}
        </div>
    )
};

export default FreePlayersList;