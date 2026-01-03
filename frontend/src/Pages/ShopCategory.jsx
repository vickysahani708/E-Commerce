import { useContext } from 'react';
import React from 'react';
import '../CSS/ShopCategory.css';
import { ShopContext } from '../Context/ShopContext';
import dropdown_icon from '../Components/assets/Frontend_Assets/dropdown_icon.png';
import Item from '../Components/items/item';

export default function ShopCategory(props) {
  const { all_product } = useContext(ShopContext);   // ✅ FIXED

  return (
    <div className='shop-category'>
      <img className="shopcategory-banner" src={props.banner} alt='' />

      <div className="shopcategory-indexSort">
        <p>
          <span>Showing 1–12</span> out of 36 products
        </p>
        <div className="shopcategory-sort">
          Sort by <img src={dropdown_icon} alt="" />
        </div>
      </div>

      <div className="shopcategory-products">
        {all_product.map((item, i) => {
          if (item.category === props.category) {
            return (
              <Item
                key={i}
                id={item.id}
                image={item.image}
                name={item.name}
                new_price={item.new_price}
                old_price={item.old_price}
              />
            );
          }
          return null;
        })}
      </div>

      <div className="shopcategory-loadmore">
        Explore More Products
      </div>
    </div>
  );
}
