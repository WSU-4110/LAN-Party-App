const filteredParties = parties.filter( parties => {
    return parties.PartyName.toLowerCase().includes( search.toLowerCase() )
  } )
  export default filteredParties;