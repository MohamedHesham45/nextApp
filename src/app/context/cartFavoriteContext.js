"use client";
import { createContext, useContext, useEffect, useState } from "react";

const CartFavoriteContext = createContext();

export function CartFavoriteProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [favorite, setFavorite] = useState([]);
  const [numberOfCartItems, setNumberOfCartItems] = useState(0);
  const [numberOfFavoriteItems, setNumberOfFavoriteItems] = useState(0);

  useEffect(() => {
    const cartItems = localStorage.getItem("cart");
    const favoriteItems = localStorage.getItem("favorite");
    if (cartItems) {
      const cartItemsArray = JSON.parse(cartItems);
      const cartNumber = cartItemsArray.forEach((item) => {
        let sum = 0;
        sum += item.quantityCart;
      });
      setCart(cartItemsArray);
      setNumberOfCartItems(cartNumber);
    }
    if (favoriteItems) {
      const favoriteItemsArray = JSON.parse(favoriteItems);
      setFavorite(favoriteItemsArray);
      setNumberOfFavoriteItems(favoriteItemsArray.length);
    }
  }, []);
  useEffect(() => {
    const sum = cart.reduce((total, item) => total + item.quantityCart, 0);
    setNumberOfCartItems(sum);
    console.log("Updated numberOfCartItems:", sum); // Correct value after state update
    console.log("cart", cart);
    console.log("sum", numberOfCartItems);
  }, [cart]);

  useEffect(() => {
    setNumberOfFavoriteItems(favorite.length);
  }, [favorite]);
  return (
    <CartFavoriteContext.Provider
      value={{
        cart,
        setCart,
        favorite,
        setFavorite,
        numberOfCartItems,
        setNumberOfCartItems,
        numberOfFavoriteItems,
        setNumberOfFavoriteItems,
      }}
    >
      {children}
    </CartFavoriteContext.Provider>
  );
}

export function useCartFavorite() {
  return useContext(CartFavoriteContext);
}
