'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Package, Plus, Search, Filter, ArrowUpDown, X, Save, Trash2 } from 'lucide-react';

export default function Products() {
  const [lst, setList] = useState([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('ALL');
  const [srt, setSrt] = useState('name');
  const [add, setAdd] = useState(false);
  const [frm, setFrm] = useState({ sku:'', name:'', brand:'', category:'', cost:0, price:0, unit:'pc', stock:0 });

  useEffect(() => { 
    refresh();
  }, []);

  const refresh = () => api.get('/inv/items').then(r => setList(r.data));

  const save = async (e) => {
    e.preventDefault();
    await api.post('/inv/items', frm);
    alert('ASSET REGISTERED');
    setAdd(false);
    setFrm({ sku:'', name:'', brand:'', category:'', cost:0, price:0, unit:'pc', stock:0 });
    refresh();
  };

  const del = async (id) => {
    if(!confirm('CONFIRM DELETION?')) return;
    await api.delete(`/inv/items/${id}`);
    refresh();
  };

  const cats = ['ALL', ...new Set(lst.map(i => i.category).filter(Boolean))];

  const res = lst
    .filter(i => {
      const m = (i.name || '').toLowerCase().includes(q.toLowerCase()) || (i.sku || '').toLowerCase().includes(q.toLowerCase());
      const c = cat === 'ALL' || i.category === cat;
      return m && c;
    })
    .sort((a, b) => {
      if (srt === 'price') return (b.price||0) - (a.price||0);
      if (srt === 'stock') return (a.stock||0) - (b.stock||0);
      return (a.name||'').localeCompare(b.name||'');
    });

  return (
    <div>
      <style>{`
        .icon-btn {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 4px !important;
          margin: 0 !important;
          color: #64748b !important;
          transition: all 0.2s;
        }
        .icon-btn:hover {
          color: #ef4444 !important;
          filter: drop-shadow(0 0 8px #ef4444) !important;
          transform: scale(1.1);
        }
      `}</style>
      {add && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div className="card" style={{width:500, maxWidth:'90%'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:20}}>
              <h3 style={{margin:0, color:'#10b981'}}>REGISTER_NEW_ASSET</h3>
              <X style={{cursor:'pointer'}} onClick={()=>setAdd(false)}/>
            </div>
            <form onSubmit={save}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                <div><label className="label">SKU</label><input required value={frm.sku} onChange={e=>setFrm({...frm, sku:e.target.value})}/></div>
                <div><label className="label">NAME</label><input required value={frm.name} onChange={e=>setFrm({...frm, name:e.target.value})}/></div>
                <div><label className="label">BRAND</label><input required value={frm.brand} onChange={e=>setFrm({...frm, brand:e.target.value})}/></div>
                <div><label className="label">CATEGORY</label><input required value={frm.category} onChange={e=>setFrm({...frm, category:e.target.value})}/></div>
                <div><label className="label">COST</label><input type="number" required value={frm.cost} onChange={e=>setFrm({...frm, cost:e.target.value})}/></div>
                <div><label className="label">PRICE</label><input type="number" required value={frm.price} onChange={e=>setFrm({...frm, price:e.target.value})}/></div>
                <div><label className="label">UNIT</label><input required value={frm.unit} onChange={e=>setFrm({...frm, unit:e.target.value})}/></div>
                <div><label className="label">INIT_STOCK</label><input type="number" required value={frm.stock} onChange={e=>setFrm({...frm, stock:e.target.value})}/></div>
              </div>
              <button style={{background:'#10b981', color:'black', display:'flex', justifyContent:'center', gap:8}}><Save size={16}/> CONFIRM_ENTRY</button>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{marginBottom:24, display:'flex', gap:15, flexWrap:'wrap', alignItems:'end'}}>
        <div style={{flex:1, minWidth:200}}>
          <label className="label" style={{marginTop:0, marginBottom:5, display:'flex', gap:6}}><Search size={14}/> SEARCH_QUERY</label>
          <input style={{margin:0}} placeholder="Find SKU or Name..." value={q} onChange={e=>setQ(e.target.value)} />
        </div>
        <div style={{width:200}}>
          <label className="label" style={{marginTop:0, marginBottom:5, display:'flex', gap:6}}><Filter size={14}/> FILTER_CLASS</label>
          <select style={{margin:0}} value={cat} onChange={e=>setCat(e.target.value)}>
            {cats.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{width:200}}>
          <label className="label" style={{marginTop:0, marginBottom:5, display:'flex', gap:6}}><ArrowUpDown size={14}/> SORT_ORDER</label>
          <select style={{margin:0}} value={srt} onChange={e=>setSrt(e.target.value)}>
            <option value="name">ALPHABETICAL</option>
            <option value="price">HIGHEST_VALUE</option>
            <option value="stock">LOWEST_STOCK</option>
          </select>
        </div>
        <div style={{width:200}}>
          <button onClick={()=>setAdd(true)} sstyle={{marginTop:0, marginBottom:5, display:'flex', gap:6}}>
            <Plus size={11}/> ADD_NODE
          </button>
        </div>
      </div>

      <div className="card" style={{overflowX:'auto'}}>
        <table>
          <thead>
            <tr>
              <th>SKU_ID</th><th>IDENTIFIER</th><th>BRAND</th><th>CLASS</th><th>COST</th><th>PRICE</th><th>UNIT</th><th>GLOBAL_QTY</th><th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {res.map(i => (
              <tr key={i.id}>
                <td style={{color:'#3b82f6'}}>{i.sku}</td>
                <td style={{fontWeight:'bold'}}>{i.name}</td>
                <td>{i.brand || '-'}</td>
                <td style={{color:'#94a3b8'}}>{i.category || '-'}</td>
                <td>₹{i.cost || 0}</td>
                <td style={{color:'#10b981'}}>₹{i.price || 0}</td>
                <td style={{color:'#64748b'}}>{i.unit}</td>
                <td style={{fontWeight:'bold'}}>{i.stock}</td>
                <td>
                  <button onClick={()=>del(i.id)} className="icon-btn">
                    <Trash2 size={16}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {res.length === 0 && <div style={{padding:20, textAlign:'center', color:'#64748b'}}>NO_DATA_FOUND</div>}
      </div>
    </div>
  );
}