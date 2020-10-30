import React, { useState, createContext } from 'react';

export const HomeRenderContext = createContext();

export const HomeRenderProvider = (props) => {
  const [homeRender, setHomeRender] = useState({render:false});

  return(
    <HomeRenderContext.Provider value={[homeRender, setHomeRender]}>
      {props.children}
    </HomeRenderContext.Provider>
  )
}