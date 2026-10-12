import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { borrowingService, fineService } from '../services/api';
import { 
  BookOpen, 
  BookmarkCheck, 
  DollarSign, 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle, 
  Loader2 
} from 'lucide-react';
import Loading from '../components/Loading';
import '../styles/dashboard.css';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [borrowings, setBorrowings] = useState([]);
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [borrowingsRes, finesRes] = await Promise.all([
        borrowingService.getMyBorrowings(),
        fineService.getMyFines(),
      ]);

      if (borrowingsRes && borrowingsRes.data) {
        setBorrowings(borrowingsRes.data);
      }
      if (finesRes && finesRes.data) {
        setFines(finesRes.data);
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (borrowingId) => {
    try {
      setReturningId(borrowingId);
      setMessage(null);
      const res = await borrowingService.returnBook(borrowingId);
      setMessage({ type: 'success', text: 'Book returned successfully!' });
      fetchDashboardData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to return book.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setReturningId(null);
    }
  };

  if (loading) {
    return <Loading message="Loading student portal..." />;
  }

  // Calculate statistics
  const activeLoans = borrowings.filter((b) => b.status === 'BORROWED');
  const unpaidFines = fines.filter((f) => f.status === 'UNPAID');
  const totalUnpaidAmount = unpaidFines.reduce((sum, f) => sum + (f.amount || 0), 0);
  const returnedCount = borrowings.filter((b) => b.status === 'RETURNED').length;

  return (
    <div className="main-content">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="welcome-title">
            Hello, <span className="welcome-gradient">{user?.name || 'Student'}</span>! 📚
          </h1>
          <p className="dashboard-subtitle">
            Welcome to your Student Portal. Manage your borrowed books and fines.
          </p>
        </div>
        <Link to="/books" className="btn btn-primary">
          <BookOpen size={16} /> Browse Book Catalog
        </Link>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Active Loans</span>
            <span className="stat-value">{activeLoans.length}</span>
            <span className="stat-subtext">Books currently in your care</span>
          </div>
          <div className="stat-icon stat-icon-indigo">
            <BookmarkCheck size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Outstanding Fines</span>
            <span className="stat-value" style={{ color: totalUnpaidAmount > 0 ? '#fb7185' : '#34d399' }}>
              ₹{totalUnpaidAmount.toFixed(2)}
            </span>
            <span className="stat-subtext">
              {unpaidFines.length} unpaid fine record(s)
            </span>
          </div>
          <div className="stat-icon stat-icon-rose">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Returned Books</span>
            <span className="stat-value">{returnedCount}</span>
            <span className="stat-subtext">Lifetime library returns</span>
          </div>
          <div className="stat-icon stat-icon-emerald">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Quick Actions</h2>
        </div>
        <div className="quick-actions-grid">
          <Link to="/books" className="action-card">
            <div className="action-card-header">
              <div className="stat-icon stat-icon-indigo">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="action-card-title">Explore Catalog</h3>
                <p className="action-card-desc">Find and borrow available books</p>
              </div>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: 'auto' }}>
              Browse now <ArrowRight size={14} />
            </span>
          </Link>

          <Link to="/borrowings" className="action-card">
            <div className="action-card-header">
              <div className="stat-icon stat-icon-cyan">
                <BookmarkCheck size={20} />
              </div>
              <div>
                <h3 className="action-card-title">My Loan History</h3>
                <p className="action-card-desc">View all past and active borrowings</p>
              </div>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: 'auto' }}>
              View history <ArrowRight size={14} />
            </span>
          </Link>

          <Link to="/fines" className="action-card">
            <div className="action-card-header">
              <div className="stat-icon stat-icon-rose">
                <DollarSign size={20} />
              </div>
              <div>
                <h3 className="action-card-title">Fines & Penalties</h3>
                <p className="action-card-desc">Pay overdue fees and view receipts</p>
              </div>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#fb7185', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: 'auto' }}>
              Manage fines <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </div>

      {/* Active Borrowed Books Table/List */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">
            <BookmarkCheck size={20} style={{ color: 'var(--primary)' }} /> Currently Borrowed Books
          </h2>
          <Link to="/borrowings" style={{ fontSize: '0.875rem', color: '#818cf8' }}>
            View all loans &rarr;
          </Link>
        </div>

        {activeLoans.length === 0 ? (
          <div className="empty-state">
            <BookOpen className="empty-state-icon" />
            <h3 className="empty-state-title">No Active Borrowed Books</h3>
            <p className="empty-state-desc">
              You haven't borrowed any books currently. Explore the catalog to borrow reading materials.
            </p>
            <Link to="/books" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.map((loan) => {
                  const isOverdue = new Date(loan.dueDate) < new Date();
                  return (
                    <tr key={loan.id}>
                      <td style={{ fontWeight: 600 }}>{loan.bookTitle}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{loan.bookAuthor}</td>
                      <td>{loan.borrowDate}</td>
                      <td>
                        <span style={{ color: isOverdue ? '#fb7185' : 'inherit', fontWeight: isOverdue ? 700 : 400 }}>
                          {loan.dueDate} {isOverdue && '⚠️ (Overdue)'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isOverdue ? 'badge-unpaid' : 'badge-borrowed'}`}>
                          {isOverdue ? 'Overdue' : 'Active Loan'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleReturnBook(loan.id)}
                          disabled={returningId === loan.id}
                          className="btn btn-secondary btn-sm"
                        >
                          {returningId === loan.id ? (
                            <>
                              <Loader2 size={13} className="spin-animation" /> Returning...
                            </>
                          ) : (
                            <>
                              <RotateCcw size={13} /> Return
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
