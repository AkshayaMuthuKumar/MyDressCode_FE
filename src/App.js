import React, { useState, useEffect } from 'react';
import { Outlet, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import CustomNavbar from './Navbar';
import CategoryForm from './CategoryForm';
import CategoryPage from './CategoryPage';
import ProductDetails from './ProductDetails';
import CartPage from './CartPage';
import WishlistPage from './WishlistPage';
import { useUser } from './UserContext'; 
import axios from 'axios';
import API_URL from './config';

function App() {
  const { currentUser, setLoggedInUser, currentUserId, logoutUser } = useUser();
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const storedCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const storedWishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];

    setCartItems(storedCartItems);
    setWishlistItems(storedWishlistItems);
    setCartCount(storedCartItems.length);
    setWishlistCount(storedWishlistItems.length);
  }, []);

  useEffect(() => {
    const fetchWishlistItems = async () => {
      const token = localStorage.getItem("token");

      if (currentUserId && token) {
        try {
          const response = await axios.get(`${API_URL}/users/${currentUserId}/getUserWishlist`, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });

          const fetchedWishlistItems = response.data;
          setWishlistItems(fetchedWishlistItems);
          localStorage.setItem('wishlistItems', JSON.stringify(fetchedWishlistItems));
          console.log(fetchedWishlistItems, "Fetched Wishlist Items");

        } catch (error) {
          console.error("Error fetching wishlist items:", error);
        }
      }
    };

    const fetchCartItems = async () => {
      const token = localStorage.getItem("token");

      if (currentUserId && token) {
        try {
          const cartResponse = await axios.get(`${API_URL}/users/${currentUserId}/getUserCart`, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
          
          const fetchedCartItems = cartResponse.data;
          setCartItems(fetchedCartItems);
          localStorage.setItem('cartItems', JSON.stringify(fetchedCartItems));
          console.log(fetchedCartItems, "Fetched cart Items");

        } catch (error) {
          console.error("Error fetching cart items:", error);
        }
      }
    };

    if (currentUserId) {
      fetchWishlistItems();
      fetchCartItems();
    }
  }, [currentUserId, currentUser]); 

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
    setCartCount(cartItems.length);
    setWishlistCount(wishlistItems.length);
  }, [cartItems, wishlistItems]);

  const handleCartUpdate = (item) => {
    setCartItems((prevCartItems) => {
      const itemExists = prevCartItems.some(cartItem => cartItem.id === item.id);
            if (!itemExists) {
        return [...prevCartItems, item];
      }
      return prevCartItems; 
    });
    setCartCount(cartItems.length + 1); 
  };

  const handleWishlistUpdate = () => {
    setWishlistCount(wishlistItems.length);    
  }

  const removeFromCart = (id) => {
    setCartItems((prevCartItems) => prevCartItems.filter(item => item.id !== id));
  };

  const removeFromWishlist = (id) => {
    setWishlistItems((prevWishlistItems) => prevWishlistItems.filter(item => item.id !== id));
  };

  console.log("wishlistItems in App:", wishlistItems);
  console.log ("currentUser app",currentUser?.isAdmin)

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
      <Router>
        <CustomNavbar
          isAdmin={currentUser?.isAdmin === 1}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          cartItems={cartItems}
          wishlistItems={wishlistItems}
          setCartItems={setCartItems}
          setWishlistItems={setWishlistItems}
        />
        <div style={{ paddingTop: '70px' }}>
          <Outlet context={{ handleCartUpdate }} /> {/* Pass handleCartUpdate to Outlet */}
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/product/:productId" element={<ProductDetails onCartUpdate={handleCartUpdate} setCartItems={setCartItems} cartItems={cartItems} wishlistItems={wishlistItems} setWishlistItems={setWishlistItems} onWishlistUpdate={handleWishlistUpdate} />} />
          <Route 
  path="/cart" 
  element={<CartPage cartItems={cartItems} removeFromCart={removeFromCart} currentUser={currentUser} />} 
/>          <Route 
    path="/wishlist" 
    element={
      <WishlistPage 
        wishlistItems={wishlistItems} 
        removeFromWishlist={removeFromWishlist}
        currentUser={currentUser}
      />} 
  />
          {currentUser?.isAdmin === 1 && <Route path="/add-category" element={<CategoryForm />} />}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
