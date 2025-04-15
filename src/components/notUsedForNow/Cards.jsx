
    function MakeCard({img,head,descript}){
        
        return(
            <div class="card" style={{width: '18rem',borderRadius:'30px',boxShadow:'#a9a9a9 0 20px 20px 0px'}}>
                <img className="card-img-top" src={img} alt="Card cap"></img>
                <div className="card-body">
                    <h3 className="card-title">{head}</h3>
                    <p className="card-text">{descript}</p>
                </div>
                <div className="card-body">
                <button>Strat Now</button>
                </div>
            </div>

        )
    }


export default MakeCard;