import Axios from "axios"

function findAllTeams(){
    return Axios
        .get('http://localhost:8000/api/teams')
        .then(response => response.data['hydra:member'])
}

function deleteCoachOnTeam(id){
    return Axios.put("http://localhost:8000/api/teams/" + id,
            { coach: null }
            )
}

function changePlayers(players){
    console.log(players);
    {/*
        {players.map((id, picture, user) => (
            <PlayerComponent id={id} picture={picture} user={user} />,
                document.getElementById('playersBox')

        ))}
        */}
}

export default {
    deleteCoachOnTeam,
    findAllTeams,
    changePlayers,
}