import React, { useState, useEffect } from 'react';
import './SearchFilter.css';
import { BsSearch, BsChevronDown } from 'react-icons/bs';
import axios from 'axios';
import { authorizationObj, baseUrl } from '@/app/utils/core';

interface SearchFilterProps {
    searchText?: string;
    set_searchText?: (text: string) => void;
    onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
    course_level: string;
    course_category_ids: string[];
}

interface Category {
    category_id: string;
    category_name: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ searchText, set_searchText, onFilterChange }) => {
    const [filters, setFilters] = useState<FilterState>({
        course_level: '',
        course_category_ids: []
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${baseUrl}/course-categories`, authorizationObj);
                if (response?.data?.data) {
                    setCategories(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Handle level selection
    const handleLevelChange = (level: string) => {
        const newFilters = {
            ...filters,
            course_level: filters.course_level === level ? '' : level,
        };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    // Handle category selection
    const handleCategoryChange = (categoryId: string) => {
        const newFilters = {
            ...filters,
            course_category_ids: filters.course_category_ids.includes(categoryId)
                ? filters.course_category_ids.filter(id => id !== categoryId)
                : [...filters.course_category_ids, categoryId]
        };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const dropdown = document.getElementById('categoryDropdown');
            if (dropdown && !dropdown.contains(event.target as Node)) {
                setShowCategoryDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="search-filter-container py-4">
            <div className="container">
                <div className="d-flex flex-wrap align-items-center gap-3">
                    {/* Search Input */}
                    <div className="flex-grow-1">
                        <div className="position-relative">
                            <span className="position-absolute top-50 start-0 translate-middle-y ps-3">
                                <BsSearch className="text-muted" />
                            </span>
                            <input
                                type="text"
                                className="form-control ps-5"
                                placeholder="Search courses..."
                                value={searchText}
                                onChange={(e) => set_searchText?.(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Category Dropdown */}
                    <div className="position-relative" id="categoryDropdown">
                        <button
                            className="btn btn-outline-dark d-flex align-items-center gap-2"
                            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        >
                            Categories ({filters.course_category_ids.length})
                            <BsChevronDown />
                        </button>
                        {showCategoryDropdown && (
                            <div className="category-dropdown">
                                {categories.map((category) => (
                                    <div key={category.category_id} className="category-item">
                                        <label className="d-flex align-items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={filters.course_category_ids.includes(category.category_id)}
                                                onChange={() => handleCategoryChange(category.category_id)}
                                            />
                                            {category.category_name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Level Filter */}
                    <div className="d-flex gap-2">
                        {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                            <button
                                key={level}
                                className={`btn ${
                                    filters.course_level === level ? 'btn-dark' : 'btn-outline-dark'
                                }`}
                                onClick={() => handleLevelChange(level)}
                            >
                                {level}
                            </button>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-outline-danger"
                            onClick={() => {
                                setFilters({ course_level: '', course_category_ids: [] });
                                onFilterChange?.({ course_level: '', course_category_ids: [] });
                            }}
                        >
                            Reset
                        </button>
                      
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchFilter;
