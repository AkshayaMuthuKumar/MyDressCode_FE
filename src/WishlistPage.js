import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { FaTrashAlt, FaHeart } from 'react-icons/fa'; // Import cart, trash, and heart icons
import API_URL from './config';


const WishlistPage = ({ wishlistItems, removeFromWishlist, currentUser }) => {
  const navigate = useNavigate();



  return (
    <Container className="py-4" style={{marginTop: "100px"}}>
      <h1 className="text-center mb-5" style={{ color: '#6A5ACD' }}> {/* Lavender Title */}
        <FaHeart className="me-2" style={{ color: 'red' }} /> YOUR WISHLIST <FaHeart style={{ color: 'red' }}/>
      </h1>
      <Row>
        {Array.isArray(wishlistItems) && wishlistItems.length > 0 ? (
          wishlistItems.map((item) => (
            <Col md={4} key={item.id} className="mb-4">
                            <Link to={`/product/${item.product_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>

              <Card className="shadow-sm"  style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '10px',
                  position: 'relative',
                  height: '100%', // Ensures the card takes full height
                  display: 'flex',
                  flexDirection: 'column', // Aligns content vertically
                }}
> {/* Lavender Card Border */}
                <div className="position-relative">
                  <Card.Img variant="top" src={item.image} style={{
                    borderRadius: '10px',
                    width: '100%', // Ensures the image takes full width
                    height: '200px', // Sets a fixed height for images
                    objectFit: 'cover', // Ensures the image covers the area without distortion
                  }} /> {/* Image with consistent height */}
                </div>
                <Card.Body style={{ backgroundColor: '#F5F5F5' }}> {/* Light Lavender background for card body */}
                  <Card.Title className="text-truncate" style={{ color: '#6A5ACD' }}>{item.product_name}</Card.Title> {/* Lavender Product Name */}
                  <div className="d-flex justify-content-between align-items-center">
                    {/* Larger and Bold Price */}
                    <Badge className="p-2" style={{ fontSize: '1.5rem' }}> {/* Larger Lavender Badge */}
                    ₹ {Number(item.price).toFixed(2)}
                    </Badge>

                    {/* Customized Remove Button */}
                    <Button variant="danger" onClick={() => removeFromWishlist(item.id)}>
                        <FaTrashAlt className="me-2" />

                      </Button>

            
                  </div>
                </Card.Body>
              </Card>
              </Link>
            </Col>
          ))
        ) : (
          <Col>
            <h4 className="text-center text-muted">
              <FaHeart className="me-2" style={{ color: '#DDA0DD' }} /> {/* Lavender Heart */}
              Your wishlist is empty
            </h4>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default WishlistPage;
