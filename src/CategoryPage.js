import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Font Awesome CSS
import '../src/app.css';
import { Carousel } from 'react-bootstrap';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'; // Include useSearchParams
import API_URL from './config';

const CategoryPage = () => {
  const { categoryName } = useParams(); // Get category name from the URL
  const [searchParams] = useSearchParams(); // To extract subcategory
  const subcategoryParam = searchParams.get('subcategory'); // Get subcategory from query string

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [products, setProducts] = useState([]); // Only store category products
  const [selectedFilters, setSelectedFilters] = useState({
    subcategory: [],
    price: [],
    size: [],
    brand: [],
  });
  const [sortOrder, setSortOrder] = useState('ascending');
  const [productsPerPage, setProductsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/products/getProductsbySelectedCategory?getProductsbySelectedCategory=${categoryName}`
        );
        const allresponse = await axios.get(
          `${API_URL}/products/getProductsbySelectedCategory`
        );
  
        const productData = Array.isArray(response.data.data) ? response.data.data : [];
        const allproductData = Array.isArray(allresponse.data.data) ? allresponse.data.data : [];
        const filteredBySubcategory = subcategoryParam 
      ? productData.filter((product) => product.subcategory === subcategoryParam) 
      : productData; // If no subcategory, show all products
      
        setFilteredProducts(filteredBySubcategory);
        setProducts(allproductData);
      } catch (error) {
        console.error('Error fetching products by category:', error);
      }
    };
  
    const fetchJustArrivedProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/just-arrived`);
        const productData = Array.isArray(response.data.data) ? response.data.data : [];
        setFilteredProducts(productData);
      } catch (error) {
        console.error('Error fetching just arrived products:', error);
      }
    };
  
    // Fetch "Just Arrived" products if the category is "just-arrived"
    if (categoryName === 'just-arrived') {
      fetchJustArrivedProducts();
    } else {
      fetchProductsByCategory(); // Only fetch category products for non-just-arrived categories
    }
  }, [categoryName, subcategoryParam]);
  

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const updatedFilters = {
      ...selectedFilters,
      [filterType]: value,
    };
    setSelectedFilters(updatedFilters);

    let filtered = [...products]; // Apply filters on products fetched by category

    if (updatedFilters.subcategory.length > 0) {
      filtered = filtered.filter(product =>
        updatedFilters.subcategory.includes(product.subcategory)
      );
    }

    if (updatedFilters.price.length > 0) {
      const selectedRanges = updatedFilters.price.map(range => {
        if (range === '< ₹ 350') return { min: 0, max: 350 };
        if (range === '₹ 350 - ₹ 800') return { min: 350, max: 800 };
        if (range === '₹ 800 - ₹ 1500') return { min: 800, max: 1500 };
        if (range === '₹ 1500 - ₹ 4000') return { min: 1500, max: 4000 };
        if (range === '> ₹ 4000') return { min: 4000, max: Infinity };
        return null;
      }).filter(Boolean);

      filtered = filtered.filter(product =>
        selectedRanges.some(range => {
          const price = product.discountAmount || product.originalAmount;
          return price >= range.min && price <= range.max;
        })
      );
    }

    if (updatedFilters.size.length > 0) {
      filtered = filtered.filter(product => updatedFilters.size.includes(product.size));
    }

    if (updatedFilters.brand.length > 0) {
      filtered = filtered.filter(product => updatedFilters.brand.includes(product.brand));
    }

    setFilteredProducts(sortProducts(filtered, sortOrder)); // Apply sorting after filtering
    setCurrentPage(1); // Reset to the first page after filtering
  };

  // Sort products
  const sortProducts = (products, order) => {
    return [...products].sort((a, b) => {
      if (order === 'ascending') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  };

  const handleSortChange = (e) => {
    const newSortOrder = e.target.value;
    setSortOrder(newSortOrder);
    setFilteredProducts(sortProducts(filteredProducts, newSortOrder));
  };

  const handleProductsPerPageChange = (e) => {
    setProductsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  
  // Navigate to product details page
  const handleCardClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="category-page container mt-4">
      <Carousel className="mt-3 mb-5">
        {/* Carousel items */}
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://via.placeholder.com/1000x400"
            alt="First slide"
          />
          <Carousel.Caption>
            <h3>First Slide Label</h3>
            <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
          </Carousel.Caption>
        </Carousel.Item>
        {/* Other slides */}
      </Carousel>
      
      <div className="row">
        <div className="col-md-3">
          <Sidebar onFilterChange={handleFilterChange} selectedFilters={selectedFilters} />
        </div>
        <div className="col-md-9">
          <div className="d-flex justify-content-between mb-4">
            <select className="form-select w-25" value={sortOrder} onChange={handleSortChange}>
              <option value="ascending">Sort by Name (A-Z)</option>
              <option value="descending">Sort by Name (Z-A)</option>
            </select>

            <select className="form-select w-25" value={productsPerPage} onChange={handleProductsPerPageChange}>
              <option value={6}>Show 6 per page</option>
              <option value={12}>Show 12 per page</option>
              <option value={18}>Show 18 per page</option>
            </select>
          </div>

          <div className="row">
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <div key={product.id} className="col-md-4 mb-4">
                  <div className="card custom-card h-100" onClick={() => handleCardClick(product.product_id)}> {/* Use product ID */}
                    <img src={product.image} className="card-img-top" alt={product.name} style={{ height: '200px', objectFit: 'cover' }} />
                    <div className="card-body d-flex flex-column justify-content-between">
                      <div>
                        <h5 className="card-title">{product.name}</h5>
                        <p className="card-text">Brand: {product.brand}</p>
                        <p className="card-text">Blouse: {product.size}</p>
                        <p className="card-text">Price: ₹ {product.discountAmount || product.originalAmount}</p>
                      </div>
                      <a href="#" className="btn custom-selected mt-3 align-self-end">
                        <i className="fas fa-eye"></i> {/* Font Awesome Eye Icon */}
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <p>No products found</p>
              </div>
            )}
          </div>

          <div className="pagination d-flex justify-content-center">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`btn mx-1 ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
