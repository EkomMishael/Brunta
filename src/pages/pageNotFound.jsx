import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import '../routercss.css'

export default function PageNotFound(){
    const navigate=useNavigate()
    return(
        <div className='flex justify-center flex-col items-center w-full h-screen relative' >
            <span className='ml-6 mr-6'>
                            <h1 className='error-head text-6xl'>404 -  Page Not Found</h1>
            <h2 className=' text-3xl'>Oops! This page doesn’t exist.</h2>
            <p className=' text-xl '>You may have mistyped the address or the page may have moved.</p>
            <Link onClick={()=>navigate(-1)} className='error-head text-xl'>Go Back  </Link>
            </span>

        </div>
    )
}