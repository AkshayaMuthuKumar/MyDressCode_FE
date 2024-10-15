import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/app.css'; // Import the custom CSS file
import API_URL from './config';

const CategoryForm = () => {
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [discount, setDiscount] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);

  // Product state variables
  const [productName, setProductName] = useState('');
  const [productSubcategory, setProductSubcategory] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [size, setSize] = useState('');
  const [brand, setBrand] = useState('');
  const [image, setImage] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10); // Number of users to display per page

  const [originalAmount, setOriginalAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [users, setUsers] = useState([]);
  const [productFilteredSubcategories, setProductFilteredSubcategories] = useState([]);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Fetch categories, subcategories, and users from the backend
  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/getCategory`);
        setCategories(response.data.categories);
        setSubcategories(response.data.subcategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/getUsers`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchCategoriesAndSubcategories();
    fetchUsers();
  }, []);

  // Handle category input and filter suggestions
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    const filtered = categories.filter((cat) =>
      cat.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  // Handle subcategory input and filter suggestions for the category form
  const handleSubcategoryChange = (e) => {
    const value = e.target.value;
    setSubcategory(value);
    const filtered = subcategories.filter((sub) =>
      sub.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSubcategories(filtered);
  };

  // Handle subcategory input and filter suggestions for the product form
  const handleProductSubcategoryChange = (e) => {
    const value = e.target.value;
    setProductSubcategory(value);
    const filtered = subcategories.filter((sub) =>
      sub.toLowerCase().includes(value.toLowerCase())
    );
    setProductFilteredSubcategories(filtered);
  };

  // Handle category selection from dropdown
  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setFilteredCategories([]); // Clear the suggestions (hide the dropdown)
  };

  // Handle subcategory selection from dropdown for the category form
  const handleSubcategorySelect = (sub) => {
    setSubcategory(sub);
    setFilteredSubcategories([]); // Clear the suggestions (hide the dropdown)
  };

  // Handle subcategory selection from dropdown for the product form
  const handleProductSubcategorySelect = async (sub) => {
    setProductSubcategory(sub);
    setProductFilteredSubcategories([]); // Clear the suggestions (hide the dropdown)

    // Fetch the Category ID based on the selected product subcategory from the API
    try {
      const response = await axios.get(`${API_URL}/products/getCategoryIdBySubcategory`, {
        params: { subcategory: sub }
      });

      if (response.data && response.data.categoryId) {
        setCategoryId(response.data.categoryId); // Set the corresponding category ID
      } else {
        console.error('No category ID found for this subcategory');
      }
    } catch (error) {
      console.error('Error fetching category ID:', error);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(); // Create a FormData object
    formData.append('category', category);
    formData.append('subcategory', subcategory);
    formData.append('discount', discount);

    if (image) {
      formData.append('image', image); // Append the image file
    }
    try {
      await axios.post(`${API_URL}/products/addCategory`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Specify the content type
        },
      });
      // Clear the form
      setCategory('');
      setSubcategory('');
      setDiscount('');
      alert('Category added successfully!');
      window.location.reload(); // Refresh the page after submission
    } catch (error) {
      console.error(error);
      alert('Error adding category');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(); // Create a FormData object
    formData.append('name', productName);
    formData.append('subcategory', productSubcategory);
    formData.append('categoryId', categoryId);
    formData.append('size', size);
    formData.append('brand', brand);
    formData.append('originalAmount', originalAmount);
    formData.append('discountAmount', discountAmount);
    formData.append('stock', stock);
    formData.append('description', description);

    if (image) {
      formData.append('image', image); // Append the image file
    }

    try {
      await axios.post(`${API_URL}/products/addProduct`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Specify the content type
        },
      });
      // Clear the product form
      setProductName('');
      setProductSubcategory('');
      setCategoryId('');
      setSize('');
      setBrand('');
      setImage('');
      setOriginalAmount('');
      setDiscountAmount('');
      setStock('');
      setDescription('');
      alert('Product added successfully!');
      window.location.reload(); // Refresh the page after submission
    } catch (error) {
      console.error(error);
      alert('Error adding product');
    }
  };

  // Handle user role update
  const handleUpdateRole = async (userId, isAdmin) => {
    const newRole = !isAdmin; // Toggle the admin role
    try {
      const response = await axios.put(`${API_URL}/users/${userId}/updateRole`, {
        isAdmin: newRole,
      });
      alert(response.data.message);

      // Update the users list with the new role for the specific user
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isAdmin: newRole } : user
        )
      );
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        {/* Category Form */}
        <div className="col-md-6">
          <div className="border rounded p-4 shadow-sm">
            <h2 className="text-center mb-4">Add Category</h2>
            <form onSubmit={handleCategorySubmit}>
              <div className="form-group">
                <label htmlFor="category">Category:</label>
                <input
                  type="text"
                  className="form-control"
                  id="category"
                  value={category}
                  onChange={handleCategoryChange}
                  required
                  autoComplete="off"
                />
                {filteredCategories.length > 0 && (
                  <ul className="list-group">
                    {filteredCategories.map((cat, index) => (
                      <li
                        key={index}
                        className="list-group-item list-group-item-action"
                        onClick={() => handleCategorySelect(cat)}
                      >
                        {cat}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="subcategory">Subcategory:</label>
                <input
                  type="text"
                  className="form-control"
                  id="subcategory"
                  value={subcategory}
                  onChange={handleSubcategoryChange}
                  required
                  autoComplete="off"
                />
                {filteredSubcategories.length > 0 && (
                  <ul className="list-group">
                    {filteredSubcategories.map((sub, index) => (
                      <li
                        key={index}
                        className="list-group-item list-group-item-action"
                        onClick={() => handleSubcategorySelect(sub)}
                      >
                        {sub}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="discount">Discount:</label>
                <input
                  type="number"
                  className="form-control"
                  id="discount"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="image">Image:</label>
                <input
                  type="file"
                  className="form-control"
                  id="image"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Add Category</button>
            </form>
          </div>
        </div>

        {/* Product Form */}
        <div className="col-md-6">
          <div className="border rounded p-4 shadow-sm">
            <h2 className="text-center mb-4">Add Product</h2>
            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label htmlFor="productName">Product Name:</label>
                <input
                  type="text"
                  className="form-control"
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor="productSubcategory">Subcategory:</label>
                <input
                  type="text"
                  className="form-control"
                  id="productSubcategory"
                  value={productSubcategory}
                  onChange={handleProductSubcategoryChange}
                  required
                  autoComplete="off"
                />
                {productFilteredSubcategories.length > 0 && (
                  <ul className="list-group">
                    {productFilteredSubcategories.map((sub, index) => (
                      <li
                        key={index}
                        className="list-group-item list-group-item-action"
                        onClick={() => handleProductSubcategorySelect(sub)}
                      >
                        {sub}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="categoryId">Category ID:</label>
                <input
                  type="text"
                  className="form-control"
                  id="categoryId"
                  value={categoryId}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="size">Size:</label>
                <input
                  type="text"
                  className="form-control"
                  id="size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="brand">Brand:</label>
                <input
                  type="text"
                  className="form-control"
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="originalAmount">Original Amount:</label>
                <input
                  type="number"
                  className="form-control"
                  id="originalAmount"
                  value={originalAmount}
                  onChange={(e) => setOriginalAmount(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="discountAmount">Discount Amount:</label>
                <input
                  type="number"
                  className="form-control"
                  id="discountAmount"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="stock">Stock:</label>
                <input
                  type="number"
                  className="form-control"
                  id="stock"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  className="form-control"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="productImage">Image:</label>
                <input
                  type="file"
                  className="form-control"
                  id="productImage"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Add Product</button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-center">Users List</h2>
        <ul className="list-group">
          {currentUsers.map((user) => (
            <li key={user.id} className="list-group-item">
              <div>
             <strong>{user.username}</strong>
             <div>{user.email}</div>
             <div>{user.phone_number}</div>
           </div>
              <button
                className="btn btn-secondary btn-sm float-right"
                onClick={() => handleUpdateRole(user.id, user.isAdmin)}
              >
                {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
              </button>
            </li>
          ))}
        </ul>

        {/* Pagination Controls */}
        <div className="d-flex justify-content-between mt-3">
          <button
            className="btn btn-secondary"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;
