'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

export default function StockLevels() {
  const [stock, setStock] = useState([]);
  const [q, setQ] = useState('');
  const [stat, setStat] = useState('ALL');
  const [srt, setSrt] = useState('low');

  useEffect(() => {
    api.get('/inv/stock').then(r => setStock(r.data));
  }, []);

  const getSt = (qty) => {
    if (qty === 0) return { l: 'Empty', c: '#94a3b8', b: '#334155' };
    if (qty < 20) return { l: 'Critical', c: '#ef4444', b: 'rgba(239, 68, 68, 0.1)' };
    if (qty < 50) return { l: 'Low', c: '#eab308', b: 'rgba(234, 179, 8, 0.1)' };
    return { l: 'Good', c: '#10b981', b: 'rgba(16, 185, 129, 0.1)' };
  };

  const proc = stock.map(s => {
    const st = getSt(s.qty);
    const cost = Number(s.cost) || 0;
    return { ...s, statusLabel: st.l, statusColor: st.c, statusBg: st.b, val: s.qty * cost, cost };
  });

  const res = proc.filter(s => {
    const m = (s.item||'').toLowerCase().includes(q.toLowerCase()) || 
              (s.sku||'').toLowerCase().includes(q.toLowerCase()) || 
              (s.site||'').toLowerCase().includes(q.toLowerCase());
    const f = stat === 'ALL' || s.statusLabel.toUpperCase() === stat;
    return m && f;
  }).sort((a, b) => {
    if (srt === 'name') return a.item.localeCompare(b.item);
    if (srt === 'val') return b.val - a.val;
    if (srt === 'high') return b.qty - a.qty;
    return a.qty - b.qty;
  });

  return (
    <div>
       <div className="card" style={{marginBottom:24, display:'flex', gap:15, flexWrap:'wrap', alignItems:'end'}}>
        <div style={{flex:1, minWidth:200}}>
          <label className="label" style={{marginTop:0, marginBottom:5, display:'flex', gap:6}}><Search size={14}/> SEARCH_INVENTORY</label>
          <input style={{margin:0}} placeholder="Search SKU, Item or Location..." value={q} onChange={e=>setQ(e.target.value)} />
        </div>
        <div style={{width:200}}>
          <label className="label" style={{marginTop:0, marginBottom:5, display:'flex', gap:6}}><Filter size={14}/> FILTER_STATUS</label>
          <select style={{margin:0}} value={stat} onChange={e=>setStat(e.target.value)}>
            <option value="ALL">SHOW_ALL</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="LOW">LOW_STOCK</option>
            <option value="GOOD">OPTIMAL</option>
            <option value="EMPTY">EMPTY</option>
          </select>
        </div>
        <div style={{width:200}}>
          <label className="label" style={{marginTop:0, marginBottom:5, display:'flex', gap:6}}><ArrowUpDown size={14}/> SORT_ORDER</label>
          <select style={{margin:0}} value={srt} onChange={e=>setSrt(e.target.value)}>
            <option value="low">QTY_ASC (LOWEST)</option>
            <option value="high">QTY_DESC (HIGHEST)</option>
            <option value="val">VALUE_DESC (HIGHEST)</option>
            <option value="name">ALPHABETICAL</option>
          </select>
        </div>
      </div>

      <div className="card" style={{overflowX:'auto'}}>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item Name</th>
              <th>Storage Location</th>
              <th>Stock Qty</th>
              <th>Status</th>
              <th>Unit Cost</th>
              <th>Est. Value</th>
              <th>Suggested Order</th>
            </tr>
          </thead>
          <tbody>
            {res.map((s, idx) => (
              <tr key={idx} style={{borderBottom:'1px solid #334155', background: s.statusBg}}>
                <td style={{fontFamily:'monospace', color:'#3b82f6'}}>{s.sku}</td>
                <td style={{fontWeight:'500'}}>{s.item}</td>
                <td style={{color:'#cbd5e1'}}>{s.site}</td>
                <td style={{fontWeight:'bold', fontSize:'1.1rem'}}>{s.qty}</td>
                <td>
                  <span style={{
                    color: s.statusColor, 
                    fontWeight:'bold', 
                    fontSize:'0.85rem',
                    padding: '4px 8px',
                    border: `1px solid ${s.statusColor}`,
                    borderRadius: '4px'
                  }}>
                    {s.statusLabel}
                  </span>
                </td>
                <td style={{fontFamily:'monospace'}}>₹{s.cost}</td>
                <td style={{fontFamily:'monospace', fontWeight:'bold'}}>₹{s.val.toLocaleString()}</td>
                <td style={{textAlign:'center'}}>
                  <span style={{
                    background: '#3b82f6', 
                    color: 'white', 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}>
                    +{s.qty + 10}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {res.length === 0 && (
            <div style={{padding:20, textAlign:'center', color:'#64748b', fontSize:'0.9rem'}}>
                NO MATCHING RECORDS FOUND
            </div>
        )}
      </div>
    </div>
  );
}