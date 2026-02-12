import React from 'react'
import './NewCollections.css'
import new_collections from '../assets/Frontend_Assets/new_collections'
import Item from '../items/item'
import { useState } from 'react'
import { useEffect } from 'react'
function NewCollections() {
  const [new_collection,setNew_collection] = useState([])
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
