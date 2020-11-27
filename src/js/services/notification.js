import { store } from "react-notifications-component"


function successNotif(message) {
    store.addNotification({
        title: "Succès",
        message: message,
        type: "success",
        insert: "top",
        container: "top-center",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
            duration: 2000,
            onScreen: true
        }
    });
}

function errorNotif(message) {
    store.addNotification({
        title: "Erreur",
        message: message,
        type: "danger",
        insert: "top",
        container: "top-center",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
            duration: 2000,
            onScreen: true
        }
    });
}

function warningNotif(message) {
    store.addNotification({
        title: "Attention",
        message: message,
        type: "danger",
        insert: "top",
        container: "top-center",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
            duration: 2000,
            onScreen: true
        }
    });
}

export default {
    successNotif,
    errorNotif,
    warningNotif
}