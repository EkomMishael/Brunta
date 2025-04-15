import React from 'react'
class UserFavoriteAnimals extends React.Component{
    render(){
        return(
            <>
                <h2>FAVORITE ANIMALS</h2>
                <ul>
                    {this.props.favAnimals.map((element,index) => {if(element.substring(0,1)==='E'){return(<li key={index}>this is an {element}, {element.substring(0,1)}</li>)}else{return(<li key={index}>this is a {element},{element.substring(0,1)}</li>)}})}
                </ul>
            </>
        )
    }
    // constructor(props){
    //     super(props)
    //     this.state = {
    //         favoriteAnimal: ''
    //     }
    //     this.handleInputChange=this.handleInputChange.bind(this);
    //     this.addToFavs=this.addToFavs.bind(this);
    // }
    
    // handleInputChange (event) { 
    //     this.setState({favoriteAnimal : event.target.value})  
    //   };
      
    //   addToFavs(){
    //       App.addUserFavoriteAnimal(this.state.favoriteAnimal)
    //   }

    // render() {  
    //     return (
    //         <div></div>
}
export default UserFavoriteAnimals;