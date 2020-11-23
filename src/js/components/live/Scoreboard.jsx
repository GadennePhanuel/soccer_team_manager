import React from 'react';
import "../../../scss/components/Scoreboard.scss";
import useOnclickOutside from "react-cool-onclickoutside";


const Scoreboard = ({ home, visitor, addHome, subHome, addVisitor, subVisitor }) => {

    const showHome = () => {
        if (document.getElementById('neg-home').hidden === true && document.getElementById('pos-home').hidden === true) {
            document.getElementById('neg-home').hidden = false
            document.getElementById('pos-home').hidden = false
        } else {
            document.getElementById('neg-home').hidden = true
            document.getElementById('pos-home').hidden = true
        }
    }

    const showVisitor = () => {
        if (document.getElementById('neg-visitor').hidden === true && document.getElementById('pos-visitor').hidden === true) {
            document.getElementById('neg-visitor').hidden = false
            document.getElementById('pos-visitor').hidden = false
        } else {
            document.getElementById('neg-visitor').hidden = true
            document.getElementById('pos-visitor').hidden = true
        }
    }

    const negHome = () => {
        subHome()
        document.getElementById('neg-home').hidden = true
        document.getElementById('pos-home').hidden = true
    }
    const posHome = () => {
        addHome()
        document.getElementById('neg-home').hidden = true
        document.getElementById('pos-home').hidden = true
    }
    const negVisitor = () => {
        subVisitor()
        document.getElementById('neg-visitor').hidden = true
        document.getElementById('pos-visitor').hidden = true
    }
    const posVisitor = () => {
        addVisitor()
        document.getElementById('neg-visitor').hidden = true
        document.getElementById('pos-visitor').hidden = true
    }

    const refHome = useOnclickOutside(() => {
        if (document.getElementById('neg-home').hidden === false && document.getElementById('pos-home').hidden === false) {
            document.getElementById('neg-home').hidden = true
            document.getElementById('pos-home').hidden = true
        }
    })

    const refVisitor = useOnclickOutside(() => {
        if (document.getElementById('neg-visitor').hidden === false && document.getElementById('pos-visitor').hidden === false) {
            document.getElementById('neg-visitor').hidden = true
            document.getElementById('pos-visitor').hidden = true
        }
    })

    return (
        <div className="Scoreboard">
            <div className="scoreboard-header">
                <section>NOUS</section>
                <section>EUX</section>
            </div>
            <div className="scoreboard-main">
                <section ref={refHome}>
                    <span id="neg-home" hidden onClick={negHome}>-</span>
                    <div onClick={showHome} >{home}</div>
                    <span id="pos-home" hidden onClick={posHome}>+</span>
                </section>
                <div>:</div>
                <section ref={refVisitor}>
                    <span id="neg-visitor" hidden onClick={negVisitor}>-</span>
                    <div onClick={showVisitor}>{visitor}</div>
                    <span id="pos-visitor" hidden onClick={posVisitor}>+</span>
                </section>
            </div>
        </div>
    );
}

export default Scoreboard;