import { React, useState, useEffect } from 'react';
import { Nav, Container, Carousel, Row, Col, Card, Tab, Button } from 'react-bootstrap';
import '../src/app.css'
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import API_URL from './config';

import { Link, useNavigate } from 'react-router-dom'; // Assuming you're using React Router
const Home = () => {
  const [topCategories, setTopCategories] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); // Index to keep track of the current set of products
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  const [products, setProducts] = useState({
    recent: [],
    popular: [],
    featured: []
  });
  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration in ms
      once: true // Only animate once
    });
  }, []);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        const categoriesResponse = await axios.get(`${API_URL}/products/getTopCategories`);
        setTopCategories(categoriesResponse.data.subcategory);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchCategoriesAndProducts();

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/getProduct`); // Adjust the endpoint as necessary
        setProducts(response.data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleCardClick = (category) => {
    const categoryName = category.name;
    navigate(`/category/${categoryName}`);
  };

  const [key, setKey] = useState('recent');

  useEffect(() => {
    let interval;
    if (key === 'recent' || key === 'popular') { // Start rotation when in recent or popular tab
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.ceil(products[key].length / 4));
      }, 3000); // Change every 3 seconds
    }

    return () => clearInterval(interval); // Cleanup on unmount or tab change
  }, [products, key]);

  const renderProducts = (productArray, isTopDiscount) => {
    // Slice the product array into chunks of 4
    const chunkedProducts = [];
    for (let i = 0; i < productArray.length; i += 4) {
      chunkedProducts.push(productArray.slice(i, i + 4));
    }

    return chunkedProducts.map((chunk, index) => (
      <Row className="justify-content-center" key={index} style={{ display: index === currentIndex ? 'flex' : 'none', transition: 'opacity 0.5s' }}>
        {chunk.map((product) => (
          <Col xs={6} md={3} key={product.id}>
            {/* Wrap the card with Link to navigate to product details page */}
            <Link to={`/product/${product.product_id}`} style={{ textDecoration: 'none' }}>
              <div
                className="card"
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '10px',
                  position: 'relative',
                  height: '100%', // Ensures the card takes full height
                  display: 'flex',
                  flexDirection: 'column', // Aligns content vertically
                }}
              >
                <img
                  src={product.image}
                  className="card-img-top"
                  alt={product.name}
                  style={{
                    borderRadius: '10px',
                    width: '100%', // Ensures the image takes full width
                    height: '200px', // Sets a fixed height for images
                    objectFit: 'cover', // Ensures the image covers the area without distortion
                  }}
                />
                <div className="card-body text-center" style={{ flexGrow: 1 }}>
                  <div className="icon-group mb-2">
                  </div>
                  <h5 className="card-title" style={{ fontSize: '1rem' }}>{product.name}</h5>
                  <div className="price" style={{ fontSize: '1.25rem', color: '#6f42c1' }}>
                    ₹ {product.discountAmount}
                    <span style={{ textDecoration: 'line-through', marginLeft: '5px', fontSize: '1rem', color: '#999' }}>
                      ₹ {product.originalAmount}
                    </span>
                  </div>
                  {isTopDiscount && (
                    <div className="discount-label" style={{ color: 'red', fontWeight: 'bold', marginTop: '10px' }}>
                      {product.discountPercentage}% OFF
                    </div>
                  )}
                  {!isTopDiscount && (
                    <div className="catchy-phrase" style={{ color: '#6f42c1', fontWeight: 'bold', marginTop: '5px' }}>
                      Just In!
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </Col>
        ))}
      </Row>
    ));
  };

  const renderRecentProducts = () => {
    return (
      <Row className="justify-content-center">
        {products.recent.map((product) => (
          <Col xs={6} md={6} lg={2} key={product.id} className="mb-4">
            <Link to={`/product/${product.product_id}`} style={{ textDecoration: 'none' }}>
              <Card style={{
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                padding: '10px',
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <Card.Img
                  variant="top"
                  src={product.image}
                  alt={product.name}
                  style={{ borderRadius: '10px', height: '200px', objectFit: 'cover', width: '100%' }}
                />
                <Card.Body className="text-center">
                  <b><h5 className="card-title" style={{ fontSize: '12px', fontWeight: 'bold' }}>{product.name.toUpperCase()}</h5></b>
                  <div className="price" style={{ fontSize: '15px', color: '#6f42c1' }}>
                  ₹ {product.discountAmount}
                    <span style={{ textDecoration: 'line-through', marginLeft: '5px', fontSize: '13px', color: '#999' }}>
                      ₹ {product.originalAmount}
                    </span>
                  </div>
                  <div className="catchy-phrase" style={{ color: '#6f42c1', fontWeight: 'bold', marginTop: '5px' }}>
                    Just In!
                  </div>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    );
  };
  const itemsPerSlide = 4; // Number of images per slide

  const handlePrev = () => {
    setCurrentIndex(prevIndex => (prevIndex - itemsPerSlide + topCategories.length) % topCategories.length);
  };

  const handleNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + itemsPerSlide) % topCategories.length);
  };
  return (
    <div>


      <Carousel className="spacious-container">
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://via.placeholder.com/1000x400"
            alt="First slide"
          />
          <Carousel.Caption>
            <h3 data-aos="slide-up">Exciting Offers</h3>
            <p data-aos="fade-up">Grab them while you can!</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://via.placeholder.com/1000x400"
            alt="Second slide"
          />
          <Carousel.Caption>
            <h3>Second Slide Label</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://via.placeholder.com/1000x400"
            alt="Third slide"
          />
          <Carousel.Caption>
            <h3>Third Slide Label</h3>
            <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      <Container className="my-5 spacious-container" id="recent-products">
        <h2 className="text-center">JUST ARRIVED !</h2>
        <p className="text-center mb-4" style={{ fontSize: "18px" }}>Grab it</p>
        {renderRecentProducts()}
      </Container>


      <Container className="my-4 spacious-container" id="collections" style={{ backgroundColor: "white", height: "450px" }}>
        <br></br>
        <h2 className="text-center mt-4 mb-4">SEASON WEAR</h2>
        <p className="text-center mb-5" style={{ fontSize: "18px" }}>TOP CATEGORIES</p>

        {/* Categories Carousel */}
        {topCategories && topCategories.length > 0 && (
          <div className="carousel-container">

            <Carousel indicators={false} controls={false} interval={null} activeIndex={0}>
              <Carousel.Item>
                <Row className="justify-content-center">
                  {topCategories
                    .slice(currentIndex, currentIndex + itemsPerSlide)
                    .map((category, index) => (
                      <Col md={3} sm={6} className="mb-4" data-aos="fade-up" key={index}>
                        <Card className="category-card h-100" onClick={() => handleCardClick(category)}>
                          <div className="category-image-wrapper">
                            <Card.Img variant="top" src={category.image} alt={category.name} className="category-image" />
                            <div className="category-overlay">
                              <div className="category-text">
                                <Card.Title>{category.name}</Card.Title>
                                {/* <Card.Text>{category.count} items</Card.Text> */}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                </Row>
              </Carousel.Item>
            </Carousel>
            <i className="fas fa-chevron-left carousel-nav left" onClick={handlePrev}></i>
            <i className="fas fa-chevron-right carousel-nav right" onClick={handleNext}></i>
          </div>
        )}
      </Container>


      <div className="features-section spacious-container" id="about" style={{ backgroundColor: '#7a75c9', height: '480px', paddingTop: '140px', position: 'relative', overflow: 'hidden' }}>
        {/* Optional background pattern or gradient */}
        <div className="background-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: '0.1', backgroundImage: 'url(/path/to/pattern.png)' }}></div>

        <Container>
          <Row className="text-center" data-aos="fade-up">
            <Col md={4}>
              <div className="feature-item mb-4" style={{ transition: 'transform 0.3s', cursor: 'pointer' }}>
                {/* Replace with your actual icon */}
                <img src="https://via.placeholder.com/80" alt="Free Shipping" style={{ width: '80px', height: '80px', marginBottom: '20px', transition: 'transform 0.3s' }} />
                <h5 className="text-white" style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Free Shipping</h5>
                <p className="text-white" style={{ fontSize: '1rem', maxWidth: '80%', margin: 'auto', opacity: 0.9 }}>Enjoy free shipping on all orders above ₹500.</p>
              </div>
            </Col>

            <Col md={4}>
              <div className="feature-item mb-4" style={{ transition: 'transform 0.3s', cursor: 'pointer' }}>
                {/* Replace with your actual icon */}
                <img src="https://via.placeholder.com/80" alt="24 Hours Delivery" style={{ width: '80px', height: '80px', marginBottom: '20px', transition: 'transform 0.3s' }} />
                <h5 className="text-white" style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>24 Hours Delivery</h5>
                <p className="text-white" style={{ fontSize: '1rem', maxWidth: '80%', margin: 'auto', opacity: 0.9 }}>Guaranteed fast delivery within 24 hours in select locations.</p>
              </div>
            </Col>

            <Col md={4}>
              <div className="feature-item mb-4" style={{ transition: 'transform 0.3s', cursor: 'pointer' }}>
                {/* Replace with your actual icon */}
                <img src="https://via.placeholder.com/80" alt="Easy Return" style={{ width: '80px', height: '80px', marginBottom: '20px', transition: 'transform 0.3s' }} />
                <h5 className="text-white" style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Easy Return</h5>
                <p className="text-white" style={{ fontSize: '1rem', maxWidth: '80%', margin: 'auto', opacity: 0.9 }}>No-hassle returns within 30 days for all products.</p>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Hover effects */}
        <style jsx>{`
    .feature-item:hover img {
      transform: scale(1.1);
    }
    .feature-item:hover {
      transform: translateY(-10px);
    }
  `}</style>
      </div>


      <Container className="my-5 spacious-container" id="shop">
        <h2 className="text-center">Products on Sale</h2>
        <p className="text-center mb-4">When the music’s over, turn off the lights</p>

        <Tab.Container activeKey={key} onSelect={(k) => setKey(k)}>
          <Nav variant="tabs" className="justify-content-center mb-4">
            <Nav.Item>
              <Nav.Link eventKey="recent" className="text-uppercase">Recent Listed</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="popular" className="text-uppercase">Top Discount</Nav.Link>
            </Nav.Item>
            {/* <Nav.Item>
              <Nav.Link eventKey="featured" className="text-uppercase">Top Featured</Nav.Link>
            </Nav.Item> */}
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="recent">
              <Row>
                {renderProducts(products.recent, false)} {/* Passing false for recent tab */}
              </Row>
            </Tab.Pane>
            <Tab.Pane eventKey="popular">
              <Row>
                {renderProducts(products.popular, true)} {/* Passing true for top discount tab */}
              </Row>
            </Tab.Pane>
            <Tab.Pane eventKey="featured">

            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>



      <Container className="my-5 animated-images-section spacious-container">
        <Row className="no-gutters"> {/* Remove gaps between columns */}
          <Col md={6} className="p-0"> {/* Remove padding for no gap */}
            <div className="image-container hover-zoom">
              <img
                src="images/topsaree.jpg" // Update this path to your saree collection image
                alt="Elegant Saree Collection"
                className="img-fluid same-dimensions" // Ensure same dimensions
              />
              {/* Text overlay */}
              <div className="overlay">
                <div className="text-overlay">
                  <h3>20% Off</h3>
                  <p>Elegant Saree Collection</p>
                </div>
              </div>
            </div>
          </Col>
          <Col md={6} className="p-0"> {/* Remove padding for no gap */}
            <div className="image-container hover-zoom">
              <img
                src="images/topsaree2.jpg" // Update this path to your traditional saree image
                alt="Traditional Sarees"
                className="img-fluid same-dimensions" // Ensure same dimensions
              />
              {/* Text overlay */}
              <div className="overlay">
                <div className="text-overlay">
                  <h3>Festive Offer: Buy 2 Get 1 Free</h3>
                  <p>Traditional Sarees</p>
                  <p className="text-danger">Starting From $80</p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>


      <Container className="my-5 spacious-container" id="map-section">
        <h2 className="text-center mb-4">VISIT US</h2>
        <p className="text-center mb-4">Find our store location below:</p>

        <Row className="align-items-center">
          {/* Left side: Catchy quotes with a stylish background */}
          <Col md={8}>
            <div style={{
              background: 'linear-gradient(135deg, #e6e6fa 0%, #d8bfd8 100%)', // Lavender gradient
              padding: '30px',
              borderRadius: '15px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4b0082' }}> {/* Indigo color */}
                Welcome to <span style={{ color: '#9370db' }}>My Dress Code</span>! {/* Medium purple */}
              </h3>
              <p className="lead" style={{ color: '#6a5acd' }}> {/* Slate blue */}
                Step into style with exclusive collections. Visit our store today and elevate your fashion game!
              </p>
              <p style={{ fontStyle: 'italic', color: '#4b0082', fontWeight: '600' }}> {/* Indigo */}
                <strong>"Your Style, Your Code!"</strong><br />
                Fashion trends that suit your personality. We’re just around the corner!
              </p>
              {/* Add some decorative elements */}
              <div style={{
                width: '50px',
                height: '4px',
                backgroundColor: '#9370db',  // Medium purple decorative line
                margin: '20px 0'
              }}></div>
              <p style={{ fontSize: '1.2rem', color: '#9370db' }}> {/* Medium purple text */}
                <strong>Hurry! Discover your new look with us!</strong>
              </p>
            </div>
          </Col>

          {/* Right side: Circular map embedded */}
          <Col md={4} className="text-center">
            <div style={{
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '5px solid #9370db', // Medium purple border
              position: 'relative',
              margin: 'auto'
            }}>
              <iframe
                title="Store Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3907.4317294357547!2d78.15006067481882!3d11.663784888544118!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3babf1a41174578b%3A0x11586a1987651636!2sMy%20Dress%20Code%20%40mydresscodeslm!5e0!3m2!1sen!2sin!4v1728023313943!5m2!1sen!2sin"
                style={{
                  width: '100%',
                  height: '100%',
                  border: '0',
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
                allowFullScreen=""
                aria-hidden="false"
                tabIndex="0"
              />
            </div>
          </Col>
        </Row>
      </Container>



      <footer className="footer py-5" style={{ backgroundColor: '#7a75c9' }}>
        <Container>
          <Row>
            {/* Left Section: Store Info with Icons */}
            <Col md={4} style={{ color: 'white' }}>
              <h5 style={{ fontSize: '1.5rem', fontFamily: 'Helvetica, Arial, sans-serif', marginBottom: '20px' }}>
                <i className="fas fa-store" style={{ marginRight: '10px' }}></i> My Dress Code
              </h5>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', lineHeight: '1.7' }}>
                <i className="fas fa-map-marker-alt" style={{ marginRight: '10px' }}></i>
                #221, Surya Nivass, Main Road, Sangar Nagar, Salem - 636007, Tamilnadu, India
              </p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem' }}>
                <i className="fas fa-envelope" style={{ marginRight: '10px' }}></i> info@mydresscode.co.in
              </p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem' }}>
                <i className="fas fa-phone" style={{ marginRight: '10px' }}></i> +91 8015010545
              </p>
            </Col>

            {/* Center Section: Quick Links with Icons */}
            <Col md={4} style={{ color: 'white' }}>
              <h5 style={{ fontSize: '1.5rem', fontFamily: 'Helvetica, Arial, sans-serif', marginBottom: '20px' }}>
                <i className="fas fa-link" style={{ marginRight: '10px' }}></i> Quick Links
              </h5>
              <ul className="list-unstyled" style={{ paddingLeft: '0' }}>
                <li style={{ marginBottom: '10px' }}>
                  <a href="#about" style={{ color: 'white', textDecoration: 'none', fontFamily: 'Georgia, serif', fontSize: '1.1rem' }}>
                    <i className="fas fa-info-circle" style={{ marginRight: '10px' }}></i> About Us
                  </a>
                </li>
                <li style={{ marginBottom: '10px' }}>
                  <a href="#collections" style={{ color: 'white', textDecoration: 'none', fontFamily: 'Georgia, serif', fontSize: '1.1rem' }}>
                    <i className="fas fa-tshirt" style={{ marginRight: '10px' }}></i> Our Collections
                  </a>
                </li>
                <li style={{ marginBottom: '10px' }}>
                  <a href="#locate-us" style={{ color: 'white', textDecoration: 'none', fontFamily: 'Georgia, serif', fontSize: '1.1rem' }}>
                    <i className="fas fa-map-marker-alt" style={{ marginRight: '10px' }}></i> Contact
                  </a>
                </li>
              </ul>
            </Col>

            {/* Right Section: Store Hours with Icons */}
            <Col md={4} style={{ color: 'white' }}>
              <h5 style={{ fontSize: '1.5rem', fontFamily: 'Helvetica, Arial, sans-serif', marginBottom: '20px' }}>
                <i className="fas fa-clock" style={{ marginRight: '10px' }}></i> Store Hours
              </h5>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', lineHeight: '1.7' }}>
                <i className="fas fa-calendar-day" style={{ marginRight: '10px' }}></i> Monday - Saturday: 10 AM - 8 PM
              </p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem' }}>
                <i className="fas fa-calendar-times" style={{ marginRight: '10px' }}></i> Sunday: Closed
              </p>

              <div style={{ marginTop: '30px' }}>
                <h5 style={{ fontSize: '1.5rem', fontFamily: 'Helvetica, Arial, sans-serif', marginBottom: '20px' }}>
                  <i className="fas fa-share-alt" style={{ marginRight: '10px' }}></i> Follow Us
                </h5>
                <a href="#" style={{ color: 'white', marginRight: '15px', fontSize: '1.3rem' }}>
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" style={{ color: 'white', marginRight: '15px', fontSize: '1.3rem' }}>
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" style={{ color: 'white', marginRight: '15px', fontSize: '1.3rem' }}>
                  <i className="fab fa-twitter"></i>
                </a>
              </div>
            </Col>
          </Row>

          {/* Bottom Text */}
          <Row className="mt-5">
            <Col className="text-center" style={{ color: 'white', fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '1.1rem' }}>
              <p>&copy; {new Date().getFullYear()} My Dress Code. All rights reserved.</p>
            </Col>
          </Row>
        </Container>
      </footer>




    </div>
  );
};

export default Home;
