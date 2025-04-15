import React from 'react'
import Navigation from "./router";
import NetworkStatusIndicator from "./components/NetworkStatusIndicator";

function App() {
  return (
    <>
      <NetworkStatusIndicator />
      <Navigation />
    </>
  )
}

export default App;
