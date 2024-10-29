import {React,useState,useContext} from 'react'; 
import { useParams } from 'react-router-dom';

import { Container, Row, Col, Card, Button, Badge, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from './config';
import { FaShoppingCart, FaHeart, FaStar } from 'react-icons/fa';
import { AuthContext } from '../src/UserContext';

const CartPage = ({ cartItems, removeFromCart, currentUser }) => {
  const { isAuthenticated} = useContext(AuthContext);
console.log ("cartItems",cartItems)
  const navigate = useNavigate();
  const { productId } = useParams();

  // Calculate total price based on current quantities
  const cartTotal = cartItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
  const [reviews, setReviews] = useState([]);
  const [showAlert, setShowAlert] = useState(false); // Add alert state

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewDetails, setReviewDetails] = useState({
    name: '',
    email: '',
    date: '',
    experience: '',
    rating: 0,
    text: ''
  });
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
 

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setShowAlert(true);
    } 
    
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert('Razorpay SDK failed to load. Please try again.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/create-order`, { amount: cartTotal, currency: 'INR' });
      const options = {
        key: response.data.key_id,
        amount: response.data.amount,
        currency: response.data.currency,
        order_id: response.data.id,
        handler: () => {
          alert('Payment Successful!');
          setShowReviewModal(true); // Open review modal after successful payment
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/products/addReview`, {
        productId,
        ...reviewDetails
      });
      alert('Review submitted successfully!');
      setShowReviewModal(false);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <>
    <Container className="py-4 mt-5">
      <h1 className="text-center mb-4">YOUR SHOPPING CART</h1>
      {showAlert && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <strong>Please login to proceed with the checkout!</strong>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setShowAlert(false)} // Close the alert
          ></button>
        </div>
      )}
      <Row>
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <Col md={4} key={item.id} className="mb-4">
              <Card style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '10px',
                  position: 'relative',
                  height: '100%', // Ensures the card takes full height
                  display: 'flex',
                  flexDirection: 'column', // Aligns content vertically
                }}

>
                <Card.Img variant="top" src={item.image} 
                 style={{
                  borderRadius: '10px',
                  width: '100%', // Ensures the image takes full width
                  height: '200px', // Sets a fixed height for images
                  objectFit: 'cover', // Ensures the image covers the area without distortion
                }}/>
                <Card.Body>
                  <Card.Title>{item.name}</Card.Title>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Card.Text>
                        Price: ₹ {Number(item.price).toFixed(2)} <br />
                        Quantity: {item.quantity} {/* Show quantity if needed */}
                      </Card.Text>
                    </div>
                    <div>
                      <Button variant="danger" onClick={() => removeFromCart(item.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <h4 className="text-center">Your cart is empty</h4>
          </Col>
        )}
      </Row>

      {/* Show total price and checkout button if there are items in the cart */}
      {cartItems.length > 0 && (
        <div className="text-center mt-4">
          <h3 className='mb-2'>
            Total: <Badge bg="success">₹ {cartTotal.toFixed(2)}</Badge>
          </h3>
          <Button variant="primary" onClick={handleCheckout}>
            Proceed to Checkout
          </Button>
        </div>
      )}
    </Container>

<Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
<Modal.Header closeButton>
  <Modal.Title>Submit Your Review</Modal.Title>
</Modal.Header>
<Modal.Body>
  <Form onSubmit={handleReviewSubmit}>
    <Form.Group className="mb-3">
      <Form.Label>Your Name</Form.Label>
      <Form.Control
        type="text"
        value={reviewDetails.name}
        onChange={(e) => setReviewDetails({ ...reviewDetails, name: e.target.value })}
        required
      />
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Email</Form.Label>
      <Form.Control
        type="email"
        value={reviewDetails.email}
        onChange={(e) => setReviewDetails({ ...reviewDetails, email: e.target.value })}
        required
      />
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Purchase Date</Form.Label>
      <Form.Control
        type="date"
        value={reviewDetails.date}
        onChange={(e) => setReviewDetails({ ...reviewDetails, date: e.target.value })}
        required
      />
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Rating</Form.Label>
      <div className="d-flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            size={24}
            style={{ cursor: 'pointer', marginRight: 5 }}
            color={star <= reviewDetails.rating ? '#ffc107' : '#e4e5e9'}
            onClick={() => setReviewDetails({ ...reviewDetails, rating: star })}
          />
        ))}
      </div>
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Review</Form.Label>
      <Form.Control
        as="textarea"
        rows={4}
        value={reviewDetails.text}
        onChange={(e) => setReviewDetails({ ...reviewDetails, text: e.target.value })}
        required
      />
    </Form.Group>
    <Button type="submit" variant="primary">Submit Review</Button>
  </Form>
</Modal.Body>
</Modal>
</>
  );
};

export default CartPage;
