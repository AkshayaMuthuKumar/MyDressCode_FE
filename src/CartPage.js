import React from 'react'; 
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from './config';

const CartPage = ({ cartItems, removeFromCart, currentUser }) => {
  const navigate = useNavigate();

  // Calculate total price based on current quantities
  const cartTotal = cartItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  // Function to handle checkout and open Razorpay
  const handleCheckout = async () => {

    const isScriptLoaded = await loadRazorpayScript();
  
    if (!isScriptLoaded) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const amount = cartTotal; // Total amount to be paid
    const currency = 'INR'; // Currency code

    try {
      // Create order in backend
      const response = await axios.post('http://localhost:5000/create-order', {
        amount,
        currency,
      });

      const { key_id } = response.data; // Get Razorpay key id
      const options = {
        key: key_id,
        amount: response.data.amount,
        currency: response.data.currency,
        name: 'Your Company Name',
        description: 'Test Transaction',
        order_id: response.data.id, // Order ID from Razorpay
        handler: function (response) {
          alert(`Payment Successful: ${response.razorpay_payment_id}`);
          // Here you can call your backend to save the payment info
        },
        prefill: {
          name: currentUser.username, // Use current user's name
          email: currentUser.email, // Use current user's email
          contact: currentUser.phone_number, // Use current user's phone number
        },
        notes: {
          address: 'Customer Address',
        },
        theme: {
          color: '#F37254',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open(); // Open Razorpay modal
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  return (
    <Container className="py-4 mt-5">
      <h1 className="text-center mb-4">YOUR SHOPPING CART</h1>
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
                  <Card.Title>{item.product_name}</Card.Title>
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
  );
};

export default CartPage;
