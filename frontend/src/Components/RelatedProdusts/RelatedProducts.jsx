import React from 'react'
import Item from '../items/item'
import "./RelatedProduct.css";
import data_product from '../assets/Frontend_Assets/data'
function RelatedProducts() {
  return (
    <div className='relatedproducts'>
      <h1>Related Product</h1>
      <hr/>
      <div className="relatedproducts-item">
        {data_product.map((item,i)=>{
          return <Item key={i} id={item.id} image={item.image} 
          name={item.name} new_price={item.new_price} 
          old_price={item.old_price}/>
        })}
      </div>
    </div>
  )
}

export default RelatedProducts
