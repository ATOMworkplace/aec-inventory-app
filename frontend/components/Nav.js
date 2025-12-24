'use client';
import { 
  LayoutDashboard, Package, Layers, ArrowRightLeft, Skull, AlertOctagon, MapPin, BrainCircuit, Menu, X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Nav() {
  const path = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const items = [
    { href: '/', icon: <LayoutDashboard size={18}/>, label: 'DASHBOARD' },
    { href: '/items', icon: <Package size={18}/>, label: 'PRODUCTS' },
    { href: '/stock', icon: <Layers size={18}/>, label: 'INVENTORY' },
    { href: '/movements', icon: <ArrowRightLeft size={18}/>, label: 'TRANSFERS' },
    { href: '/sites', icon: <MapPin size={18}/>, label: 'WAREHOUSE' },
    { href: '/deadstock', icon: <Skull size={18}/>, label: 'DEADSTOCK' },
    { href: '/damage', icon: <AlertOctagon size={18}/>, label: 'DAMAGE' },
    { href: '/analysis', icon: <BrainCircuit size={18}/>, label: 'ANALYSIS' },
  ];

  return (
    <div style={{position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 100}}>
      <div style={{
        display: 'flex', gap: 4, background: 'rgba(2, 6, 23, 0.9)', 
        padding: 6, borderRadius: 12, border: '1px solid #334155',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)'
      }}>
        {items.map(i => {
            const active = path === i.href;
            return (
                <Link key={i.href} href={i.href} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    width: 50, height: 50, borderRadius: 8,
                    background: active ? '#3b82f6' : 'transparent',
                    color: active ? 'white' : '#64748b',
                    textDecoration: 'none', transition: 'all 0.2s'
                }}>
                    {i.icon}
                    <span style={{fontSize: 9, marginTop: 2, fontWeight: 'bold'}}>{i.label}</span>
                </Link>
            )
        })}
      </div>
    </div>
  );
}