import React,{Component} from "react";
import image from './sunset.jpg'
import './Exercise3.css'

class Exercise extends Component{
    render(){
        const drinks=['Coffee','Tea','Milk'];
        const style_header = {
            color: "white",
            backgroundColor: "DodgerBlue",
            padding: "10px",
            fontFamily: "Arial"
          };
        return(
            <>
                <h1 style={style_header}>This is a Header</h1>
                <p>This is a Paragraph</p>
                <a href="#">This is a LINK</a>
                <h2>This is a FORM</h2>
                <form>
                    <p>Enter your name</p>
                    <input type="text"></input>
                    <button>Submit</button>
                </form>
                <p>Here is an image:</p>
                <img src={image} style={{width:'80vw'}}></img>
                <p>This is a list</p>
                <ul>
                    {drinks.map(element=><li>{element}</li>)}
                </ul>
            </>

        )
    }
}
export default Exercise;