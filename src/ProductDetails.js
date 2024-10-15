import React, { useEffect, useState, useContext } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FaShoppingCart, FaHeart, FaStar } from 'react-icons/fa';
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
  const [showAlert, setShowAlert] = useState(false); // State to manage alert visibility

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

  const reviewsPerPage = 2;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const handleRating = (rate) => {
    setRating(rate);
  };

  console.log(cartItems, "cartItems")
  console.log(typeof isAuthenticated); // Should log 'function'

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/getProductById/${productId}`);
        const productData = response.data.data;
        console.log("productData", productData)
        setProduct(productData);
        setSelectedSize(productData.size || '');
      } catch (error) {
        console.error('Error fetching product details:', error);
        setProduct(null);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/getReviewsByProductId/${productId}`);
        setReviews(response.data.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchProductDetails();
    fetchReviews();
  }, [productId]);
  if (!product) return <p>No product found.</p>;

  console.log("currentUserIdPD", currentUserId)

  // Handle cart click
  const handleCartClick = async () => {
    const token = localStorage.getItem("token");
    if (!isAuthenticated || !currentUserId) {
      setShowAlert(true); // Show the alert instead of alert box
      return; // Exit the function if the user is not authenticated
    }
    const productPrice = product.discountAmount || product.originalAmount;

    try {
      const response = await axios.post(`${API_URL}/users/${currentUserId}/toggleCartItem`, {
        productId: productId,
        product_name: product.name,
        image: product.image,
        quantity: quantity,
        price: productPrice
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { isAdded, buttonColor, cartItem } = response.data;
      setButtonColor(buttonColor);

      if (isAdded) {
        setCartItems([...cartItems, cartItem]); // Add item with all details to the cart
        setIsAddedToCart(true);
        localStorage.setItem(`cart-${productId}`, 'true');
        localStorage.setItem(`buttonColor-${productId}`, 'true'); // Store button color in localStorage

      } else {
        setCartItems(cartItems.filter(item => item.id !== productId)); // Remove from cart
        setIsAddedToCart(false);
        localStorage.setItem(`cart-${productId}`, 'false');
        localStorage.setItem(`buttonColor-${productId}`, 'false'); // Store button color in localStorage
      }

      localStorage.setItem(`buttonColor-${productId}`, buttonColor); // Store wishlist button color in localStorage

      

    } catch (error) {
      console.error('Error toggling cart item:', error);
    }
  };


  const handleWishlistClick = async () => {
    const token = localStorage.getItem("token");
    if (!isAuthenticated || !currentUserId) {
      setShowAlert(true); // Show the alert instead of alert box
      return; // Exit the function if the user is not authenticated
    }
    const productPrice = product.discountAmount || product.originalAmount;

    try {
      const response = await axios.post(`${API_URL}/users/${currentUserId}/toggleWishlistItem`, {
        productId: productId,
        product_name: product.name,
        image: product.image,
        price: productPrice
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { isAdded, buttonColor, wishlistItem } = response.data;

      if (isAdded) {
        setWishlistItems([...wishlistItems, wishlistItem]); // Add item with all details to the cart
        setIsAddedToWishlist(true);
        localStorage.setItem(`wishlist-${productId}`, 'true');
        localStorage.setItem(`wishlistButtonColor-${productId}`, 'true');
      } else {
        setWishlistItems(wishlistItems.filter(item => item.id !== productId)); // Remove from cart
        setIsAddedToWishlist(false);
        localStorage.setItem(`wishlist-${productId}`, 'false');
        localStorage.setItem(`wishlistButtonColor-${productId}`, 'false');
      }

      setWishlistButtonColor(buttonColor);
      localStorage.setItem(`wishlistButtonColor-${productId}`, buttonColor); // Store wishlist button color in localStorage

    } catch (error) {
      console.error('Error toggling cart item:', error);
    }
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
      {showAlert && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <strong>Please login to buy or add items to your wishlist!</strong>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setShowAlert(false)} // Close the alert
          ></button>
        </div>
      )}
      <div className="row">
        <div className="col-md-6">
          <div className="product-images">
            <div className="row mb-3">
              <div className="col-3">
                <img src={product.image} alt="Small" className="img-thumbnail mb-2" />
                <img src={product.image} alt="Small" className="img-thumbnail mb-2" />
                <img src={product.image} alt="Small" className="img-thumbnail mb-2" />
              </div>
              <div className="col-9">
                <img src={product.image} alt={product.name} className="img-fluid" />
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
                <span className="text-danger display-4">${product.discountAmount}</span>
                {/* Display original price as crossed-out */}
                <span className="text-muted ms-3">
                  <del>${product.originalAmount}</del>
                </span>
              </>
            ) : (
              // Display original price when there's no discount
              <span className="text-danger display-4">${product.originalAmount}</span>
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

      <div className="col-md-12">
        <div className="box border p-4">
          <div className="row">
            <div className="col-md-6">
              <div className="mt-5">
                <h4>Add Review</h4>
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Your Name"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Your Email"
                      value={reviewEmail}
                      onChange={(e) => setReviewEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="date"
                      className="form-control"
                      placeholder="Date of Purchase"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Overall Experience:</label>
                    <select
                      className="form-select"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Average">Average</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>

                  {/* Star Rating */}
                  <div className="mb-3">
                    <label>Rating:</label>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          size={24}
                          style={{ cursor: 'pointer', marginRight: 5 }}
                          color={star <= rating ? '#ffc107' : '#e4e5e9'}
                          onClick={() => handleRating(star)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      placeholder="Write your review here..."
                      rows="4"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Submit Review
                  </button>
                </form>
              </div>
            </div>

            {/* Display Reviews Section */}
            <div className="col-md-6">
              <h4>Reviews</h4>
              {reviews.length > 0 ? (
                <div className="review-container">
                  {reviews.map((review, index) => (
                    <div key={index} className="review-box">
                      <strong>{review.name}</strong>
                      <p>{review.experience}</p>
                      <p>{review.review}</p>
                      <small>Rating: {review.rating}/5</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No reviews available yet.</p>
              )}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductDetails;


