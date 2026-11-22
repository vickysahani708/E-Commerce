import React, { useEffect, useState } from 'react'
import './ListProduct.css'
import cross_icon from '../../assets/Admin_Assets/cross_icon.png'
function ListProduct({ token, onUnauthorized }) {
  const [allproducts, setproducts] = useState([])
  const fetchInfo = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/allproduct`)
    const data = await res.json()
    setproducts(data)
  }

  useEffect(() => {
    fetchInfo()
  }, [])

  const remove_product = async (id) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/removeproduct`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "auth-token": token },
      body: JSON.stringify({ id }),
    });
    if (response.status === 401 || response.status === 403) return onUnauthorized?.();
    if (!response.ok) return alert("Could not remove product. Please try again.");
    await fetchInfo();
  };

  return (
    <div className='list-product'>
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <div>Products</div>
        <div>Title</div>
        <div>Old Price</div>
        <div>New Price</div>
        <div>Category</div>
        <div>Remove</div>
      </div>
      <div className="listproduct-allproducts">
        <hr />

        {allproducts.map((product) => (
          <React.Fragment key={product.id}>
            <div className="listproduct-format-main listproduct-format">
              <img
                src={product.image}
                alt=""
                className="listproduct-product-icon"
              />
              <p>{product.name}</p>
              <p>${product.old_price}</p>
              <p>${product.new_price}</p>
              <p>{product.category}</p>
              <img
                onClick={() => remove_product(product.id)}
                src={cross_icon}
                alt=""
                className="listproduct-remove-icon"
              />
            </div>
            <hr />
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default ListProduct
