import React, { useState, useEffect } from 'react';
import { bookService } from '../services/api';
import Loading from '../components/Loading';
import { 
  BookOpen, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Loader2 
} from 'lucide-react';
import '../styles/admin.css';

export const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null); // null = Add mode, object = Edit mode
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    isbn: '',
    quantity: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirmation
  const [deletingId, setDeletingId] = useState(null);

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
      }
    } catch (err) {
      console.error('Failed to load books for admin:', err);
      setNotification({ type: 'error', text: 'Failed to load books.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBooks(books);
    } else {
      const q = searchQuery.toLowerCase().trim();
      setFilteredBooks(
        books.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            b.category.toLowerCase().includes(q) ||
            b.isbn.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, books]);

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      category: '',
      isbn: '',
      quantity: 1,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn,
      quantity: book.quantity,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBook(null);
    setFormError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.author.trim() || !formData.category.trim() || !formData.isbn.trim()) {
      setFormError('All fields are required.');
      return;
    }

    if (parseInt(formData.quantity, 10) < 0) {
      setFormError('Quantity cannot be negative.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        category: formData.category.trim(),
        isbn: formData.isbn.trim(),
        quantity: parseInt(formData.quantity, 10),
      };

      if (editingBook) {
        // Edit mode
        await bookService.updateBook(editingBook.id, payload);
        setNotification({ type: 'success', text: `Book "${payload.title}" updated successfully.` });
      } else {
        // Add mode
        await bookService.addBook(payload);
        setNotification({ type: 'success', text: `Book "${payload.title}" added to catalog.` });
      }

      handleCloseModal();
      loadBooks();
    } catch (err) {
      console.error('Book save error:', err);
      const msg = err.response?.data?.message || 'Failed to save book. Check fields and unique ISBN.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async (book) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      return;
    }

    try {
      setDeletingId(book.id);
      setNotification(null);
      await bookService.deleteBook(book.id);
      setNotification({ type: 'success', text: `Book "${book.title}" deleted successfully.` });
      loadBooks();
    } catch (err) {
      console.error('Delete error:', err);
      const msg = err.response?.data?.message || 'Failed to delete book.';
      setNotification({ type: 'error', text: msg });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <Loading message="Loading inventory..." />;
  }

  return (
    <div className="main-content">
      {/* Header */}
      <div className="catalog-header">
        <div>
          <h1 className="welcome-title">
            <span className="welcome-gradient">Book Inventory Management</span>
          </h1>
          <p className="dashboard-subtitle">
            Add new titles, adjust stock quantities, and manage catalog books.
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <PlusCircle size={17} /> Add New Book
        </button>
      </div>

      {notification && (
        <div className={`alert alert-${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="search-input-wrapper" style={{ maxWidth: '400px' }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Showing <strong>{filteredBooks.length}</strong> of <strong>{books.length}</strong> book titles
        </div>
      </div>

      {/* Books Table */}
      {filteredBooks.length === 0 ? (
        <div className="empty-state">
          <BookOpen className="empty-state-icon" />
          <h3 className="empty-state-title">No Books in Inventory</h3>
          <p className="empty-state-desc">
            No matching books found. Click "Add New Book" to register titles into the library.
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>ISBN</th>
                <th>Available / Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id}>
                  <td style={{ fontWeight: 600 }}>{book.title}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{book.author}</td>
                  <td>
                    <span className="book-category">{book.category}</span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{book.isbn}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: book.availableQuantity > 0 ? '#34d399' : '#fb7185' }}>
                      {book.availableQuantity}
                    </span>
                    <span style={{ color: 'var(--text-dim)' }}> / {book.quantity}</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        onClick={() => handleOpenEditModal(book)}
                        className="icon-btn edit"
                        title="Edit Book"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book)}
                        disabled={deletingId === book.id}
                        className="icon-btn delete"
                        title="Delete Book"
                      >
                        {deletingId === book.id ? (
                          <Loader2 size={16} className="spin-animation" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingBook ? 'Edit Book Details' : 'Add New Book to Catalog'}
              </h2>
              <button onClick={handleCloseModal} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Book Title *</label>
                <input
                  id="title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Designing Data-Intensive Applications"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="author">Author *</label>
                <input
                  id="author"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Martin Kleppmann"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="category">Category *</label>
                  <input
                    id="category"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Distributed Systems"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="isbn">ISBN *</label>
                  <input
                    id="isbn"
                    type="text"
                    className="form-input"
                    placeholder="978-1449373320"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="quantity">Total Inventory Quantity *</label>
                <input
                  id="quantity"
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="spin-animation" /> Saving...
                    </>
                  ) : editingBook ? (
                    'Save Changes'
                  ) : (
                    'Add Book'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;
