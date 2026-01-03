import React, { useContext } from 'react'
import './ProductDisplay.css'
import star_icon from '../assets/Frontend_Assets/star_icon.png'
import star_dull_icon from '../assets/Frontend_Assets/star_dull_icon.png'
import { ShopContext } from '../../Context/ShopContext';
function ProductDisplay(props) {
    const {product} = props;
    const {addToCart} = useContext(ShopContext);
  return (
    <div className='productdisplay'>
      <div className="productdisplay-left">
       <div className="productdisplay-img-list">
        <img src={product.image} alt="" />
        <img src={product.image} alt="" />
        <img src={product.image} alt="" />
        <img src={product.image} alt="" />
       </div>
       <div className="productdisplay-img">
         <img  className='productdisplay-main-img' src={product.image} alt="" />
       </div>
      </div>
      <div className="productdisplay-right">
        <h1>{product.name}</h1>
        <div className="productdisplay-right-star">
            <img src={star_icon} alt="" />
             <img src={star_icon} alt="" />
             <img src={star_icon} alt="" />
              <img src={star_icon} alt="" />
               <img src={star_dull_icon} alt="" />
        <p>(122)</p>
        </div>
        <div className="productdisplay-right-prices">  
            <div className="productdisplay-right-oldprice">${product.old_price}</div>
            <div className="productdisplay-right-newprice">  ${product.new_price}</div>
          
          
        </div>
        <div className="productdisplay-right-description">
            Crafted from soft and breathable fabric, this clothing item offers both comfort and style for everyday wear. Designed with a versatile fit, it’s perfect for casual outings, work, or layering with other pieces. Durable, easy to care for, and available in a variety of colors, it’s a wardrobe essential that combines functionality with timeless style.
        </div>
        <div className="productdisplay-right-size">
            <h1>Select Size</h1>
            <div className="productdisplay-right-size">
                <div>S</div>
                <div>M</div>
                <div>L</div>
                <div>XL</div>
                <div>XXL</div>
            </div>
        </div>
        <button onClick={()=> {addToCart(product.id)}}>ADD TO CART</button>
        <p className='productdisplay-right-category'><span>Category:</span> Women, T-Shirt, Crop Top</p>
         <p className='productdisplay-right-category'><span>Tags:</span> Mordern, Latest</p>
      </div>
    </div>
  )
}

export default ProductDisplay
