import './NewCollections.css'
import Item from '../items/item'
import React, { useState, useEffect } from 'react'
function NewCollections() {
  const [new_collections,setNew_collection] = useState([])
  useEffect(() =>{
     fetch(`${import.meta.env.VITE_API_URL}/newcollections`).then((response) =>response.json()).then((data) => setNew_collection(data))
  },[])
  return (
    <div className='new-collections'>
      <h1>NEW COLLECTIONS</h1>
      <hr/>
      <div className="collections">
        {new_collections.map((item,i)=>{
             return <Item key={i} id={item.id} image={item.image} name={item.name} new_price={item.new_price} old_price={item.old_price}/>
        })}
      </div>
    </div>
  )
}

export default NewCollections
