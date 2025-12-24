'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function Movements() {
  const [tab, setTab] = useState('list');
  const [txns, setTxns] = useState([]);
  const [items, setItems] = useState([]);
  const [sites, setSites] = useState([]);
  const [form, setForm] = useState({ itemId: '', from: '', to: '', qty: '' });

  useEffect(() => {
    fetchData();
    api.get('/inv/items').then(r => setItems(r.data));
    api.get('/site').then(r => setSites(r.data));
  }, []);

  const fetchData = () => {
    api.get('/inv/txn').then(r => {
      // Filter out Damage reports from this view
      setTxns(r.data.filter(t => t.type !== 'DAMAGE'));
    });
  };

  const submit = async (e, type) => {
    e.preventDefault();
    await api.post('/inv/txn', { ...form, type });
    alert('Transaction Recorded');
    setTab('list');
    fetchData();
    setForm({ itemId: '', from: '', to: '', qty: '' });
  };

  const Tabs = () => (
    <div style={{display:'flex', gap:10, marginBottom:20}}>
      <button onClick={()=>setTab('list')} style={{opacity: tab==='list'?1:0.5, width:'auto'}}>History</button>
      <button onClick={()=>setTab('in')} style={{background:'#10b981', opacity: tab==='in'?1:0.5, width:'auto'}}>+ Inward</button>
      <button onClick={()=>setTab('out')} style={{background:'#f59e0b', opacity: tab==='out'?1:0.5, width:'auto'}}>- Dispatch</button>
      <button onClick={()=>setTab('move')} style={{background:'#3b82f6', opacity: tab==='move'?1:0.5, width:'auto'}}>⇄ Transfer</button>
    </div>
  );

  return (
    <div>
      <h1>Stock Movements</h1>
      <Tabs />

      {tab === 'list' && (
        <div className="card">
           <table>
            <thead><tr><th>Date</th><th>Type</th><th>Item</th><th>Qty</th><th>From</th><th>To</th></tr></thead>
            <tbody>
              {txns.map(t => (
                <tr key={t.id}>
                  <td style={{color:'#94a3b8', fontSize:12}}>{new Date(t.date).toLocaleString()}</td>
                  <td style={{fontWeight:'bold'}}>{t.type}</td>
                  <td>{items.find(i=>i.id===t.item_id)?.name || t.item_id}</td>
                  <td style={{fontWeight:'bold'}}>{t.qty}</td>
                  <td>{sites.find(s=>s.id===t.from_site)?.name || '-'}</td>
                  <td>{sites.find(s=>s.id===t.to_site)?.name || '-'}</td>
                </tr>
              ))}
            </tbody>
           </table>
        </div>
      )}

      {tab === 'in' && (
        <div className="form-box">
          <h2>Inward Stock (Purchase)</h2>
          <form onSubmit={(e)=>submit(e, 'IN')} className="card">
            <label className="label">Item</label>
            <select required onChange={e=>setForm({...form, itemId:e.target.value})}>
              <option value="">Select Item</option>
              {items.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <label className="label">Destination Warehouse/Site</label>
            <select required onChange={e=>setForm({...form, to:e.target.value})}>
              <option value="">Select Site</option>
              {sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label className="label">Quantity</label>
            <input required type="number" onChange={e=>setForm({...form, qty:e.target.value})} />
            <button style={{background:'#10b981'}}>Confirm Inward</button>
          </form>
        </div>
      )}

      {tab === 'out' && (
        <div className="form-box">
          <h2>Dispatch Stock (Usage)</h2>
          <form onSubmit={(e)=>submit(e, 'OUT')} className="card">
            <label className="label">Item</label>
            <select required onChange={e=>setForm({...form, itemId:e.target.value})}>
              <option value="">Select Item</option>
              {items.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <label className="label">Source Site</label>
            <select required onChange={e=>setForm({...form, from:e.target.value})}>
              <option value="">Select Site</option>
              {sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label className="label">Quantity</label>
            <input required type="number" onChange={e=>setForm({...form, qty:e.target.value})} />
            <button style={{background:'#f59e0b'}}>Confirm Dispatch</button>
          </form>
        </div>
      )}

      {tab === 'move' && (
        <div className="form-box">
          <h2>Site Transfer</h2>
          <form onSubmit={(e)=>submit(e, 'MOVE')} className="card">
            <label className="label">Item</label>
            <select required onChange={e=>setForm({...form, itemId:e.target.value})}>
              <option value="">Select Item</option>
              {items.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <label className="label">From</label>
            <select required onChange={e=>setForm({...form, from:e.target.value})}>
              <option value="">Select Source</option>
              {sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label className="label">To</label>
            <select required onChange={e=>setForm({...form, to:e.target.value})}>
              <option value="">Select Destination</option>
              {sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label className="label">Quantity</label>
            <input required type="number" onChange={e=>setForm({...form, qty:e.target.value})} />
            <button>Transfer Stock</button>
          </form>
        </div>
      )}
    </div>
  );
}