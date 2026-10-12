import React from 'react';
import { Book, CheckCircle, XCircle, BookmarkPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const BookCard = ({ book, onBorrow, isBorrowing = false }) => {
  const { isStudent, isAuthenticated } = useAuth();
  const isAvailable = book.availableQuantity > 0;

  return (
    <div className="book-card">
      <div className="book-card-top">
        <span className="book-category">{book.category}</span>
        {isAvailable ? (
          <span className="badge badge-in-stock">
            <CheckCircle size={12} /> {book.availableQuantity} Available
          </span>
        ) : (
          <span className="badge badge-out-of-stock">
            <XCircle size={12} /> Out of Stock
          </span>
        )}
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">by {book.author}</p>
        <p className="book-isbn">ISBN: {book.isbn}</p>
      </div>

      <div className="book-card-footer">
        <div className="stock-indicator">
          <span className="stock-count">
            {book.availableQuantity} / {book.quantity}
          </span>
          <span className="stock-label">Copies Available</span>
        </div>

        {/* Borrow action button - visible only to authenticated Students */}
        {isAuthenticated && isStudent && (
          <button
            onClick={() => onBorrow && onBorrow(book.id)}
            disabled={!isAvailable || isBorrowing}
            className={`btn btn-sm ${isAvailable ? 'btn-primary' : 'btn-secondary'}`}
            title={isAvailable ? 'Borrow this book for 14 days' : 'Currently unavailable'}
          >
            {isBorrowing ? (
              <>
                <Loader2 size={14} className="spin-animation" /> Borrowing...
              </>
            ) : (
              <>
                <BookmarkPlus size={14} /> Borrow
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookCard;
