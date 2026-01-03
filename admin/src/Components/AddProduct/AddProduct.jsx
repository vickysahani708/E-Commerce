import React, { useState } from 'react';
import './AddProduct.css';
import upload_area from '../../assets/Admin_Assets/upload_area.svg';

export default function AddProduct() {
  const [image, setImage] = useState(false);
  const [productDetails, setProductDetails] = useState({
    name: '',
    image: '',
    category: 'women',
    new_price: '',
    old_price: '',
  });

  // Handle input changes
  const detailshandler = (e) => {
    setProductDetails({
      ...productDetails,
      [e.target.name]: e.target.value,
    });
  };

  // Handle image selection
  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  // Add product
  const Add_Product = async () => {
    if (!image) {
      alert("Please select an image");
      return;
    }

    try {
      // 1️⃣ Upload image
      const formData = new FormData();
      formData.append('product', image);

      const uploadRes = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        alert("Image upload failed");
        return;
      }

      // 2️⃣ Update productDetails with uploaded image URL
      const updatedProduct = {
        ...productDetails,
        image: uploadData.image_url,
        new_price: Number(productDetails.new_price),
        old_price: Number(productDetails.old_price),
      };

      // 3️⃣ Send product to backend
      const res = await fetch('http://localhost:4000/addproducts', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });

      const result = await res.json();



        // Reset form
        setProductDetails({
          name: '',
          image: '',
          category: 'women',
          new_price: '',
          old_price: '',
        });
        setImage(false);

    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className='add-product'>
      <div className='addproduct-itemfield'>
        <p>Product Title</p>
        <input
          value={productDetails.name}
          onChange={detailshandler}
          type="text"
          name='name'
          placeholder='Type here'
        />
      </div>

      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input
            value={productDetails.old_price}
            onChange={detailshandler}
            type="text"
            name='old_price'
            placeholder='Type-here'
          />
        </div>

        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input
            value={productDetails.new_price}
            onChange={detailshandler}
            type="text"
            name='new_price'
            placeholder='Type-here'
          />
        </div>
      </div>

      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select
          value={productDetails.category}
          onChange={detailshandler}
          name='category'
          className='add-product-selector'
        >
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select>
      </div>

      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : upload_area}
            className="addproduct-thumnail-img"
            alt=""
          />
        </label>
        <input
          onChange={imageHandler}
          type='file'
          name='image'
          id='file-input'
          hidden
        />
      </div>

      <button onClick={Add_Product} className='addproduct-btn'>
        Add
      </button>
    </div>
  );
}
