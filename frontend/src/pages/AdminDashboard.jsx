import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookService, borrowingService, fineService } from '../services/api';
import { 
  BookOpen, 
  Layers, 
  BookmarkCheck, 
  DollarSign, 
  PlusCircle, 
  Users, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';
import Loading from '../components/Loading';
import '../styles/dashboard.css';

export const AdminDashboard = () => {
  const [books, setBooks] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [booksRes, borrowingsRes, finesRes] = await Promise.all([
        bookService.getAllBooks(),
        borrowingService.getAllBorrowings(),
        fineService.getAllFines(),
      ]);

      if (booksRes && booksRes.data) setBooks(booksRes.data);
      if (borrowingsRes && borrowingsRes.data) setBorrowings(borrowingsRes.data);
      if (finesRes && finesRes.data) setFines(finesRes.data);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading Librarian & Admin Center..." />;
  }

  // System Computations
  const totalTitles = books.length;
  const totalCopies = books.reduce((sum, b) => sum + (b.quantity || 0), 0);
  const totalAvailableCopies = books.reduce((sum, b) => sum + (b.availableQuantity || 0), 0);
  const activeLoans = borrowings.filter((b) => b.status === 'BORROWED').length;
  const unpaidFines = fines.filter((f) => f.status === 'UNPAID');
  const totalUnpaidFineAmount = unpaidFines.reduce((sum, f) => sum + (f.amount || 0), 0);
  const paidFines = fines.filter((f) => f.status === 'PAID');
  const totalPaidFineAmount = paidFines.reduce((sum, f) => sum + (f.amount || 0), 0);

  const recentBorrowings = borrowings.slice(0, 5);

  return (
    <div className="main-content">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="welcome-title">
            <span className="welcome-gradient">Admin & Librarian Control Hub</span> 🛡️
          </h1>
          <p className="dashboard-subtitle">
            System-wide library overview, inventory monitoring, student loan auditing, and fine collection.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/books" className="btn btn-primary">
            <PlusCircle size={16} /> Manage Books & Catalog
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Book Titles</span>
            <span className="stat-value">{totalTitles}</span>
            <span className="stat-subtext">{totalCopies} total copies across all titles</span>
          </div>
          <div className="stat-icon stat-icon-indigo">
            <BookOpen size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Available Inventory</span>
            <span className="stat-value" style={{ color: '#34d399' }}>{totalAvailableCopies}</span>
            <span className="stat-subtext">{totalCopies - totalAvailableCopies} copies currently borrowed</span>
          </div>
          <div className="stat-icon stat-icon-emerald">
            <Layers size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Active Student Loans</span>
            <span className="stat-value">{activeLoans}</span>
            <span className="stat-subtext">Total system loan records: {borrowings.length}</span>
          </div>
          <div className="stat-icon stat-icon-amber">
            <BookmarkCheck size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Unpaid Fines</span>
            <span className="stat-value" style={{ color: '#fb7185' }}>
              ₹{totalUnpaidFineAmount.toFixed(2)}
            </span>
            <span className="stat-subtext">
              ₹{totalPaidFineAmount.toFixed(2)} collected from {paidFines.length} fines
            </span>
          </div>
          <div className="stat-icon stat-icon-rose">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* Administrative Operations Modules */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Administrative Modules</h2>
        </div>
        <div className="quick-actions-grid">
          <Link to="/admin/books" className="action-card">
            <div className="action-card-header">
              <div className="stat-icon stat-icon-indigo">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="action-card-title">Book Catalog Management</h3>
                <p className="action-card-desc">Add new titles, adjust stock quantities, and remove books</p>
              </div>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: 'auto' }}>
              Open Book Manager <ArrowRight size={14} />
            </span>
          </Link>

          <Link to="/borrowings" className="action-card">
            <div className="action-card-header">
              <div className="stat-icon stat-icon-amber">
                <BookmarkCheck size={20} />
              </div>
              <div>
                <h3 className="action-card-title">System-Wide Loans</h3>
                <p className="action-card-desc">Audit all active student loans, due dates, and return history</p>
              </div>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: 'auto' }}>
              View All Borrowings <ArrowRight size={14} />
            </span>
          </Link>

          <Link to="/fines" className="action-card">
            <div className="action-card-header">
              <div className="stat-icon stat-icon-rose">
                <DollarSign size={20} />
              </div>
              <div>
                <h3 className="action-card-title">Fine Auditing & Cashier</h3>
                <p className="action-card-desc">Track overdue fees, verify payment settlements across students</p>
              </div>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#fb7185', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: 'auto' }}>
              Inspect Fine Records <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Borrowing Activity Table */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">
            <Activity size={20} style={{ color: 'var(--primary)' }} /> Recent Student Loan Activities
          </h2>
          <Link to="/borrowings" style={{ fontSize: '0.875rem', color: '#818cf8' }}>
            View all ({borrowings.length}) &rarr;
          </Link>
        </div>

        {recentBorrowings.length === 0 ? (
          <div className="empty-state">
            <BookmarkCheck className="empty-state-icon" />
            <h3 className="empty-state-title">No Borrowing Activity Yet</h3>
            <p className="empty-state-desc">
              When students borrow or return books, their activity will appear in this real-time log.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Book Title</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBorrowings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>{b.userName}</div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>{b.userEmail}</div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{b.bookTitle}</td>
                    <td>{b.borrowDate}</td>
                    <td>{b.dueDate}</td>
                    <td>{b.returnDate || '—'}</td>
                    <td>
                      <span className={`badge ${b.status === 'RETURNED' ? 'badge-returned' : 'badge-borrowed'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
