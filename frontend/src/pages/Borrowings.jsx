import React, { useState, useEffect } from 'react';
import { borrowingService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import { 
  BookmarkCheck, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Loader2, 
  BookOpen, 
  Clock 
} from 'lucide-react';
import '../styles/admin.css';

export const Borrowings = () => {
  const { isStudent, isAdmin } = useAuth();
  const [borrowings, setBorrowings] = useState([]);
  const [filteredBorrowings, setFilteredBorrowings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadBorrowings();
  }, [isStudent]);

  const loadBorrowings = async () => {
    try {
      setLoading(true);
      let res;
      if (isStudent) {
        res = await borrowingService.getMyBorrowings();
      } else {
        res = await borrowingService.getAllBorrowings();
      }

      if (res && res.data) {
        setBorrowings(res.data);
        setFilteredBorrowings(res.data);
      }
    } catch (err) {
      console.error('Failed to load borrowings:', err);
      setNotification({ type: 'error', text: 'Failed to load borrowing records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...borrowings];

    // Filter by status
    if (statusFilter !== 'ALL') {
      result = result.filter((b) => b.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          (b.bookTitle && b.bookTitle.toLowerCase().includes(q)) ||
          (b.bookAuthor && b.bookAuthor.toLowerCase().includes(q)) ||
          (b.userName && b.userName.toLowerCase().includes(q)) ||
          (b.userEmail && b.userEmail.toLowerCase().includes(q)) ||
          (b.bookIsbn && b.bookIsbn.toLowerCase().includes(q))
      );
    }

    setFilteredBorrowings(result);
  }, [statusFilter, searchQuery, borrowings]);

  const handleReturn = async (borrowingId) => {
    try {
      setReturningId(borrowingId);
      setNotification(null);
      const res = await borrowingService.returnBook(borrowingId);
      setNotification({
        type: 'success',
        text: res.message || 'Book returned successfully!',
      });
      loadBorrowings();
    } catch (err) {
      console.error('Return error:', err);
      const msg = err.response?.data?.message || 'Failed to return book.';
      setNotification({ type: 'error', text: msg });
    } finally {
      setReturningId(null);
    }
  };

  if (loading) {
    return <Loading message="Loading loan records..." />;
  }

  return (
    <div className="main-content">
      {/* Header */}
      <div className="catalog-header">
        <div>
          <h1 className="welcome-title">
            <span className="welcome-gradient">
              {isStudent ? 'My Borrowed Books & History' : 'System Loan Records'}
            </span>
          </h1>
          <p className="dashboard-subtitle">
            {isStudent
              ? 'Keep track of your active book loans, due dates, and return books on time.'
              : 'Audit and manage all borrowing transactions and book returns across all students.'}
          </p>
        </div>
      </div>

      {notification && (
        <div className={`alert alert-${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Toolbar with Search and Status Filter */}
      <div className="admin-toolbar">
        <div className="search-input-wrapper" style={{ maxWidth: '380px' }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by book or student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-chips" style={{ marginBottom: 0, paddingBottom: 0 }}>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`category-chip ${statusFilter === 'ALL' ? 'active' : ''}`}
          >
            All ({borrowings.length})
          </button>
          <button
            onClick={() => setStatusFilter('BORROWED')}
            className={`category-chip ${statusFilter === 'BORROWED' ? 'active' : ''}`}
          >
            Active Loans ({borrowings.filter((b) => b.status === 'BORROWED').length})
          </button>
          <button
            onClick={() => setStatusFilter('RETURNED')}
            className={`category-chip ${statusFilter === 'RETURNED' ? 'active' : ''}`}
          >
            Returned ({borrowings.filter((b) => b.status === 'RETURNED').length})
          </button>
        </div>
      </div>

      {/* Borrowings Table */}
      {filteredBorrowings.length === 0 ? (
        <div className="empty-state">
          <BookOpen className="empty-state-icon" />
          <h3 className="empty-state-title">No Borrowing Records Found</h3>
          <p className="empty-state-desc">
            {isStudent
              ? "You don't have any borrowing records matching this filter."
              : 'No borrowing transactions match the current query.'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                {isAdmin && <th>Student</th>}
                <th>Book Title</th>
                <th>ISBN</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBorrowings.map((b) => {
                const isOverdue = b.status === 'BORROWED' && new Date(b.dueDate) < new Date();
                return (
                  <tr key={b.id}>
                    {isAdmin && (
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.userName}</div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>{b.userEmail}</div>
                      </td>
                    )}
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.bookTitle}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.bookAuthor}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.825rem' }}>{b.bookIsbn}</td>
                    <td>{b.borrowDate}</td>
                    <td>
                      <span style={{ color: isOverdue ? '#fb7185' : 'inherit', fontWeight: isOverdue ? 700 : 400 }}>
                        {b.dueDate} {isOverdue && '⚠️'}
                      </span>
                    </td>
                    <td>{b.returnDate || '—'}</td>
                    <td>
                      <span
                        className={`badge ${
                          b.status === 'RETURNED'
                            ? 'badge-returned'
                            : isOverdue
                            ? 'badge-unpaid'
                            : 'badge-borrowed'
                        }`}
                      >
                        {b.status === 'RETURNED' ? 'RETURNED' : isOverdue ? 'OVERDUE' : 'BORROWED'}
                      </span>
                    </td>
                    <td>
                      {b.status === 'BORROWED' ? (
                        <button
                          onClick={() => handleReturn(b.id)}
                          disabled={returningId === b.id}
                          className="btn btn-secondary btn-sm"
                          title="Return Book"
                        >
                          {returningId === b.id ? (
                            <>
                              <Loader2 size={13} className="spin-animation" /> Returning...
                            </>
                          ) : (
                            <>
                              <RotateCcw size={13} /> Return
                            </>
                          )}
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Borrowings;
