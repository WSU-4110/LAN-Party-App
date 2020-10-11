import React, { useState } from 'react';


// butt on

const NewButton = (props) => 
{


  const [counter, setCounter] = useState(0);
  //let counter = 0;

  const incrementCounter = () => 
  {
    console.log("counter", counter);
    setCounter(counter +1);
    //return counter++;
  }


  return(
    <button onClick={incrementCounter}>
        {counter}
    </button>
  )
}

const Home = () => {
  return(
    <>
    Home
    <NewButton text = "wordy to pass"/>
    <NewButton jimbo = "wordo to pass"/>

    

    </>
  )
}

export default Home;