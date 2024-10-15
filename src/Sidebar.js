import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Collapse } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaDollarSign, FaTags, FaGift, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import '../src/app.css';
import API_URL from './config';

const Sidebar = ({ onFilterChange, selectedFilters }) => {
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [priceRanges, setPriceRanges] = useState([]);
  const [openCategoryIndex, setOpenCategoryIndex] = useState(null);
  const [openFilters, setOpenFilters] = useState({
    price: true,
    sizes: true,
    brands: true,
  });

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/getUniqueFilters`);
        const productData = response.data.filters;
        setCategories(productData.categories);
        setSizes(productData.sizes);
        setBrands(productData.brands);

        const prices = productData.prices.map(price => parseFloat(price));
        const maxPrice = Math.max(...prices);

        setPriceRanges([
          { label: `< ₹ 350`, min: 0, max: 350 },
          { label: `₹ 350 - ₹ 800`, min: 350, max: 800 },
          { label: `₹ 800 - ₹ 1500`, min: 800, max: 1500 },
          { label: `₹ 1500 - ₹ 4000`, min: 1500, max: 4000 },
          { label: `> ₹ 4000`, min: 4000, max: maxPrice },
        ]);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };

    fetchFilters();
  }, []);

  const isSelected = (filterType, value) => selectedFilters[filterType]?.includes(value);

  const handlePriceChange = (priceRange) => {
    const updatedSelected = isSelected('price', priceRange)
      ? selectedFilters.price.filter(range => range !== priceRange)
      : [...(selectedFilters.price || []), priceRange];

    onFilterChange('price', updatedSelected);
  };

  const toggleCategory = (index) => {
    setOpenCategoryIndex(openCategoryIndex === index ? null : index);
  };

  const handleSubcategoryClick = (subcategory) => {
    onFilterChange('subcategory', subcategory);
  };

  return (
    <div className="sidebar p-4 bg-light rounded shadow-sm" style={{ width: '300px', height: '100%', overflowY: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h3 className="text-center mb-4" style={{ color: '#343a40', fontWeight: 'bold' }}>Filters</h3>

      {/* Price Range Filter */}
      <h5 onClick={() => setOpenFilters({ ...openFilters, price: !openFilters.price })} className="filter-heading" style={{ cursor: 'pointer', margin: '1.5rem 0', color: '#6f42c1' }}>
        <FaDollarSign className="me-2" /> Price Range
      </h5>
      <Collapse in={openFilters.price}>
        <div className="mb-4">
          {priceRanges.map((range, index) => (
            <div key={index} className="form-check mb-4">
              <input
                type="checkbox"
                className="form-check-input"
                id={`priceRange${index}`}
                checked={isSelected('price', range.label)}
                onChange={() => handlePriceChange(range.label)}
              />
              <label
                className={`form-check-label ${isSelected('price', range.label) ? 'custom-selected' : ''}`}
                htmlFor={`priceRange${index}`}
                style={{ fontSize: '16px' }}
              >
                {range.label}
              </label>
            </div>
          ))}
        </div>
      </Collapse>

      {/* Categories Filter */}
      <h5 className='filter-heading' style={{ margin: '1.5rem 0', color: '#6f42c1' }}>
        <FaTags className="me-2" /> Categories
      </h5>
      {categories.map((categoryObj, index) => (
        <div key={index} className="mb-4">
          <h6 onClick={() => toggleCategory(index)} style={{ cursor: 'pointer', marginBottom: '1rem', fontWeight: 'bold', color: '#6f42c1' }}>
            {categoryObj.category}
            {openCategoryIndex === index ? <FaChevronUp className="ms-2" /> : <FaChevronDown className="ms-2" />}
          </h6>
          <Collapse in={openCategoryIndex === index}>
            <ul className="list-unstyled mb-3">
              {categoryObj.subcategories.map((subcategory, subIndex) => (
                <li
                  key={subIndex}
                  className={`list-group-item list-group-item-action ${isSelected('subcategory', subcategory) ? 'custom-selected text-black' : ''}`}
                  onClick={() => handleSubcategoryClick(subcategory)}
                  style={{ padding: '10px', cursor: 'pointer', fontSize: '15px' }}
                >
                  {subcategory}
                </li>
              ))}
            </ul>
          </Collapse>
        </div>
      ))}

      {/* Size Filter */}
      <h5 onClick={() => setOpenFilters({ ...openFilters, sizes: !openFilters.sizes })} className="filter-heading" style={{ cursor: 'pointer', margin: '1.5rem 0', color: '#6f42c1' }}>
        <FaGift className="me-2" /> Sizes
      </h5>
      <Collapse in={openFilters.sizes}>
        <ul className="list-unstyled mb-4">
          {sizes.map((size, index) => (
            <li
              key={index}
              className={`list-group-item list-group-item-action ${isSelected('size', size) ? 'custom-selected text-black' : ''}`}
              onClick={() => onFilterChange('size', size)}
              style={{ padding: '10px', cursor: 'pointer', fontSize: '15px' }}
            >
              {size}
            </li>
          ))}
        </ul>
      </Collapse>

      {/* Brand Filter */}
      <h5 onClick={() => setOpenFilters({ ...openFilters, brands: !openFilters.brands })} className="filter-heading" style={{ cursor: 'pointer', margin: '1.5rem 0', color: '#6f42c1' }}>
        Brands
      </h5>
      <Collapse in={openFilters.brands}>
        <ul className="list-unstyled mb-4">
          {brands.map((brand, index) => (
            <li
              key={index}
              className={`list-group-item list-group-item-action ${isSelected('brand', brand) ? 'custom-selected text-black' : ''}`}
              onClick={() => onFilterChange('brand', brand)}
              style={{ padding: '10px', cursor: 'pointer', fontSize: '15px' }}
            >
              {brand}
            </li>
          ))}
        </ul>
      </Collapse>
    </div>
  );
};

export default Sidebar;
