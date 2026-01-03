import React, { useEffect, useState } from 'react'
import './ListProduct.css'
import cross_icon from '../../assets/Admin_Assets/cross_icon.png'
function ListProduct() {
  const[allproducts,setproducts] = useState([])
  const fetchInfo = async () =>{
    await fetch('http://localhost:4000/allproduct').then((res)=>res.json()).then((data) => {setproducts(data)})

  }
  useEffect(() =>{
    fetchInfo();
  },[])
  const remove_product = async (id) => {
    await fetch('http://localhost:4000/removeproduct', {
      method: 'Post',
      headers:{
        Accepts: 'applicaton/json',
        'Content-Type': 'applicatio/json'
      },
      body: JSON.stringify({id:id})
    })
   await fetchInfo()
  }
  return (
    <div className='list-product'>
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <div >Products</div>
        <div >Title</div>
        <div >Old Price</div>
        <div >New Price</div>
        <div >Category</div>
        <div >Remove</div>
      </div>
      <div className="listproduct-allproducts">
        <hr />
         {allproducts.map((product,index) => {
           return <> <div key={index} className="listproduct-format-main listproduct-format">
            <img src={product.image} alt="" className="listproduct-product-icon" />
            <p>{product.name}</p>
            <p>${product.old_price}</p>
            <p> ${product.new_price} </p>
            <p>{product.category}</p>
           <img onClick={() => remove_product(product.id)} src={cross_icon} alt="" className="listproduct-remove-icon" />
           </div>
           <hr />
           </>
         })}
      </div>
    </div>
  )
}

export default ListProduct
