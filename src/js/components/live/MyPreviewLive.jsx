import React from 'react';
import { usePreview } from 'react-dnd-preview/dist/cjs/usePreview';

const MyPreviewLive = ({ pictures64 }) => {
    const { display, item, style } = usePreview();
    if (!display) {
        return null;
    }
    if (item.player) {
        return <div className="playerCardSubstitute playerCardDragged" style={style}>
            <div>
                {pictures64.map((picture, index) => (
                    picture[item.player.id] && (
                        <div key={index} className='picture-profil'>
                            {picture[item.player.id] && (
                                <img src={`data:image/jpeg;base64,${picture[item.player.id]}`} alt="" />
                            )}
                        </div>
                    )
                ))}
                {!item.player.picture && (
                    <div className="user-picture"></div>
                )}
                <p>{item.player.user.firstName.substring(0, 7)}.{item.player.user.lastName.charAt(0)}</p>
            </div>
        </div>;
    }
}

export default MyPreviewLive;





