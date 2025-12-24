'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import Heatmap from '@/components/Heatmap';
import { 
  TrendingUp, DollarSign, Activity, ArrowRight, ArrowUpRight, 
  ArrowDownRight, AlertOctagon, PieChart as PieIcon, MapPin, Tags,
  AlertTriangle, Skull, Zap, Package 
} from 'lucide-react';

export default function Dash() {
  const [dat, setDat] = useState([]);
  const [sts, setSts] = useState({ tot: 0, low: 0, rev: 0, prf: 0, dmg: 0, tvr: 0, activeSkus: 0 });
  const [recentTxn, setRecentTxn] = useState([]);
  const [warehouseStats, setWarehouseStats] = useState([]);
  const [transferStats, setTransferStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [deadStock, setDeadStock] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [highVelocity, setHighVelocity] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/inv/items'), 
      api.get('/inv/stock'), 
      api.get('/inv/txn'),
      api.get('/site')
    ]).then(([rItm, rStk, rTxn, rSite]) => {
        const its = rItm.data;
        const stk = rStk.data;
        const txn = rTxn.data;
        const sites = rSite.data || [];
        
        const map = {};
        const siteMap = {};
        const catMap = {};
        const soldItemIds = new Set();
        const velocityMap = {};

        sites.forEach(s => siteMap[s.id] = { ...s, qty: 0 });

        its.forEach(i => map[i.id] = { ...i, qty: 0, sites: new Set() });
        stk.forEach(s => { 
          if (map[s.item_id]) {
            map[s.item_id].qty += s.qty; 
            map[s.item_id].sites.add(s.site_id);
            const cat = map[s.item_id].category || 'Uncategorized';
            if (!catMap[cat]) catMap[cat] = 0;
            catMap[cat] += s.qty;
          }
          if (siteMap[s.site_id]) siteMap[s.site_id].qty += s.qty;
        });

        const agg = Object.values(map).map(i => ({ ...i, value: i.qty, siteCount: i.sites.size })).filter(i => i.qty > 0);
        setDat(agg);
        setLowStock(agg.filter(i => i.qty < 20).sort((a,b) => a.qty - b.qty).slice(0, 5));

        let dQty = 0, rev = 0, prf = 0, out = 0;
        let tIn = 0, tOut = 0, tMove = 0, tDmg = 0;

        txn.forEach(t => {
          const i = map[t.item_id];
          if (!i) return;
          if (t.type === 'DAMAGE') { dQty += t.qty; tDmg++; }
          if (t.type === 'OUT') { 
            rev += t.qty * i.price; 
            prf += t.qty * (i.price - i.cost); 
            out += t.qty; 
            tOut++;
            soldItemIds.add(t.item_id);
            velocityMap[t.item_id] = (velocityMap[t.item_id] || 0) + t.qty;
          }
          if (t.type === 'IN') tIn++;
          if (t.type === 'MOVE') tMove++;
        });

        setDeadStock(agg.filter(i => !soldItemIds.has(i.id)).slice(0, 3));
        setHighVelocity(Object.entries(velocityMap).map(([id, qty]) => ({ ...map[id], sold: qty })).sort((a, b) => b.sold - a.sold).slice(0, 5));

        setSts({
          tot: agg.reduce((a, b) => a + b.qty, 0),
          low: agg.filter(i => i.qty < 20).length,
          rev, prf, dmg: dQty, tvr: out,
          activeSkus: agg.length
        });

        setTransferStats([
            { label: 'Inbound', value: tIn, color: '#10b981' },
            { label: 'Outbound', value: tOut, color: '#f59e0b' },
            { label: 'Internal', value: tMove, color: '#3b82f6' },
            { label: 'Damage', value: tDmg, color: '#ef4444' }
        ]);

        const sortedCats = Object.entries(catMap).map(([k, v]) => ({ label: k, value: v })).sort((a, b) => b.value - a.value);
        const topCats = sortedCats.slice(0, 4);
        const otherQty = sortedCats.slice(4).reduce((acc, curr) => acc + curr.value, 0);
        if (otherQty > 0) topCats.push({ label: 'Others', value: otherQty });
        const catColors = ['#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#64748b'];
        setCategoryStats(topCats.map((c, i) => ({ ...c, color: catColors[i % catColors.length] })));

        setWarehouseStats(Object.values(siteMap).map(s => ({
            ...s, percent: Math.min(Math.round((s.qty / (s.capacity || 10000)) * 100), 100)
          })).sort((a, b) => b.percent - a.percent).slice(0, 8));

        setRecentTxn(txn.slice(0, 5).map(t => {
          const i = map[t.item_id] || { name: 'Unknown', sku: '---' };
          return { ...t, name: i.name, sku: i.sku };
        }));
      });
  }, []);

  const KpiCard = ({ title, value, icon: Icon, color, sub, trend, link }) => (
    <Link href={link} className="kpi-card-link">
      <div className="kpi-card" style={{borderColor: '#334155'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 15}}>
          <div>
            <p style={{color:'#94a3b8', fontSize:'0.8rem', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.5px'}}>{title}</p>
            <h3 style={{fontSize:'1.8rem', fontWeight:'700', color:'white', margin:'8px 0'}}>{value}</h3>
          </div>
          <div style={{background: `${color}15`, padding: 12, borderRadius: 12, color: color}}>
            <Icon size={24} />
          </div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap: 6, fontSize:'0.8rem'}}>
          <span style={{color: trend === 'up' ? '#10b981' : '#ef4444', display:'flex', alignItems:'center', fontWeight:'700', gap:2}}>
            {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />} {sub}
          </span>
          <span style={{color:'#64748b'}}>vs last month</span>
        </div>
      </div>
    </Link>
  );

  const AdvancedPieChart = ({ data, totalLabel }) => {
    const total = data.reduce((a, b) => a + b.value, 0);
    let cumulativePercent = 0;
    const gradient = data.map(d => {
        const percent = (d.value / total) * 100;
        const str = `${d.color} ${cumulativePercent}% ${cumulativePercent + percent}%`;
        cumulativePercent += percent;
        return str;
    }).join(', ');

    return (
      <div className="pie-container">
        <div style={{position:'relative', width:180, height:180, borderRadius:'50%', background: `conic-gradient(${gradient})`, flexShrink: 0, boxShadow:'0 0 20px rgba(0,0,0,0.3)'}}>
          <div style={{position:'absolute', inset:35, background:'#1e293b', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column'}}>
            <span style={{fontSize:'1.2rem', fontWeight:'bold', color:'white'}}>{total.toLocaleString()}</span>
            <span style={{fontSize:'0.65rem', color:'#94a3b8'}}>{totalLabel}</span>
          </div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:8, flex:1, minWidth:140}}>
          {data.map((d, i) => (
             <div key={i} style={{display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:'0.8rem', color:'#cbd5e1'}}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <div style={{width:8, height:8, borderRadius:'2px', background:d.color}}></div> 
                    {d.label}
                </div>
                <div style={{display:'flex', gap:8}}>
                    <span style={{fontWeight:'bold'}}>{d.value.toLocaleString()}</span>
                    <span style={{color:'#64748b', fontSize:'0.75rem'}}>({Math.round((d.value/total)*100)}%)</span>
                </div>
             </div>
          ))}
        </div>
      </div>
    );
  };

  const ListItem = ({ title, sub, right, color, icon: Icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #334155' }}>
        <div style={{display:'flex', alignItems:'center', gap:12, overflow:'hidden'}}>
            <div style={{minWidth:32, height:32, borderRadius:'8px', background: `${color}15`, color: color, display:'flex', alignItems:'center', justifyContent:'center'}}>
                <Icon size={16}/>
            </div>
            <div style={{overflow:'hidden'}}>
                <div style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight:'500', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{title}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{sub}</div>
            </div>
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: color, paddingLeft: 10 }}>{right}</div>
    </div>
  );

  return (
    <div className="dash-container">
      <style jsx global>{`
        .dash-container { padding: 30px; background: #0f172a; min-height: 100vh; font-family: sans-serif; }
        
        /* KPI Grid (Top) */
        .kpi-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); 
            gap: 20px; 
            margin-bottom: 24px; 
        }
        
        .kpi-card { background: #1e293b; padding: 24px; border-radius: 16px; border: 1px solid #334155; transition: transform 0.2s; height: 100%; box-sizing: border-box; }
        .kpi-card:hover { transform: translateY(-2px); }
        .kpi-card-link { text-decoration: none; }
        
        /* Middle Section */
        .main-flex { display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 24px; align-items: stretch; }
        .heatmap-section { flex: 2 1 600px; background: #1e293b; padding: 24px; border-radius: 16px; border: 1px solid #334155; display: flex; flex-direction: column; }
        .side-section { flex: 1 1 350px; display: flex; flex-direction: column; gap: 24px; }
        
        /* Card Boxes */
        .card-box { 
            background: #1e293b; 
            padding: 24px; 
            border-radius: 16px; 
            border: 1px solid #334155; 
            height: 100%; /* Force equal height */
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        }
        
        .pie-container { display: flex; align-items: center; gap: 25px; flex-wrap: wrap; justify-content: center; }

        /* Bottom Grid (Last 3 Boxes) */
        .bottom-grid { 
            display: grid; 
            /* MATCHING KPI GRID EXACTLY: minmax 260px */
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); 
            gap: 20px; 
        }

        @media (max-width: 768px) {
            .dash-container { padding: 16px; }
            .main-flex { flex-direction: column; }
            .heatmap-section { flex: auto; width: 100%; box-sizing: border-box; }
            .side-section { flex: auto; width: 100%; }
            .kpi-grid, .bottom-grid { grid-template-columns: 1fr; }
            
            /* Heatmap Specific Scaling Overrides */
            .heatmap-override > div {
                grid-template-columns: repeat(auto-fill, minmax(50px, 1fr)) !important;
                gap: 6px !important;
            }
            .heatmap-override > div > div {
                height: 60px !important;
                clip-path: none !important;
                border-radius: 8px;
            }
            .heatmap-override > div > div > div:first-child {
                font-size: 0.8rem !important;
            }
            .heatmap-override > div > div > div:last-child {
                display: none !important;
            }
        }
      `}</style>
      <div className="kpi-grid">
        <KpiCard title="Total Asset Value" value={`₹${(sts.tot * 450 / 100000).toFixed(2)}L`} icon={DollarSign} color="#3b82f6" sub="12.5%" trend="up" link="/stock" />
        <KpiCard title="Net Profit" value={`₹${(sts.prf/1000).toFixed(1)}k`} icon={TrendingUp} color="#10b981" sub="8.4%" trend="up" link="/analysis" />
        <KpiCard title="Monthly Turnover" value={sts.tvr.toLocaleString()} icon={Activity} color="#f59e0b" sub="3.1%" trend="down" link="/movements" />
        <KpiCard title="Damaged Stock" value={sts.dmg} icon={AlertOctagon} color="#ef4444" sub="1.2%" trend="down" link="/damage" />
      </div>

      <div className="main-flex">
        
        <div className="heatmap-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white', fontWeight:'600' }}>Global Inventory Heatmap</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Visual distribution of {sts.activeSkus} Active SKUs</p>
            </div>
            <Link href="/items" style={{fontSize: '0.8rem', color: '#3b82f6', textDecoration:'none', display:'flex', alignItems:'center', gap:4}}>
              Full Inventory <ArrowRight size={14}/>
            </Link>
          </div>
          <div className="heatmap-override">
            <Heatmap data={dat} />
          </div>
        </div>

        <div className="side-section">
          
          <div className="card-box">
            <Link href="/movements" style={{textDecoration:'none'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:20, cursor:'pointer'}}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'white', display:'flex', alignItems:'center', gap:8 }}>
                        <PieIcon size={18} color="#8b5cf6"/> Transfer Analytics
                    </h3>
                    <ArrowRight size={16} color="#64748b"/>
                </div>
            </Link>
            <AdvancedPieChart data={transferStats} totalLabel="Txns" />
          </div>

          <div className="card-box">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem', color: 'white', display:'flex', alignItems:'center', gap:8 }}>
                <Tags size={18} color="#ec4899"/> Inventory by Category
            </h3>
            <AdvancedPieChart data={categoryStats} totalLabel="Items" />
          </div>

          <div className="card-box">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:15}}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'white', display:'flex', alignItems:'center', gap:8 }}>
                <Skull size={18} color="#94a3b8"/> Dead Stock Alerts
                </h3>
                <Link href="/deadstock" style={{color:'#94a3b8', fontSize:'0.75rem'}}>View All</Link>
            </div>
            <div>
                {deadStock.length > 0 ? deadStock.map((i, idx) => (
                    <ListItem key={idx} icon={Package} color="#94a3b8" title={i.name} sub={`SKU: ${i.sku}`} right={`${i.qty} Units`} />
                )) : <div style={{color:'#64748b', fontSize:'0.8rem', padding:20, textAlign:'center'}}>No dead stock detected</div>}
            </div>
          </div>

          <div className="card-box" style={{ flex: 1 }}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:20}}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'white', display:'flex', alignItems:'center', gap:8 }}>
                    <MapPin size={18} color="#f59e0b"/> Warehouse Utilization
                </h3>
                <Link href="/sites" style={{color:'#64748b'}}> <ArrowRight size={16}/> </Link>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:15, flex:1, overflowY:'auto'}}>
                {warehouseStats.map((w, i) => (
                  <div key={i}>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginBottom:5, color:'#cbd5e1'}}>
                      <span>{w.name}</span>
                      <span style={{fontWeight:'bold'}}>{w.percent}%</span>
                    </div>
                    <div style={{width:'100%', height:6, background:'#334155', borderRadius:3, overflow:'hidden'}}>
                      <div style={{width:`${w.percent}%`, height:'100%', background: w.percent > 90 ? '#ef4444' : w.percent > 70 ? '#f59e0b' : '#3b82f6', borderRadius:3}}></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}