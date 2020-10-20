import React from 'react'
import CategoryBox from "../components/CategoryBox";

const CategorySlider = ({teams, category}) => {

    {/*
    let friends = this.props.list.filter( function (user) {
      return user.friend === true
    });

    let nonFriends = this.props.list.filter( function (user) {
      return user.friend !== true
    });
    var young = people.filter(function(person) {
  return person.age < 35;
});
    let young = people.filter(person => person.age < 35);
    */}
    //todo filtrer la table fct category
    const filteredTeams = teams.filter(team => team.category === category)

    return (
        <>
          <CategoryBox category={category} teams={filteredTeams(teams, category)} />
        </>
    )

}

export default CategorySlider;