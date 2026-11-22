import React, { useContext, useState } from 'react'
import './CartItem.css'
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../assets/Frontend_Assets/cart_cross_icon.png'

function CartItem() {

    const { all_product, cartItems, removeCart, getTotalCartAmount, clearCart } = useContext(ShopContext);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentError, setPaymentError] = useState("");
    const [paymentMessage, setPaymentMessage] = useState("");

    const loadRazorpayScript = () => new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

    const handleCheckout = async () => {
        const token = localStorage.getItem("auth-token");
        if (!token) {
            setPaymentError("Please log in before checkout.");
            return;
        }
        if (getTotalCartAmount() <= 0) {
            setPaymentError("Your cart is empty.");
            return;
        }

        setPaymentLoading(true);
        setPaymentError("");
        setPaymentMessage("");

        try {
            const orderResponse = await fetch(`₹{import.meta.env.VITE_API_URL}/api/payments/create-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "auth-token": token },
            });
            const orderData = await orderResponse.json();
            if (!orderResponse.ok || !orderData.success) {
                throw new Error(orderData.message || "Could not start checkout.");
            }

            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) throw new Error("Razorpay checkout could not be loaded. Please try again.");

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "E-Commerce Store",
                description: "Secure order payment",
                order_id: orderData.razorpayOrderId,
                handler: async (paymentResponse) => {
                    try {
                        const verifyResponse = await fetch(`₹{import.meta.env.VITE_API_URL}/api/payments/verify-payment`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json", "auth-token": token },
                            body: JSON.stringify(paymentResponse),
                        });
                        const verifyData = await verifyResponse.json();
                        if (!verifyResponse.ok || !verifyData.success) {
                            throw new Error(verifyData.message || "Payment verification failed.");
                        }
                        clearCart();
                        setPaymentMessage("Payment successful! Your order is confirmed.");
                    } catch (error) {
                        setPaymentError(error.message || "Payment verification failed. Contact support with your payment ID.");
                    } finally {
                        setPaymentLoading(false);
                    }
                },
                modal: { ondismiss: () => setPaymentLoading(false) },
                theme: { color: "#ff5a5a" },
            };

            const checkout = new window.Razorpay(options);
            checkout.on("payment.failed", (response) => {
                setPaymentError(response.error?.description || "Payment failed. Please try again.");
                setPaymentLoading(false);
            });
            checkout.open();
        } catch (error) {
            setPaymentError(error.message || "Unable to start payment.");
            setPaymentLoading(false);
        }
    };

    return (
        <div className='cartitem'>
            <div className="cartitems-format-main">
                <p>Products</p>
                <p>Title</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Total</p>
                <p>Remove</p>
            </div>
            <hr />

            {
                all_product.map((e) => {
                    if (cartItems[e.id] > 0) {
                        return (
                            <div key={e.id}>
                                <div className="cartitems-format">
                                    <img src={e.image} alt='' className='cartitem-product-icon' />
                                    <p>{e.name}</p>
                                    <p>₹{e.new_price}</p>
                                    <button className='cartitems-quantity'>{cartItems[e.id]}</button>
                                    <p>₹{e.new_price * cartItems[e.id]}</p>
                                    <img 
                                        src={remove_icon} 
                                        onClick={() => removeCart(e.id)} 
                                        alt='' 
                                        className='cartitems-remove-icon'
                                    />
                                </div>
                                <hr />
                            </div>
                        );
                    }
                    return null;
                })
            }

            <div className="cartitems-down">
                <div className="cartitems-total">
                    <h1>Total Cart </h1>
                    <div>
                        <div className="cartitems-total-item">
                            <p>Subtotal</p>
                            <p>₹{getTotalCartAmount()}</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <p>Shipping</p>
                            <p>Free</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <h3>Total</h3>
                            <h3>₹{getTotalCartAmount()}</h3>
                        </div>
                    </div>

                    <button onClick={handleCheckout} disabled={paymentLoading || getTotalCartAmount() <= 0}>
                        {paymentLoading ? "PROCESSING..." : "PROCEED TO CHECKOUT"}
                    </button>
                    {paymentError && <p role="alert" style={{ color: "#c62828" }}>{paymentError}</p>}
                    {paymentMessage && <p role="status" style={{ color: "#2e7d32" }}>{paymentMessage}</p>}
                </div>

                <div className="cartitems-promocode">
                    <p>If you have a promo code, Enter it here</p>
                    <div className="cartitems-promobox">
                        <input type='text' placeholder='Promo code' />
                        <button>Submit</button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default CartItem
