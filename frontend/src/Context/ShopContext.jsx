import React, { createContext, useState, useEffect } from 'react';

export const ShopContext = createContext(null);

const getDefaultCart = () => {
  let cart = {};
  for (let i = 0; i <= 300; i++) {
    cart[i] = 0;
  }
  return cart;
};

const ShopContextProvider = (props) => {
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [all_product, setAll_product] = useState([]);

  // Fetch all products and user cart
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:4000/allproduct');
        const data = await res.json();
        setAll_product(data);
      } catch (err) {
        console.log("Error fetching products:", err);
      }
    };

    const fetchCart = async () => {
      const token = localStorage.getItem('auth-token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:4000/getcart', {
          method: 'POST',
          headers: { 'auth-token': token }
        });
        const data = await res.json();
        setCartItems(data);
      } catch (err) {
        console.log("Error fetching cart:", err);
      }
    };

    fetchProducts();
    fetchCart();
  }, []);

  // Add item to cart
  const addToCart = async (itemId) => {
    setCartItems(prev => ({ ...prev, [itemId]: prev[itemId] + 1 }));

    const token = localStorage.getItem('auth-token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:4000/addcart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify({ itemId })
      });
      const data = await res.json();
      console.log("Add to cart response:", data);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  // Remove item from cart
  const removeCart = async (itemId) => {
    setCartItems(prev => ({ ...prev, [itemId]: prev[itemId] - 1 }));

    const token = localStorage.getItem('auth-token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:4000/removeFromcart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify({ itemId })
      });
      const data = await res.json();
      console.log("Remove from cart response:", data);
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  // Calculate total cart amount
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = all_product.find(p => p.id === Number(item));
        if (itemInfo) totalAmount += itemInfo.new_price * cartItems[item];
      }
    }
    return totalAmount;
  };

  // Calculate total cart items
  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) totalItem += cartItems[item];
    }
    return totalItem;
  };

  const contextValue = {
    all_product,
    cartItems,
    addToCart,
    removeCart,
    getTotalCartAmount,
    getTotalCartItems
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
