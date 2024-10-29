import React, { useEffect, useState, useContext } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FaShoppingCart, FaHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../src/app.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../src/UserContext';
import API_URL from './config';

const ProductDetails = ({ setCartItems, cartItems, wishlistItems, setWishlistItems }) => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');

  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [experience, setExperience] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [highlight, setHighlight] = useState(false); // State to control highlight effect

  const [buttonColor, setButtonColor] = useState(() => {
    return localStorage.getItem(`buttonColor-${productId}`) || '#6c757d'; // Load color from localStorage
  });
  const [wishlistButtonColor, setWishlistButtonColor] = useState(() => {
    return localStorage.getItem(`wishlistButtonColor-${productId}`) || '#6c757d'; // Load wishlist button color
  });

  const { isAuthenticated, currentUser, currentUserId } = useContext(AuthContext);
  const [isAddedToCart, setIsAddedToCart] = useState(() => {
    return localStorage.getItem(`cart-${productId}`) === 'true'; // Initialize from localStorage
  });
  const [isAddedToWishlist, setIsAddedToWishlist] = useState(() => {
    return localStorage.getItem(`wishlist-${productId}`) === 'true'; // Initialize from localStorage
  });
  const [quantity, setQuantity] = useState(1);
  const productsPerPage = 4; // Number of products to show per row

  const reviewsPerPage = 2;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const highlightDuration = 120000; // Duration for highlight in milliseconds (2 minutes)

  const handleRating = (rate) => {
    setRating(rate);
  };

  const fetchProductDetails = async (productId) => {
    try {
      const response = await axios.get(`${API_URL}/products/getProductById/${productId}`);
      const productData = response.data.data;
      setProduct(productData);
      setSelectedSize(productData.size || '');
      if (productData.category) {
        await fetchProductsByCategory(productData.category); // Make sure to await this
      }
     
    } catch (error) {
      console.error('Error fetching product details:', error);
      setProduct(null);
    }
  };

  const fetchProductsByCategory = async (category) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${API_URL}/products/getProductsbySelectedCategory?getProductsbySelectedCategory=${category}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const productData = Array.isArray(response.data.data) ? response.data.data : [];
      const filteredSuggestions = productData.filter(p => p.id !== product?.id); // Use optional chaining
      setSuggestedProducts(filteredSuggestions);
    } catch (error) {
      console.error('Error fetching products by category:', error);
    }
  };


  useEffect(() => {
    // Fetch details for the initial productId when component mounts
    if (productId) {
      fetchProductDetails(productId); // Make sure productId is defined
    }
  }, [productId]);

  const handleViewDetails = (id) => {
    fetchProductDetails(id); // Fetch details for the clicked product ID
    window.scrollTo(0, 0); // Scroll to the top of the page

  };
  

  const totalPagesSugesstion = Math.ceil(suggestedProducts.length / productsPerPage);
  const handleNext = () => setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPagesSugesstion - 1));
  const handlePrevious = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  if (!product) return <p>No product found.</p>;


  const handleCartClick = async () => {
    const token = localStorage.getItem("token");
  
    if (!isAuthenticated || !currentUserId) {
      // Toggle cart state for unauthenticated users
      if (isAddedToCart) {
        setCartItems(cartItems.filter(item => item.productId !== productId));
        setButtonColor('#6c757d'); // Grey for removal
      } else {
        setCartItems([...cartItems, { productId, name: product.name, quantity, price: product.discountAmount }]);
        setButtonColor('#dc3545'); // Red for addition
      }
      setIsAddedToCart(!isAddedToCart);
      localStorage.setItem(`cart-${productId}`, !isAddedToCart ? 'true' : 'false');
      localStorage.setItem(`buttonColor-${productId}`, !isAddedToCart ? '#dc3545' : '#6c757d');
    } else {
      // Toggle cart state for authenticated users
      try {
        const response = await axios.post(
          `${API_URL}/users/${currentUserId}/toggleCartItem`, 
          { productId, product_name: product.name, image: product.image, quantity, price: product.discountAmount || product.originalAmount },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        const { isAdded, buttonColor, cartItem } = response.data;
        setCartItems(isAdded ? [...cartItems, cartItem] : cartItems.filter(item => item.productId !== productId));
        setButtonColor(buttonColor);
        setIsAddedToCart(isAdded);
        localStorage.setItem(`buttonColor-${productId}`, buttonColor);
      } catch (error) {
        console.error('Error toggling cart item:', error);
      }
    }
    window.location.reload(); // Reloads the page after toggle

  };
  
  const handleWishlistClick = async () => {
    const token = localStorage.getItem("token");
  
    if (!isAuthenticated || !currentUserId) {
      // Toggle wishlist state for unauthenticated users
      if (isAddedToWishlist) {
        setWishlistItems(wishlistItems.filter(item => item.productId !== productId));
        setWishlistButtonColor('#6c757d'); // Grey for removal
      } else {
        setWishlistItems([...wishlistItems, { productId, name: product.name, price: product.discountAmount }]);
        setWishlistButtonColor('#dc3545'); // Red for addition
      }
      setIsAddedToWishlist(!isAddedToWishlist);
      localStorage.setItem(`wishlist-${productId}`, !isAddedToWishlist ? 'true' : 'false');
      localStorage.setItem(`wishlistButtonColor-${productId}`, !isAddedToWishlist ? '#dc3545' : '#6c757d');
    } else {
      // Toggle wishlist state for authenticated users
      try {
        const response = await axios.post(
          `${API_URL}/users/${currentUserId}/toggleWishlistItem`, 
          { productId, product_name: product.name, image: product.image, price: product.discountAmount || product.originalAmount },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        const { isAdded, buttonColor, wishlistItem } = response.data;
        setWishlistItems(isAdded ? [...wishlistItems, wishlistItem] : wishlistItems.filter(item => item.productId !== productId));
        setWishlistButtonColor(buttonColor);
        setIsAddedToWishlist(isAdded);
        localStorage.setItem(`wishlistButtonColor-${productId}`, buttonColor);
      } catch (error) {
        console.error('Error toggling wishlist item:', error);
      }
    }
    window.location.reload(); // Reloads the page after toggle

  };
  
  



  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    const newReview = {
      productId,
      name: reviewName,
      email: reviewEmail,
      purchaseDate,
      experience,
      rating,
      review: reviewText,
    };

    try {
      const response = await axios.post(`${API_URL}/products/addReview`, newReview);
      if (response.status === 201) {
        setReviewName('');
        setReviewEmail('');
        setPurchaseDate('');
        setExperience('');
        setRating(0);
        setReviewText('');
        alert('Review submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleCarouselPageChange = (newPage) => {
    setCurrentPage(newPage >= totalPages ? totalPages - 1 : newPage);
  };

  return (
    <div className="container product-details" style={{ marginTop: "150px" }}>
     
     <div className={`row ${highlight ? 'highlight' : ''}`}> {/* Add highlight class conditionally */}
     <div className="col-md-6">
          <div className="product-images">
            <div className="row mb-3">
              
              <div className="col-9">
                <img src={product.image} alt={product.name} className="img-fluid" style={{width:"500px"}} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <h3 className="text-primary">{product.name}</h3>
          <div className="price-section">
            {product.discountAmount ? (
              <>
                {/* Display discounted price */}
                <span className="text-danger display-4">₹{product.discountAmount}</span>
                {/* Display original price as crossed-out */}
                <span className="text-muted ms-3">
                  <del>₹{product.originalAmount}</del>
                </span>
              </>
            ) : (
              // Display original price when there's no discount
              <span className="text-danger display-4">₹{product.originalAmount}</span>
            )}
          </div>

          <div className="reviews my-3">
            <span className="text-warning">★★★★★</span>
          </div>

          <p className="my-4">{product.description || 'No product description available.'}</p>

          <p className="my-4">Available: {product.stock}</p>
          <p className={product.stock > 0 ? "text-success" : "text-danger"}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </p>

          <div className="sizes my-4">
            <span>Size:</span>
            <div className="size-options mt-2">
              {['With Blouse', 'Without Blouse'].map((size) => (
                <button
                  key={size}
                  className={`btn me-2 ${selectedSize === size ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  onClick={() => handleSizeChange(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="quantity d-flex align-items-center my-4">
            <button className="btn btn-outline-secondary" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={product.stock <= 0}>-</button>
            <input type="text" value={quantity} className="form-control w-25 text-center mx-2" readOnly />
            <button className="btn btn-outline-secondary" onClick={() => setQuantity(quantity + 1)} disabled={product.stock <= 0}>+</button>
          </div>

          <div className="row mb-3">
            <div className="col-6 col-md-4">
              <button
                onClick={handleCartClick}
                className="btn btn-icon btn-lg w-100 d-flex justify-content-center align-items-center"
                style={{ color: buttonColor }} // Color set by backend response
                disabled={product.stock <= 0} // Disable if out of stock

              >
                <FaShoppingCart size={24} />
              </button>
              {/* <WishlistPage handleAddToCart={handleAddToCart} /> */}
            </div>
            <div className="col-6 col-md-4">
              <button
                onClick={handleWishlistClick}
                className="btn btn-icon btn-add-to-wishlist btn-lg w-100 d-flex justify-content-center align-items-center"
                style={{ color: wishlistButtonColor }}
              >
                <FaHeart size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {suggestedProducts.length > 0 && (
        <div className="suggestions mt-5">
          <h4 className="text-center mb-4">Related Products</h4>
          <div className="carousel-container d-flex align-items-center position-relative">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className="btn btn-outline-primary rounded-circle mx-2"
              style={{ width: "40px", height: "40px" }}
            >
              <FaChevronLeft />
            </button>
            <div className="row w-100">
              {suggestedProducts
                .slice(currentPage * productsPerPage, (currentPage + 1) * productsPerPage)
                .map((suggestedProduct) => (
                  <div key={suggestedProduct.id} className="col-md-3 col-sm-6 mb-4">
                    <div className="card shadow-sm h-100">
                      <img src={suggestedProduct.image} alt={suggestedProduct.name} className="card-img-top rounded-top" style={{ height: '180px', objectFit: 'cover' }} />
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title text-center">{suggestedProduct.name}</h5>
                        <p className="card-text text-center text-danger fw-bold">
                        ₹{suggestedProduct.discountAmount || suggestedProduct.originalAmount}
                        </p>
                        <button
                          className="btn btn-outline-primary mt-auto"
              onClick={() => handleViewDetails(suggestedProduct.product_id)} // Call function with product ID
                          >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
              className="btn btn-outline-primary rounded-circle mx-2"
              style={{ width: "40px", height: "40px" }}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;