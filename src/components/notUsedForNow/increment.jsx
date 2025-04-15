import { useState } from "react"

function Incrementer(){
    const [val,setVal]=useState(0);
    
    const addVal=()=>{
        setVal(val + 1)}
    
    const reduceVal=()=>{
        setVal(val - 1)

    }

    
    return(
        <div>
            <p>{val}</p>
            <button onClick={()=>addVal()}>INCREASE</button>
            <button onClick={()=>reduceVal()}>DECREASE</button>
        </div>
    )
}
export default Incrementer;