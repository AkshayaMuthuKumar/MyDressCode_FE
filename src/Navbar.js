import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Form, FormControl, Button, Badge, NavDropdown, Modal, ListGroup } from 'react-bootstrap';
import { FaSearch, FaHeart, FaShoppingCart, FaHeadphonesAlt } from 'react-icons/fa';
import { FiUserPlus, FiLogIn, FiLogOut } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import '../src/app.css'
import axios from 'axios';
import { useUser } from './UserContext'; // Adjust the path
import API_URL from './config';

const CustomNavbar = ({ cartItems, wishlistItems, setCartItems, setWishlistItems, isAdmin, wishlistCount, cartCount }) => {
  const navigate = useNavigate();
  console.log("cartItems", cartItems)
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const handleWishlistMouseEnter = () => setShowWishlistPopup(true);
  const handleWishlistMouseLeave = () => setShowWishlistPopup(false);
  const handleCartMouseEnter = () => setShowCartPopup(true);
  const handleCartMouseLeave = () => setShowCartPopup(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { currentUser, setLoggedInUser, currentUserId, logoutUser } = useUser(); // Use context
  const [openCategoryIndex, setOpenCategoryIndex] = useState(null);
  const [categories, setCategories] = useState([]);
  const [show, setShow] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);


  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const isAuthenticated = () => {
    return !!localStorage.getItem("token");  // or sessionStorage
  };

  useEffect(() => {
    // Load counts from local storage
    const savedCartCount = localStorage.getItem('cartCount');
    const savedWishlistCount = localStorage.getItem('wishlistCount');

    if (savedCartCount) {
      // Update the cartItems based on local storage
      setCartItems(Array.from({ length: Number(savedCartCount) }, (_, i) => ({ product_id: i + 1 }))); // Example
    }

    if (savedWishlistCount) {
      // Update the wishlistItems based on local storage
      setWishlistItems(Array.from({ length: Number(savedWishlistCount) }, (_, i) => ({ product_id: i + 1 }))); // Example
    }

    // Load logged in user data
    const user = localStorage.getItem('loggedInUser');
    if (user) {
      setLoggedInUser(JSON.parse(user));
    }
  }, [setCartItems, setWishlistItems, setLoggedInUser]);

  useEffect(() => {
    // Store counts in local storage whenever cartItems or wishlistItems changes
    localStorage.setItem('cartCount', cartItems.length);
    localStorage.setItem('wishlistCount', wishlistItems.length);
  }, [cartItems, wishlistItems]);

  useEffect(() => {
    const user = localStorage.getItem('loggedInUser');
    const user_id = localStorage.getItem('currentUserId');
    if (user && user_id) {
      setLoggedInUser(JSON.parse(user)); // Parse and set user info
    }
  }, []);

  const toggleCategory = (index) => {
    setOpenCategoryIndex(openCategoryIndex === index ? null : index);
  };

  const handleLoginModalShow = () => {
    setShowLoginModal(true);
    setShowSignupModal(false); // Close signup if open
  };

  const handleSignupModalShow = () => {
    setShowSignupModal(true);
    setShowLoginModal(false); // Close login if open
  };

  const handleModalClose = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
  };

  const handlePopupMouseEnter = () => {
    if (showWishlistPopup) {
      setShowWishlistPopup(true);
    }
    if (showCartPopup) {
      setShowCartPopup(true);
    }
  };

  const removeFromWishlist = (id) => {
    setWishlistItems(wishlistItems.filter(item => item.product_id !== id));
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.product_id !== id));
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/users/loginUser`, loginData);
      const { token, username, user_id } = response.data;

      // Store token and user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('loggedInUser', JSON.stringify({ username }));
      localStorage.setItem('currentUserId', JSON.stringify({ user_id }));

      setLoggedInUser(username);
      setSuccessMessage('Login successful!');
      setTimeout(() => {
        setShowLoginModal(false);
        setSuccessMessage('');
        setLoginData({ email: '', password: '' });
        setError('');
        window.location.reload();
      }, 1000);
    } catch (error) {
      setError('Login failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    logoutUser();
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem(`buttonColor`);
    setWishlistItems([]); // Clear wishlist and cart on logout
    setCartItems([]);
    localStorage.removeItem('cartCount'); // Clear the cart count in local storage
    localStorage.removeItem('wishlistCount'); // Clear the wishlist count in local storage
    window.location.reload();
    navigate('/'); // Add this line

  };

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/getUniqueFilters`);
        const productData = response.data.filters;
        setCategories(productData.categories);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };

    fetchFilters();
  }, []);

  const handleSubcategoryClick = (category, subcategory) => {
    console.log("category", category)
    const categoryName = category.category;
    const subcategoryName = subcategory;
    navigate(`/category/${categoryName}?subcategory=${subcategoryName}`);
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  // Handle input change for signup
  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData({ ...signupData, [name]: value });
  };
  // Handle signup form submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/users/signupUser`, signupData);

      setError(''); // Clear any previous error messages

      // Show success message and close modal after 2 seconds
      setSuccessMessage('Signup successful! Please log in.');

      setTimeout(() => {
        setSuccessMessage(''); // Clear the success message
        setSignupData({ username: '', email: '', password: '', phone_number: '' }); // Clear the signup data
        setShowSignupModal(false); // Close the modal
        setError(''); // Clear any previous error messages

      }, 1500);

    } catch (error) {
      setTimeout(() => {

        setError('Signup failed: ' + (error.response?.data?.message || error.message));
      }, 1500);

      console.error('Signup error:', error);
    }
  };

  const fetchSuggestions = async (query) => {
    try {
      if (query.length > 2) {
        const response = await axios.get(`${API_URL}/products/search?query=${query}`);
        setSuggestions(response.data.products); // Assuming products is returned in data
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchSuggestions(query);
  };

  // Handle suggestion click
  const handleSuggestionClick = (product) => {
    setSelectedSuggestion(product);
    setSearchQuery(product.name);
    setSuggestions([]); // Hide the suggestions after selection
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (selectedSuggestion) {
      // Navigate to the category page with the selected product
      navigate(`/category/${selectedSuggestion.category}?product=${selectedSuggestion.id}`);
    } else if (searchQuery) {
      // If no suggestion is selected, you can either show an error or search by the query
      navigate(`/category/search?query=${searchQuery}`);
    }
  };


  return (
    <>
      <div className="bg-white py-3 shadow-sm fixed-navbar" style={{ top: 0 }}>
        <Container className="d-flex justify-content-between align-items-center ">
        <Navbar.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
    <img src="images/mydresscodelogo.png" alt="MyDressCode" width="180" height="60" />
</Navbar.Brand>

         
          <Form className="d-flex w-50" onSubmit={handleSearchSubmit}>
          <FormControl
              type="search"
              placeholder="Type to search i.e. 'sunglass'..."
              className="me-2"
            value={searchQuery}
            onChange={handleInputChange}
            aria-label="Search"

          />
        
          <Button variant="outline-secondary" type="submit">
              <FaSearch />
            </Button>
          {suggestions.length > 0 && (
            <ListGroup className="suggestions-dropdown">
              {suggestions.map((product) => (
                <ListGroup.Item key={product.id} onClick={() => handleSuggestionClick(product)}>
                  {product.name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Form>
           

          <div className="d-flex align-items-center">

            <span className="ms-4"> Hello, {currentUser ? currentUser.username : "Guest"}!</span>

            {currentUser ? (
              <FiLogOut className="ms-4" style={{ cursor: 'pointer' }} onClick={handleLogout} />
            ) : (
              <>
                <FiLogIn className="ms-4" style={{ cursor: 'pointer' }} onClick={handleLoginModalShow} />
                <FiUserPlus className="ms-4" style={{ cursor: 'pointer' }} onClick={handleSignupModalShow} />
              </>
            )}

            {/* Wishlist Popup */}
            <Nav.Link
              className="text-dark ms-4 position-relative"
              onMouseEnter={handleWishlistMouseEnter}
              onMouseLeave={handleWishlistMouseLeave}
              onClick={() => navigate('/wishlist')}
              style={{ cursor: 'pointer' }}
            >
              <FaHeart />
              {wishlistCount > 0 && (
                <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
                  {wishlistCount} {/* Display count of unique wishlist items */}
                </Badge>
              )}

              {/* Wishlist Popup */}
              {showWishlistPopup && (
                <div
                  className="wishlist-popup position-absolute"
                  onMouseEnter={handlePopupMouseEnter}
                  onMouseLeave={handleWishlistMouseLeave}
                  style={{
                    top: '100%', left: '0px', width: '300px', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                    padding: '10px',
                    zIndex: 12,
                    overflowY: 'auto',
                    maxHeight: '250px',
                    overflowX: 'hidden',
                    transform: 'translateX(-100%)',
                  }}
                >
                  {wishlistCount > 0 ? (
                    wishlistItems.map(item => (
                      <div
                        key={item.product_id} // Use unique ID for each item
                        className="d-flex align-items-center mb-2 position-relative"
                        style={{ overflow: 'hidden' }}
                      >
                        <img
                          src={item.image} // Assuming item has an image property
                          alt={item.product_name}
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                            marginRight: '10px'
                          }}
                        />
                        <div className="text-truncate" style={{ maxWidth: '200px' }}>
                          <strong>{item.product_name}</strong>
                          <div>₹ {Number(item.price).toFixed(2)}</div>
                        </div>
                        {/* Remove button */}
                        <button
                          onClick={() => removeFromWishlist(item.product_id)} // Use unique ID for removal
                          className="position-absolute top-0 end-0 btn btn-sm"
                          style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer' }}
                        >
                          &times;
                        </button>
                      </div>
                    ))
                  ) : (
                    <div>No items in wishlist</div>
                  )}
                  {wishlistCount > 0 && (
                    <div className="text-center mt-2">
                                           <button onClick={() => {
                                                console.log("View button clicked!"); // Log when the button is clicked
                                                navigate('/wishlist'); // Navigate to the wishlist page
                                              }}>  <i className="fas fa-eye"
                                              ></i> </button> 


                    </div>
                  )}
                </div>
              )}
            </Nav.Link>


            {/* Cart Popup */}
            <Nav.Link
              className="text-dark ms-4 position-relative"
              onMouseEnter={handleCartMouseEnter}
              onMouseLeave={handleCartMouseLeave}
              onClick={() => navigate('/cart')}
              style={{ cursor: 'pointer' }}
            >
              <FaShoppingCart />
              {cartItems.length > 0 && (
                <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
                  {/* {cartItems.reduce((acc, item) => acc + item.quantity, 0)} Display total items */}
                  {new Set(cartItems.map(item => item.product_id)).size}

                </Badge>
              )}

              {showCartPopup && (
                <div
                  className="cart-popup position-absolute"
                  onMouseEnter={handlePopupMouseEnter}
                  onMouseLeave={handleCartMouseLeave}
                  style={{
                    top: '100%',
                    left: '0px',
                    width: '300px',
                    backgroundColor: '#fff',
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                    padding: '10px',
                    zIndex: 12,
                    overflowY: 'auto',
                    maxHeight: '250px',
                    overflowX: 'hidden',
                    transform: 'translateX(-100%)',
                  }}
                >
                  {cartItems.length > 0 ? (
                    cartItems.map(item => (
                      <div key={item.product_id} className="d-flex align-items-center mb-2 position-relative">
                        <img
                          src={item.image}
                          alt={item.product_name}
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                            marginRight: '10px'
                          }}
                        />
                        <div className="text-truncate" style={{ maxWidth: '200px' }}>
                          <strong>{item.product_name}</strong>
                          <div>₹ {Number(item.price).toFixed(2)} x {item.quantity}</div>
                        </div>
                        {/* Remove button */}
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="position-absolute top-0 end-0 btn btn-sm"
                          style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer' }}
                        >
                          &times;
                        </button>
                      </div>
                    ))
                  ) : (
                    <div>No items in cart</div>
                  )}
                  {cartItems.length > 0 && (
                    <>
                      <div className="fw-bold text-right">
                        Subtotal: ${cartTotal.toFixed(2)}
                      </div>
                      <div className="text-center mt-2">
                        <Button
                          variant="primary"
                          onClick={() => navigate('/cart')}
                        >
                          Checkout
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Nav.Link>
          </div>
        </Container>
      </div>
      <Modal
        show={showLoginModal}
        onHide={handleModalClose}
        centered
        style={{ backdropFilter: 'blur(5px)' }} // Optional: Add backdrop blur effect
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ color: '#6f42c1' }}>Login</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ backgroundColor: '#E6E6FA', padding: '40px' }}>
          {error && <div className="alert alert-danger">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          <Form onSubmit={handleLoginSubmit}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" name="email" placeholder="Enter email" onChange={handleLoginChange} />
            </Form.Group>
            <Form.Group controlId="formBasicPhoneNumber">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control type="tel" name="phone_number" placeholder="Enter Phone Number" onChange={handleLoginChange} />
            </Form.Group>
            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" placeholder="Password" onChange={handleLoginChange} />
            </Form.Group>
            <Button variant="primary" type="submit" style={{ width: '100%', marginTop: '20px' }}>
              Login
            </Button>
          </Form>
        </Modal.Body>

      </Modal>

      {/* Signup Modal */}
      <Modal
        show={showSignupModal}
        onHide={handleModalClose}
        centered
        style={{ backdropFilter: 'blur(5px)' }} // Optional: Add backdrop blur effect
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ color: '#6f42c1' }}>Signup</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#E6E6FA', padding: '40px' }}>
          {error && <div className="alert alert-danger">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          <Form onSubmit={handleSignupSubmit}>
            <Form.Group controlId="formBasicUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" name="username" placeholder="Enter username" onChange={handleSignupChange} />
            </Form.Group>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" name="email" placeholder="Enter email" onChange={handleSignupChange} />
            </Form.Group>
            <Form.Group controlId="formBasicPhoneNumber">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control type="text" name="phone_number" placeholder="Enter phone number" onChange={handleSignupChange} />
            </Form.Group>
            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" placeholder="Password" onChange={handleSignupChange} />
            </Form.Group>
            <Button variant="primary" type="submit" style={{ width: '100%', marginTop: '20px' }}>
              Signup
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Navbar
  expand="md"
  className="fixed-anothernav d-flex justify-content-center"
  style={{ backgroundColor: '#7a75c9', width: '100%', borderRadius: '0', color: 'white', paddingTop: '0px' }}
>
<Container>
  <Navbar.Toggle aria-controls="basic-navbar-nav" />
  <Navbar.Collapse id="basic-navbar-nav">
    <Nav className="me-auto" style={{ marginLeft: '-50px'}}>
      {/* Home link */}
      <Nav.Link as={Link} to="#home" style={{ color: 'white', fontWeight: 'bold', marginRight: '2px' }} className="nav-item">
        Home
      </Nav.Link>
      <Nav.Link 
  as={Link} 
  to="/category/just-arrived" 
  style={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }} 
  className="nav-item">
  Just Arrived!
</Nav.Link>

      {categories.map((categoryObj, index) => (
        <NavDropdown
          key={index}
          title={<span style={{ color: 'white', fontWeight: 'bold', marginRight: '20px' }}>{categoryObj.category}</span>}
          id={`category-dropdown-${index}`}
          className="nav-item"
        >
          <div
            style={{
              maxHeight: '300px', // Max height to prevent the dropdown from getting too large
              overflowY: 'auto', // Enable scrolling when the content exceeds max height
            }}
          >
            {categoryObj.subcategories.map((subcategory, subIndex) => (
              <NavDropdown.Item
                key={subIndex}
                onClick={() => handleSubcategoryClick(categoryObj, subcategory)}
                style={{ color: 'black', fontWeight: 'normal' }}
              >
                {subcategory}
              </NavDropdown.Item>
            ))}
          </div>
        </NavDropdown>
      ))}

      {isAdmin && (
        <Nav.Link
        className="nav-item"
          onClick={() => navigate('/add-category')}
          style={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }} 
          >
          To Add
        </Nav.Link>
      )}
    </Nav>

    {/* Help & Support Link moved here */}
    <Nav className="ms-0">
    <Nav.Link
  style={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }} 
  onClick={handleShow}
      >
        <FaHeadphonesAlt /> Help & Support
      </Nav.Link>
    </Nav>

    {/* Modal Component */}
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontWeight: 'bold', color: '#343a40' }}>Help & Support</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ textAlign: 'center' }}>
          <h5>Welcome to Our Shop!</h5>
          <p>
            If you have any questions or need assistance, please feel free to reach out to our support team.
            We are here to help you with your shopping experience!
          </p>
          <p>
            <strong>Contact Us:</strong><br />
            Email: info@mydresscode.co.in<br />
            Phone: +91 8015010545
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  </Navbar.Collapse>
</Container>

</Navbar>

    </>
  );
};

export default CustomNavbar;
