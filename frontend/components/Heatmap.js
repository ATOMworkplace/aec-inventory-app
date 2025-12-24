import React, { useState, useEffect } from 'react';
import { X, MapPin, DollarSign, Box, Activity, Tag } from 'lucide-react';

export default function Heatmap({ data }) {
  const [selected, setSelected] = useState(null);
  const [activeIndices, setActiveIndices] = useState(new Set());

  // Animation: Simulates "Server Processing" / Live Data Activity
  // Randomly picks cells to "glow" momentarily
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const interval = setInterval(() => {
      const count = Math.floor(Math.random() * 3) + 1; // Pick 1-3 items
      const newIndices = new Set();
      for(let i=0; i<count; i++) {
        newIndices.add(Math.floor(Math.random() * data.length));
      }
      setActiveIndices(newIndices);

      // Clear the glow after a short burst
      setTimeout(() => {
        setActiveIndices(new Set());
      }, 600); // 600ms glow duration
    }, 2000); // Trigger every 2 seconds

    return () => clearInterval(interval);
  }, [data]);

  if (!data || data.length === 0) {
    return <div style={{padding: 20, color: '#94a3b8', fontSize: '0.85rem'}}>No stock data available</div>;
  }

  const maxValue = Math.max(...data.map(item => item.value || 0));

  const getHexColor = (value) => {
    if (value === 0) return '#334155';
    const intensity = Math.min(value / maxValue, 1);
    // Base Blue/Slate -> Cyan/Bright Blue
    return `hsl(210, ${60 + intensity * 20}%, ${20 + intensity * 30}%)`; 
  };

  const ModalRow = ({ icon: Icon, label, value, color }) => (
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
      <div style={{display:'flex', alignItems:'center', gap:10, color:'#94a3b8'}}>
        <Icon size={16} />
        <span style={{fontSize:'0.85rem'}}>{label}</span>
      </div>
      <span style={{fontWeight:'600', color: color || 'white', fontSize:'0.95rem'}}>{value}</span>
    </div>
  );

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
        gap: '12px',
        padding: '10px 0'
      }}>
        {data.map((item, index) => {
          const baseColor = getHexColor(item.value);
          const isActive = activeIndices.has(index);
          
          return (
            <div
              key={index}
              onClick={() => setSelected(item)}
              style={{
                background: isActive ? '#38bdf8' : baseColor, // Flash bright cyan if active
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                height: '100px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',  
                position: 'relative',
                borderTop: isActive ? '1px solid white' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: isActive ? '0 0 25px #0ea5e9' : 'none',  
                zIndex: isActive ? 2 : 1,
                transform: isActive ? 'scale(1.05)' : 'scale(1)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.zIndex = 10;
                e.currentTarget.style.boxShadow = `0 0 20px ${baseColor}`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.zIndex = 1;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                fontSize:'1.1rem', 
                fontWeight:'700', 
                color: isActive ? '#0f172a' : 'white',  
                textShadow: isActive ? 'none' : '0 2px 4px rgba(0,0,0,0.5)'
              }}>
                {item.value}
              </div>
              <div style={{
                fontSize:'0.6rem', 
                color: isActive ? '#1e293b' : 'rgba(255,255,255,0.8)', 
                padding:'0 8px', 
                textAlign:'center', 
                overflow:'hidden', 
                textOverflow:'ellipsis', 
                whiteSpace:'nowrap', 
                maxWidth:'100%',
                fontWeight: '600'
              }}>
                {item.name}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div style={{
          position: 'fixed', top:0, left:0, width:'100%', height:'100%', 
          background:'rgba(0,0,0,0.8)', backdropFilter:'blur(5px)',
          display:'flex', justifyContent:'center', alignItems:'center', zIndex:9999
        }} onClick={() => setSelected(null)}>
          
          <div style={{
            width: '420px', maxWidth:'90%',
            background: '#0f172a', 
            borderRadius: '16px',
            border: '1px solid #334155',
            boxShadow: '0 0 50px rgba(56, 189, 248, 0.2)', 
            padding: '0', 
            position: 'relative',
            color: '#f8fafc',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            
            <div style={{padding:'24px', background:'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', borderBottom:'1px solid #334155'}}>
              <button onClick={() => setSelected(null)} style={{
                position:'absolute', top:16, right:16, 
                background:'#334155', border:'none', color:'white', 
                borderRadius:'50%', width:32, height:32, 
                display:'flex', alignItems:'center', justifyContent:'center', 
                cursor:'pointer', marginTop: 0
              }}>
                  <X size={16} />
              </button>
              
              <h3 style={{margin:'0 0 4px 0', color:'#38bdf8', fontSize:'1.1rem', paddingRight:'40px'}}>{selected.name}</h3>
              <div style={{display:'flex', gap:10, alignItems:'center'}}>
                <span style={{fontFamily:'monospace', color:'#94a3b8', fontSize:'0.8rem', background:'#1e293b', padding:'2px 6px', borderRadius:4, border:'1px solid #334155'}}>{selected.sku}</span>
                <span style={{fontSize:'0.75rem', color: selected.abc_class === 'A' ? '#fbbf24' : '#94a3b8', fontWeight:'bold'}}>Class {selected.abc_class}</span>
              </div>
            </div>

            <div style={{padding:'24px'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15, marginBottom:20}}>
                <div style={{background:'#1e293b', padding:15, borderRadius:8, border:'1px solid #334155', textAlign:'center'}}>
                  <div style={{fontSize:'0.75rem', color:'#94a3b8', marginBottom:4}}>Total Value</div>
                  <div style={{fontSize:'1.1rem', fontWeight:'bold', color:'#10b981'}}>₹{(selected.value * selected.cost).toLocaleString()}</div>
                </div>
                <div style={{background:'#1e293b', padding:15, borderRadius:8, border:'1px solid #334155', textAlign:'center'}}>
                  <div style={{fontSize:'0.75rem', color:'#94a3b8', marginBottom:4}}>Margin</div>
                  <div style={{fontSize:'1.1rem', fontWeight:'bold', color:'#3b82f6'}}>{Math.round(((selected.price - selected.cost)/selected.price)*100)}%</div>
                </div>
              </div>

              <ModalRow icon={Box} label="Global Stock Quantity" value={selected.value} />
              <ModalRow icon={MapPin} label="Active Locations" value={selected.siteCount} />
              <ModalRow icon={Tag} label="Unit Cost" value={`₹${selected.cost}`} />
              <ModalRow icon={DollarSign} label="Selling Price" value={`₹${selected.price}`} color="#10b981" />
              <ModalRow icon={Activity} label="Category" value={selected.category} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}