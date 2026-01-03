import React, { useContext } from 'react';
import {ShopContext} from '../Context/ShopContext';
import Breadcrum from '../Components/Breadcrum/Breadcrum';
import { useParams } from 'react-router-dom';
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay';
import Description from '../Components/DescriptionBox/Description';
import RelatedProducts from '../Components/RelatedProdusts/RelatedProducts';

function Product() {
  const context = useContext(ShopContext);
  const { all_product } = context || {};
 
  const { productId } = useParams();
  const product = all_product?.find((item) => item.id === Number(productId));
  
  if (!all_product || all_product.length === 0) {
    return <div>Loading products...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <Breadcrum product={product} />
      <ProductDisplay product={product} />
      <Description />
      <RelatedProducts />
    </div>
  );
}

export default Product;
