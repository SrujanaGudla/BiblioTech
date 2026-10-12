import React, { useState, useEffect } from 'react';
import { fineService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import { 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  CreditCard, 
  Search, 
  Loader2, 
  Receipt, 
  Clock 
} from 'lucide-react';
import '../styles/admin.css';

export const Fines = () => {
  const { isStudent, isAdmin } = useAuth();
  const [fines, setFines] = useState([]);
  const [filteredFines, setFilteredFines] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadFines();
  }, [isStudent]);

  const loadFines = async () => {
    try {
      setLoading(true);
      let res;
      if (isStudent) {
        res = await fineService.getMyFines();
      } else {
        res = await fineService.getAllFines();
      }

      if (res && res.data) {
        setFines(res.data);
        setFilteredFines(res.data);
      }
    } catch (err) {
      console.error('Failed to load fines:', err);
      setNotification({ type: 'error', text: 'Failed to load fine records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...fines];

    if (statusFilter !== 'ALL') {
      result = result.filter((f) => f.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          (f.bookTitle && f.bookTitle.toLowerCase().includes(q)) ||
          (f.studentName && f.studentName.toLowerCase().includes(q)) ||
          (f.studentEmail && f.studentEmail.toLowerCase().includes(q)) ||
          (f.bookIsbn && f.bookIsbn.toLowerCase().includes(q))
      );
    }

    setFilteredFines(result);
  }, [statusFilter, searchQuery, fines]);

  const handlePayFine = async (fineId) => {
    try {
      setPayingId(fineId);
      setNotification(null);
      const res = await fineService.payFine(fineId);
      setNotification({
        type: 'success',
        text: res.message || 'Fine paid successfully! Receipt updated.',
      });
      loadFines();
    } catch (err) {
      console.error('Payment error:', err);
      const msg = err.response?.data?.message || 'Failed to process fine payment.';
      setNotification({ type: 'error', text: msg });
    } finally {
      setPayingId(null);
    }
  };

  if (loading) {
    return <Loading message="Loading fine ledgers..." />;
  }

  const unpaidFines = fines.filter((f) => f.status === 'UNPAID');
  const paidFines = fines.filter((f) => f.status === 'PAID');
  const totalUnpaid = unpaidFines.reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalPaid = paidFines.reduce((sum, f) => sum + (f.amount || 0), 0);

  return (
    <div className="main-content">
      {/* Header */}
      <div className="catalog-header">
        <div>
          <h1 className="welcome-title">
            <span className="welcome-gradient">
              {isStudent ? 'My Fines & Fee Records' : 'Library Fine Management & Cashier'}
            </span>
          </h1>
          <p className="dashboard-subtitle">
            {isStudent
              ? 'Review late return penalties (₹10/day) and settle unpaid balances.'
              : 'Audit overdue penalties and verify fine settlement receipts across students.'}
          </p>
        </div>
      </div>

      {notification && (
        <div className={`alert alert-${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Outstanding Balance</span>
            <span className="stat-value" style={{ color: totalUnpaid > 0 ? '#fb7185' : '#34d399' }}>
              ₹{totalUnpaid.toFixed(2)}
            </span>
            <span className="stat-subtext">{unpaidFines.length} pending unpaid penalty record(s)</span>
          </div>
          <div className="stat-icon stat-icon-rose">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Settled Amount</span>
            <span className="stat-value" style={{ color: '#34d399' }}>
              ₹{totalPaid.toFixed(2)}
            </span>
            <span className="stat-subtext">{paidFines.length} settled fine record(s)</span>
          </div>
          <div className="stat-icon stat-icon-emerald">
            <Receipt size={24} />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="search-input-wrapper" style={{ maxWidth: '380px' }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search fine records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-chips" style={{ marginBottom: 0, paddingBottom: 0 }}>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`category-chip ${statusFilter === 'ALL' ? 'active' : ''}`}
          >
            All ({fines.length})
          </button>
          <button
            onClick={() => setStatusFilter('UNPAID')}
            className={`category-chip ${statusFilter === 'UNPAID' ? 'active' : ''}`}
          >
            Unpaid ({unpaidFines.length})
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`category-chip ${statusFilter === 'PAID' ? 'active' : ''}`}
          >
            Paid ({paidFines.length})
          </button>
        </div>
      </div>

      {/* Fines Table */}
      {filteredFines.length === 0 ? (
        <div className="empty-state">
          <Receipt className="empty-state-icon" />
          <h3 className="empty-state-title">No Fine Records</h3>
          <p className="empty-state-desc">
            {isStudent
              ? 'Great job! You have no outstanding fines or penalty records.'
              : 'No fine records match the current filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                {isAdmin && <th>Student</th>}
                <th>Book Title</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Late Days</th>
                <th>Fine Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFines.map((f) => (
                <tr key={f.id}>
                  {isAdmin && (
                    <td>
                      <div style={{ fontWeight: 600 }}>{f.studentName}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>{f.studentEmail}</div>
                    </td>
                  )}
                  <td>
                    <div style={{ fontWeight: 600 }}>{f.bookTitle}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                      {f.bookIsbn}
                    </div>
                  </td>
                  <td>{f.borrowDate}</td>
                  <td>{f.dueDate}</td>
                  <td>{f.returnDate || '—'}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#fb7185' }}>
                      {f.lateDays} day(s)
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: f.status === 'UNPAID' ? '#fb7185' : '#34d399' }}>
                      ₹{f.amount?.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${f.status === 'PAID' ? 'badge-paid' : 'badge-unpaid'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td>
                    {f.status === 'UNPAID' ? (
                      <button
                        onClick={() => handlePayFine(f.id)}
                        disabled={payingId === f.id}
                        className="btn btn-primary btn-sm"
                        title="Pay Fine"
                      >
                        {payingId === f.id ? (
                          <>
                            <Loader2 size={13} className="spin-animation" /> Paying...
                          </>
                        ) : (
                          <>
                            <CreditCard size={13} /> Pay Now
                          </>
                        )}
                      </button>
                    ) : (
                      <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle size={14} /> Settled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Fines;
