const { default: Axios } = require("axios");




function sendMailToPlayer(email, club) {
    return Axios
        .post("http://localhost:8000/api/emailPlayer",
            {
                url: 'http://localhost:3000/#/registerPlayer/',
                email,
                club
            }
        )
}

export default {
    sendMailToPlayer
}