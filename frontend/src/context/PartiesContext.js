import React, { useState, createContext } from 'react';

export const PartiesContext = createContext();

export const PartiesInfoProvider = (props) => {
  const [parties, setParties] = useState([]);

  return(
    <PartiesContext.Provider value={[parties, setParties]}>
      {props.children}
    </PartiesContext.Provider>
  )
}