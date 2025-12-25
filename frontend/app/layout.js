import './globals.css';
import Nav from '@/components/Nav';

export const metadata = { title: 'AEC-INV', description: 'Server Inventory System' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          @keyframes blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }
        `}</style>
      </head>
      <body>
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '4px',
          background: 'rgba(16, 185, 129, 0.2)',
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)',
          zIndex: 50,
          animation: 'scan 8s linear infinite'
        }} />

        <div style={{padding: '40px 20px 0 20px', textAlign: 'center', borderBottom: '1px solid #1e293b', marginBottom: '40px'}}>
            <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:15, marginBottom:10}}>
                <div style={{display:'flex', gap:4}}>
                    <div style={{width:6, height:6, borderRadius:'50%', background:'#10b981', boxShadow:'0 0 5px #10b981', animation: 'blink 1s infinite'}}></div>
                    <div style={{width:6, height:6, borderRadius:'50%', background:'#10b981'}}></div>
                    <div style={{width:6, height:6, borderRadius:'50%', background:'#f59e0b'}}></div>
                </div>
                <h1 style={{margin:0, fontSize:'1.8rem', color:'#e2e8f0', letterSpacing:'4px', textShadow:'0 0 10px rgba(255,255,255,0.1)'}}>INVENTORY Management</h1>
                <div style={{display:'flex', gap:4}}>
                    <div style={{width:6, height:6, borderRadius:'50%', background:'#3b82f6'}}></div>
                    <div style={{width:6, height:6, borderRadius:'50%', background:'#10b981'}}></div>
                    <div style={{width:6, height:6, borderRadius:'50%', background:'#ef4444', animation: 'blink 1s infinite'}}></div>
                </div>
            </div>
            <div style={{display:'flex', justifyContent:'center', gap:30, color:'#475569', fontSize:'0.7rem', paddingBottom:20}}>
                <span>SYS.STATUS: <span style={{color:'#10b981'}}>ONLINE</span></span>
                <span>UPTIME: 99.9%</span>
                <span>NODE: KR-04</span>
            </div>
        </div>

        <Nav />
        
        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px 120px 20px', position: 'relative', zIndex: 10 }}>
          {children}
        </main>
      </body>
    </html>
  );
}