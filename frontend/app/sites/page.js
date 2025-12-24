'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { MapPin, Search, ArrowUpDown, Filter } from 'lucide-react';

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [q, setQ] = useState('');
  const [srt, setSrt] = useState('load');

  useEffect(() => {
    api.get('/site').then(r => {
      const data = r.data.map((s, index) => ({
        ...s,
        remaining: s.capacity - s.occupied,
        percent: Math.round((s.occupied / s.capacity) * 100),
        transport_mode: ['Air', 'Sea', 'Rail', 'Truck'][index % 4],
        transport_cost: Math.floor(Math.random() * 5000) + 1000
      }));
      setSites(data);
    });
  }, []);

  const res = sites.filter(s => 
    s.name.toLowerCase().includes(q.toLowerCase()) || 
    s.type.toLowerCase().includes(q.toLowerCase())
  ).sort((a, b) => {
    if (srt === 'load') return b.percent - a.percent;
    if (srt === 'free') return b.remaining - a.remaining;
    if (srt === 'cost') return b.transport_cost - a.transport_cost;
    return a.name.localeCompare(b.name);
  });

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
        <h1><MapPin color="#f59e0b"/> WAREHOUSE LOGISTICS</h1>
      </div>

      <div className="card" style={{marginBottom:24, display:'flex', gap:15, flexWrap:'wrap', alignItems:'end'}}>
        <div style={{flex:1, minWidth:200}}>
          <label className="label" style={{marginTop:0, marginBottom:5, display:'flex', gap:6}}><Search size={14}/> SEARCH_NODES</label>
          <input style={{margin:0}} placeholder="Search Node Name or Type..." value={q} onChange={e=>setQ(e.target.value)} />
        </div>
        <div style={{width:200}}>
          <label className="label" style={{marginTop:0, marginBottom:5, display:'flex', gap:6}}><ArrowUpDown size={14}/> SORT_METRIC</label>
          <select style={{margin:0}} value={srt} onChange={e=>setSrt(e.target.value)}>
            <option value="load">HIGHEST_LOAD</option>
            <option value="free">MOST_FREE_SPACE</option>
            <option value="cost">TRANSPORT_COST</option>
            <option value="name">ALPHABETICAL</option>
          </select>
        </div>
      </div>

      <div className="card" style={{overflowX:'auto'}}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>NODE_NAME</th>
              <th>TYPE</th>
              <th>LOAD</th>
              <th>FREE</th>
              <th>UTILIZATION</th>
              <th>LOGISTICS_MODE</th>
              <th>ROUTE_COST</th>
            </tr>
          </thead>
          <tbody>
            {res.map(s => (
              <tr key={s.id}>
                <td style={{color:'#64748b'}}>#{s.id}</td>
                <td style={{fontWeight:'500'}}>{s.name}</td>
                <td style={{textTransform:'capitalize', color:'#cbd5e1'}}>{s.type}</td>
                <td style={{fontWeight:'bold'}}>{s.occupied}</td>
                <td style={{color: s.remaining < 100 ? '#ef4444' : '#10b981', fontWeight:'bold'}}>
                  {s.remaining}
                </td>
                <td style={{width:150}}>
                  <div style={{width:'100%', height:6, background:'#334155', borderRadius:3, overflow:'hidden'}}>
                    <div style={{
                      width: `${s.percent}%`, 
                      height:'100%', 
                      background: s.percent > 90 ? '#ef4444' : s.percent > 70 ? '#f59e0b' : '#10b981'
                    }} />
                  </div>
                  <div style={{fontSize:10, color:'#94a3b8', marginTop:2, fontFamily:'monospace'}}>{s.percent}% FULL</div>
                </td>
                <td style={{display:'flex', alignItems:'center', gap:6}}>
                    <span style={{width:6, height:6, borderRadius:'50%', background:'#3b82f6'}}></span>
                    {s.transport_mode}
                </td>
                <td style={{fontFamily:'monospace', color:'#f59e0b'}}>₹{s.transport_cost.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {res.length === 0 && <div style={{padding:20, textAlign:'center', color:'#64748b'}}>NO_ACTIVE_NODES_FOUND</div>}
      </div>
    </div>
  );
}