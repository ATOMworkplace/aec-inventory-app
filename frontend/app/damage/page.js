'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { AlertOctagon, BarChart3, AlertTriangle } from 'lucide-react';

export default function Damage() {
  const [logs, setLogs] = useState([]);
  const [items, setItems] = useState([]);
  const [sites, setSites] = useState([]);
  const [stats, setStats] = useState([]);
  const [form, setForm] = useState({ itemId: '', from: '', qty: '' });

  useEffect(() => {
    refresh();
    api.get('/inv/items').then(r => setItems(r.data));
    api.get('/site').then(r => setSites(r.data));
  }, []);

  const refresh = () => {
    api.get('/inv/txn').then(r => {
      const dmg = r.data.filter(t => t.type === 'DAMAGE');
      setLogs(dmg);
    });
  };

  useEffect(() => {
    if (items.length && logs.length) {
      const map = {};
      logs.forEach(l => {
        const i = items.find(x => x.id === l.item_id);
        const name = i ? i.name : 'Unknown';
        map[name] = (map[name] || 0) + l.qty;
      });
      setStats(Object.entries(map).map(([name, qty]) => ({ name, qty })).sort((a,b) => b.qty - a.qty).slice(0, 10));
    }
  }, [logs, items]);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/inv/txn', { ...form, type: 'DAMAGE' });
    alert('FAILURE LOGGED');
    setForm({ itemId: '', from: '', qty: '' });
    refresh();
  };

  const maxVal = Math.max(...stats.map(s => s.qty), 1);

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
        <h1><AlertOctagon color="#ef4444"/> DATA_CORRUPTION_LOGS</h1>
      </div>

      <div className="card" style={{marginBottom: 24, padding: 24}}>
        <h3 style={{fontSize:'0.9rem', color:'#94a3b8', margin:'0 0 30px 0', display:'flex', alignItems:'center', gap:8}}>
            <BarChart3 size={16} color="#ef4444"/> LOSS_SEVERITY_METRICS
        </h3>
        
        <div style={{height: 250, display: 'flex', alignItems: 'flex-end', gap: '2%', paddingBottom: 20, borderBottom: '1px solid #334155'}}>
          {stats.length === 0 ? (
            <div style={{width:'100%', textAlign:'center', color:'#64748b', alignSelf:'center'}}>NO_DATA_STREAM</div>
          ) : (
            stats.map((s, i) => (
              <div key={i} style={{flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center'}}>
                <div style={{
                    width: '100%', 
                    height: `${(s.qty / maxVal) * 100}%`, 
                    background: 'linear-gradient(180deg, #ef4444 0%, #7f1d1d 100%)',
                    borderRadius: '4px 4px 0 0',
                    position: 'relative',
                    minHeight: 4,
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)',
                    transition: 'height 0.3s ease'
                }}>
                   <div style={{
                       position: 'absolute', 
                       top: -25, 
                       left: '50%', 
                       transform: 'translateX(-50%)', 
                       color: '#ef4444', 
                       fontWeight: 'bold',
                       fontSize: '0.8rem'
                   }}>{s.qty}</div>
                </div>
                <div style={{
                    marginTop: 10, 
                    fontSize: '0.65rem', 
                    color: '#94a3b8', 
                    textAlign: 'center', 
                    fontFamily: 'monospace',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }} title={s.name}>
                    {s.name.length > 8 ? s.name.substring(0, 8) + '..' : s.name}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="grid" style={{gridTemplateColumns:'1fr 2fr'}}>
        <div className="form-box" style={{margin:0, maxWidth:'100%'}}>
          <form onSubmit={submit} className="card" style={{height:'100%'}}>
            <h3 style={{margin:0, color:'#ef4444', display:'flex', alignItems:'center', gap:8}}><AlertTriangle size={16}/> REPORT_FAILURE</h3>
            <label className="label">ASSET_ID</label>
            <select required value={form.itemId} onChange={e=>setForm({...form, itemId:e.target.value})}>
              <option value="">SELECT_ID</option>{items.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <label className="label">NODE_ID</label>
            <select required value={form.from} onChange={e=>setForm({...form, from:e.target.value})}>
              <option value="">SELECT_NODE</option>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label className="label">LOST_QTY</label>
            <input required type="number" value={form.qty} onChange={e=>setForm({...form, qty:e.target.value})} />
            <button className="text-red" style={{border:'1px solid #ef4444', background:'rgba(239, 68, 68, 0.1)'}}>LOG ERROR</button>
          </form>
        </div>

        <div className="card">
          <h3 style={{margin:0, marginBottom:20}}>RECENT_ERRORS</h3>
          <table>
            <thead><tr><th>TIMESTAMP</th><th>ASSET</th><th>NODE</th><th>LOSS</th></tr></thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id}>
                  <td style={{color:'#64748b', fontSize:12, fontFamily:'monospace'}}>{new Date(l.date).toLocaleString()}</td>
                  <td>{items.find(i=>i.id===l.item_id)?.name || 'UNKNOWN'}</td>
                  <td style={{color:'#94a3b8'}}>{sites.find(s=>s.id===l.from_site)?.name || 'UNKNOWN'}</td>
                  <td style={{color:'#ef4444', fontWeight:'bold', fontFamily:'monospace'}}>-{l.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <div style={{padding:20, textAlign:'center', color:'#64748b'}}>SYSTEM_OPTIMAL_NO_ERRORS</div>}
        </div>
      </div>
    </div>
  );
}