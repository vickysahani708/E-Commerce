import React from 'react'
import './popular.css'
import data_product from '../assets/Frontend_Assets/data'
import Item from '../items/item'
import { useState } from 'react'
import { useEffect } from 'react'
function Popular() {
  const[popularProducts,setPopularProducts] = useState([])
  useEffect(() =>{
    fetch(`${import.meta.env.VITE_API_URL}/popularinwomen`).then((response) => response.json()).then((data) => setPopularProducts(data))
  },[])
  return (
    <div className='popular'>
        <h1>POPULAR IN WOMEN</h1>
        <hr/>
        <div className="popular-item">
            {data_product.map((item,i)=>{
                return <Item key={i} id={item.id} image={item.image} name={item.name} new_price={item.new_price} old_price={item.old_price}/>
             })}
        </div>
      
    </div>
  )
}

export default Popular
