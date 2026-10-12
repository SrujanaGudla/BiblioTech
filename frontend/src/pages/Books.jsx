import React, { useState, useEffect } from 'react';
import { bookService, borrowingService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import Loading from '../components/Loading';
import { Search, BookOpen, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import '../styles/books.css';

export const Books = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [borrowingBookId, setBorrowingBookId] = useState(null);
  const [notification, setNotification] = useState(null);

  const { isStudent, isAuthenticated } = useAuth();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const res = await bookService.getAllBooks();
      if (res && res.data) {
        setBooks(res.data);
        setFilteredBooks(res.data);

        // Extract distinct categories
        const distinctCategories = ['All', ...new Set(res.data.map((b) => b.category).filter(Boolean))];
        setCategories(distinctCategories);
      }
    } catch (err) {
      console.error('Failed to load books:', err);
      setNotification({ type: 'error', text: 'Failed to load books catalog.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...books];

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(
        (b) => b.category && b.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          (b.title && b.title.toLowerCase().includes(q)) ||
          (b.author && b.author.toLowerCase().includes(q)) ||
          (b.category && b.category.toLowerCase().includes(q)) ||
          (b.isbn && b.isbn.toLowerCase().includes(q))
      );
    }

    setFilteredBooks(result);
  }, [searchQuery, selectedCategory, books]);

  const handleBorrow = async (bookId) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      setBorrowingBookId(bookId);
      setNotification(null);
      const res = await borrowingService.borrowBook(bookId);
      setNotification({
        type: 'success',
        text: res.message || 'Book borrowed successfully! It is due in 14 days.',
      });
      loadBooks(); // Refresh book quantities
    } catch (err) {
      console.error('Borrow error:', err);
      const message = err.response?.data?.message || 'Unable to borrow this book.';
      setNotification({ type: 'error', text: message });
    } finally {
      setBorrowingBookId(null);
    }
  };

  if (loading) {
    return <Loading message="Loading library catalog..." />;
  }

  return (
    <div className="main-content">
      {/* Header */}
      <div className="catalog-header">
        <div>
          <h1 className="welcome-title">
            <span className="welcome-gradient">Library Books Catalog</span>
          </h1>
          <p className="dashboard-subtitle">
            Search, explore, and borrow from our extensive collection of titles.
          </p>
        </div>
      </div>

      {notification && (
        <div className={`alert alert-${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, author, category, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 1 && (
        <div className="category-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="empty-state">
          <BookOpen className="empty-state-icon" />
          <h3 className="empty-state-title">No Books Found</h3>
          <p className="empty-state-desc">
            We couldn't find any books matching "{searchQuery}". Try searching with different keywords or clearing category filters.
          </p>
        </div>
      ) : (
        <div className="books-grid">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onBorrow={handleBorrow}
              isBorrowing={borrowingBookId === book.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Books;
