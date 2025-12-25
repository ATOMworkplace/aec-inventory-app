'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  TrendingUp, Archive, AlertOctagon, DollarSign, Activity, 
  ArrowUpRight, ArrowDownRight, Layers, Box, Info, X, CheckCircle, AlertTriangle 
} from 'lucide-react';

export default function Analysis() {
  const [data, setData] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    api.get('/analysis').then(r => setData(r.data));
  }, []);

  if (!data) return (
    <div style={{display:'flex', height:'100vh', width:'100%', alignItems:'center', justifyContent:'center', background:'#0f172a', color:'#94a3b8'}}>
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:12}}>
        <Activity className="animate-pulse" size={48} color="#3b82f6"/>
        <span style={{fontFamily:'sans-serif', letterSpacing:'0.05em'}}>ANALYZING DATA...</span>
      </div>
    </div>
  );

  const getGraphPath = (points, width, height) => {
    if (!points || points.length === 0) return '';
    const maxVal = Math.max(...points.map(p => p.profit));
    const stepX = width / (points.length - 1);
    
    let path = `M 0 ${height - (points[0].profit / maxVal) * height}`;
    points.forEach((p, i) => {
        const x = i * stepX;
        const y = height - (p.profit / maxVal) * height;
        path += ` L ${x} ${y}`;
    });
    return path;
  };

  const trendPoints = data.profitTrend || [];
  const isPositive = trendPoints.length > 1 && trendPoints[trendPoints.length-1].profit >= trendPoints[0].profit;
  const trendColor = isPositive ? '#10b981' : '#ef4444';
  const totalProfit = trendPoints.reduce((a,b)=>a+b.profit,0);

  const getEfficiencyLabel = (score) => {
      if (score >= 20) return { label: 'Optimal Flow', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
      if (score >= 0) return { label: 'Stable', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
      return { label: 'Congested', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
  };

  const handleExport = () => {
    const rows = [
        ['Logistics Analysis Report', new Date().toLocaleDateString()],
        [''],
        ['Financial Trend'],
        ['Month', 'Profit'],
        ...trendPoints.map(p => [p.month, p.profit]),
        [''],
        ['Opportunity Forecast'],
        ['Product', 'Class', 'Est Profit'],
        ...data.forecast.map(i => [i.name, i.classification, i.predictedMonthlyProfit]),
        [''],
        ['Warehouse Efficiency'],
        ['Name', 'Days To Full', 'Efficiency Score'],
        ...data.warehouseStats.map(w => [w.name, w.daysToFull, w.efficiencyScore]),
        [''],
        ['Risk Radar'],
        ['Location', 'Probability', 'Pred. Loss'],
        ...data.damageStats.map(d => [d.site, d.probability + '%', d.predictedLossNextMonth])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analysis_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cardStyle = {
    background: '#1e293b',
    borderRadius: 16,
    padding: 24,
    border: '1px solid #334155',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  };

  const headerStyle = {
    fontSize: 16,
    fontWeight: 600,
    color: '#f8fafc',
    marginBottom: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 10
  };

  const subHeaderStyle = { fontSize: 13, color: '#94a3b8', marginBottom: 20 };
  const tableHeaderStyle = { textAlign:'left', paddingBottom:12, color:'#64748b', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #334155' };
  const cellStyle = { padding: '16px 0', borderBottom: '1px solid #334155', color: '#e2e8f0', fontSize: 14 };
  const actionFooterStyle = { marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #334155', display: 'flex', gap: 8, alignItems: 'flex-start' };

  return (
    <div style={{minHeight: '100vh', background: '#0f172a', padding: 40, fontFamily: 'system-ui, -apple-system, sans-serif'}}>
      <div style={{maxWidth: 1400, margin: '0 auto'}}>
        
        {/* Header Section */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom: 40}}>
          <div>
            <h1 style={{fontSize: 32, fontWeight: 700, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em'}}>Inventory Analysis</h1>
            <p style={{color: '#94a3b8', margin: '8px 0 0 0'}}>Predictive modeling & logistics performance review</p>
          </div>
          <div style={{display:'flex', gap:12}}>
            <button 
                onClick={() => setShowGuide(!showGuide)} 
                style={{background: showGuide ? '#334155' : 'transparent', color: showGuide ? 'white' : '#94a3b8', border: '1px solid #334155', padding:'10px 16px', borderRadius:8, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:8, transition: 'all 0.2s'}}
            >
                {showGuide ? <X size={18}/> : <Info size={18}/>}
                {showGuide ? 'Close Guide' : 'How to use this?'}
            </button>
            <button onClick={handleExport} style={{background:'#3b82f6', color:'white', border:'none', padding:'10px 20px', borderRadius:8, fontWeight:600, cursor:'pointer', boxShadow:'0 0 15px rgba(59,130,246,0.3)'}}>
                Export Report
            </button>
          </div>
        </div>

        {/* User Guide Panel */}
        {showGuide && (
            <div style={{background:'#1e293b', border:'1px solid #334155', borderRadius:16, padding:24, marginBottom:30, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:24}}>
                <div>
                    <div style={{color:'#f8fafc', fontWeight:600, marginBottom:8, display:'flex', alignItems:'center', gap:8}}><TrendingUp size={16} color="#3b82f6"/> Opportunity Forecast</div>
                    <p style={{color:'#94a3b8', fontSize:13, lineHeight:1.5}}>Identifies products with high margin potential (Class A). <br/><span style={{color:'#f1f5f9'}}>Action:</span> Prioritize marketing and restocking for these items.</p>
                </div>
                <div>
                    <div style={{color:'#f8fafc', fontWeight:600, marginBottom:8, display:'flex', alignItems:'center', gap:8}}><Archive size={16} color="#f59e0b"/> Warehouse Efficiency</div>
                    <p style={{color:'#94a3b8', fontSize:13, lineHeight:1.5}}>A score calculated by (Turnover Rate / Capacity). <br/><span style={{color:'#f1f5f9'}}>Action:</span> "Congested" warehouses need immediate stock transfer or sales to clear space.</p>
                </div>
                <div>
                    <div style={{color:'#f8fafc', fontWeight:600, marginBottom:8, display:'flex', alignItems:'center', gap:8}}><AlertOctagon size={16} color="#ef4444"/> Risk Radar</div>
                    <p style={{color:'#94a3b8', fontSize:13, lineHeight:1.5}}>Predicts breakage probability based on transport history. <br/><span style={{color:'#f1f5f9'}}>Action:</span> Audit packaging for routes with less than 10% risk.</p>
                </div>
            </div>
        )}
      
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(350px, 1fr))', gap: 24}}>
          
          {/* Financial Card */}
          <div style={{...cardStyle, gridColumn: 'span 2'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom: 20}}>
                <div>
                    <h3 style={headerStyle}><DollarSign size={20} color="#10b981"/> Financial Health</h3>
                    <p style={subHeaderStyle}>12-Month Net Profit Trajectory</p>
                </div>
                <div style={{textAlign:'right'}}>
                    <div style={{fontSize: 32, fontWeight: 700, color: '#f8fafc', letterSpacing:'-0.03em'}}>
                          ₹{totalProfit.toLocaleString()}
                    </div>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4, color: trendColor, fontSize: 14, fontWeight: 600}}>
                        {isPositive ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}
                        {isPositive ? '+12.5%' : '-2.4%'} vs last year
                    </div>
                </div>
            </div>
            <div style={{height: 240, width: '100%', position: 'relative'}}>
                <svg width="100%" height="100%" viewBox="0 0 800 240" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{stopColor:trendColor, stopOpacity:0.3}} />
                            <stop offset="100%" style={{stopColor:trendColor, stopOpacity:0}} />
                        </linearGradient>
                    </defs>
                    <path d={`${getGraphPath(trendPoints, 800, 240)} L 800 240 L 0 240 Z`} fill="url(#grad1)" />
                    <path d={getGraphPath(trendPoints, 800, 240)} fill="none" stroke={trendColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
                </svg>
                <div style={{position:'absolute', bottom:0, left:0, width:'100%', display:'flex', justifyContent:'space-between', padding:'0 10px', pointerEvents:'none'}}>
                      {trendPoints.map((p, i) => (
                          <div key={i} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:8}}>
                            <div style={{width:1, height:10, background:'#334155'}}></div>
                            {i % 2 === 0 && <span style={{fontSize:10, color:'#64748b', fontWeight:600}}>{p.month.split('-')[1]}</span>}
                          </div>
                      ))}
                </div>
            </div>
          </div>

          {/* Forecast Card */}
          <div style={cardStyle}>
            <h3 style={headerStyle}><TrendingUp size={20} color="#3b82f6"/> Opportunity Forecast</h3>
            <p style={subHeaderStyle}>Top products to restock immediately</p>
            <div style={{overflowX:'auto'}}>
                <table style={{width:'100%', borderCollapse:'collapse'}}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Product</th>
                            <th style={tableHeaderStyle}>Priority</th>
                            <th style={{...tableHeaderStyle, textAlign:'right'}}>Est. Gain</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.forecast.slice(0, 4).map(i => (
                            <tr key={i.id}>
                                <td style={cellStyle}>
                                    <div style={{fontWeight:500}}>{i.name}</div>
                                </td>
                                <td style={cellStyle}>
                                    <span style={{ 
                                        background: i.classification === 'A' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                        color: i.classification === 'A' ? '#10b981' : '#3b82f6', 
                                        padding:'4px 8px', borderRadius:4, fontSize:11, fontWeight:700
                                    }}>Class {i.classification}</span>
                                </td>
                                <td style={{...cellStyle, textAlign:'right', fontWeight:600, color:'#e2e8f0'}}>
                                    ₹{(i.predictedMonthlyProfit/1000).toFixed(1)}k
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={actionFooterStyle}>
                <CheckCircle size={14} color="#10b981" style={{marginTop:2}}/>
                <span style={{fontSize:12, color:'#94a3b8'}}>
                    <strong style={{color:'#f1f5f9'}}>Recommendation:</strong> Increase stock levels for Class A items by 15% to capture projected gains.
                </span>
            </div>
          </div>

          {/* Warehouse Card */}
          <div style={cardStyle}>
            <h3 style={headerStyle}><Archive size={20} color="#f59e0b"/> Warehouse Efficiency</h3>
            <p style={subHeaderStyle}>Capacity vs. Turnover Performance</p>
            <div style={{display:'flex', flexDirection:'column', gap:16}}>
                {data.warehouseStats.slice(0,4).map((w, idx) => {
                    const status = getEfficiencyLabel(w.efficiencyScore);
                    return (
                        <div key={idx} style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                            <div style={{display:'flex', alignItems:'center', gap:12}}>
                                <div style={{background:'#334155', padding:8, borderRadius:8}}><Box size={16} color="#94a3b8"/></div>
                                <div>
                                    <div style={{fontSize:14, fontWeight:500, color:'#e2e8f0'}}>{w.name}</div>
                                    <div style={{fontSize:11, color:'#94a3b8'}}>{w.daysToFull === 999 ? 'Stable Capacity' : `${w.daysToFull} days until full`}</div>
                                </div>
                            </div>
                            <div style={{textAlign:'right'}}>
                                 <span style={{fontSize:11, fontWeight:700, color: status.color, background: status.bg, padding:'2px 8px', borderRadius:4}}>
                                    {status.label}
                                 </span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={actionFooterStyle}>
                <Info size={14} color="#f59e0b" style={{marginTop:2}}/>
                <span style={{fontSize:12, color:'#94a3b8'}}>
                    <strong style={{color:'#f1f5f9'}}>Strategy:</strong> Move inventory OUT of "Congested" hubs and INTO "Optimal" hubs to reduce storage costs.
                </span>
            </div>
          </div>

          {/* Risk Card */}
          <div style={cardStyle}>
            <h3 style={headerStyle}><AlertOctagon size={20} color="#ef4444"/> Risk Radar</h3>
            <p style={subHeaderStyle}>Locations with high damage reports</p>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                    <tr>
                        <th style={tableHeaderStyle}>Location</th>
                        <th style={tableHeaderStyle}>Risk Level</th>
                        <th style={{...tableHeaderStyle, textAlign:'right'}}>Est. Loss</th>
                    </tr>
                </thead>
                <tbody>
                    {data.damageStats.slice(0,4).map((d, idx) => (
                        <tr key={idx}>
                            <td style={cellStyle}>{d.site}</td>
                            <td style={cellStyle}>
                                <div style={{display:'flex', alignItems:'center', gap:8}}>
                                    <div style={{width:60, height:4, background:'#334155', borderRadius:2}}>
                                        <div style={{width:`${d.probability}%`, height:'100%', background: d.probability > 20 ? '#ef4444' : '#f59e0b', borderRadius:2}}></div>
                                    </div>
                                    <span style={{fontSize:11, color: d.probability > 20 ? '#ef4444' : '#f59e0b', fontWeight:600}}>{d.probability > 20 ? 'CRITICAL' : 'Med'}</span>
                                </div>
                            </td>
                            <td style={{...cellStyle, textAlign:'right', color:'#94a3b8'}}>{d.predictedLossNextMonth} units</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={actionFooterStyle}>
                <AlertTriangle size={14} color="#ef4444" style={{marginTop:2}}/>
                <span style={{fontSize:12, color:'#94a3b8'}}>
                    <strong style={{color:'#f1f5f9'}}>Alert:</strong> Immediate packaging audit required for Critical locations to prevent loss.
                </span>
            </div>
          </div>

          {/* Inventory Action Card */}
          <div style={cardStyle}>
            <h3 style={headerStyle}><Layers size={20} color="#8b5cf6"/> Immediate Actions</h3>
            <p style={subHeaderStyle}>Items requiring liquidation or restock</p>
            <div style={{display:'flex', flexDirection:'column', gap:12}}>
                {data.riskAnalysis.slice(0,4).map((r, idx) => (
                    <div key={idx} style={{padding:12, borderRadius:8, background: r.risk.includes('Dead') ? 'rgba(51, 65, 85, 0.3)' : 'rgba(239, 68, 68, 0.1)', borderLeft: `0px solid ${r.risk.includes('Dead') ? '#94a3b8' : '#ef4444'}`}}>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
                            <span style={{fontSize:13, fontWeight:600, color:'#f1f5f9'}}>{r.name}</span>
                            <span style={{fontSize:10, fontWeight:700, textTransform:'uppercase', color: r.risk.includes('Dead') ? '#94a3b8' : '#ef4444'}}>{r.risk}</span>
                        </div>
                        <div style={{fontSize:11, color:'#64748b'}}>
                            {r.risk.includes('Dead') ? 'Action: Liquidate / Discount' : 'Action: Restock Immediately'}
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