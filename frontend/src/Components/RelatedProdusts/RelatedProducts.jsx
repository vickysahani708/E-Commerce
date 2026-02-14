import React, { useState, useEffect } from 'react';
import Item from '../items/item'
import "./RelatedProduct.css";
function RelatedProducts() {
    const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/allproduct`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Failed to fetch products:", err));
  }, []);
  return (
    <div className='relatedproducts'>
      <h1>Related Product</h1>
      <hr/>
      <div className="relatedproducts-item">
        {products.map((item,i)=>{
          return <Item key={i} id={item.id} image={item.image} 
          name={item.name} new_price={item.new_price} 
          old_price={item.old_price}/>
        })}
      </div>
    </div>
  )
}

export default RelatedProducts
