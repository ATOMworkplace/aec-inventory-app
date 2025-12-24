'use client';
import { useEffect, useState, useLayoutEffect } from 'react';
import api from '@/lib/api';
import { Skull, AlertTriangle, PieChart } from 'lucide-react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

export default function DeadStock() {
  const [data, setData] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/inv/items'), api.get('/inv/txn')]).then(([iRes, tRes]) => {
      const items = iRes.data;
      const txns = tRes.data;
      const now = new Date();

      const dead = items.map(item => {
        const lastTxn = txns
          .filter(t => t.item_id === item.id && t.type === 'OUT')
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        const lastDate = lastTxn ? new Date(lastTxn.date) : null;
        const daysInactive = lastDate ? Math.floor((now - lastDate) / (1000 * 60 * 60 * 24)) : 999;

        return {
          ...item,
          daysInactive,
          lastDate,
          value: item.stock * item.price
        };
      }).filter(i => i.stock > 0 && i.daysInactive > 90)
        .sort((a, b) => b.value - a.value);

      setData(dead);
    });
  }, []);

  useLayoutEffect(() => {
    if (data.length === 0) return;

    let rootBar = am5.Root.new("chartBar");
    rootBar.setThemes([am5themes_Animated.new(rootBar)]);

    let chartBar = rootBar.container.children.push(am5xy.XYChart.new(rootBar, {
      panX: false, panY: false, wheelX: "none", wheelY: "none",
      layout: rootBar.verticalLayout
    }));

    let yRenderer = am5xy.AxisRendererY.new(rootBar, {
      cellStartLocation: 0.1, cellEndLocation: 0.9, minGridDistance: 20
    });
    yRenderer.labels.template.setAll({ fill: am5.color(0x94a3b8), fontSize: 10, fontFamily: "monospace" });

    let yAxis = chartBar.yAxes.push(am5xy.CategoryAxis.new(rootBar, {
      categoryField: "name", renderer: yRenderer
    }));

    let xRenderer = am5xy.AxisRendererX.new(rootBar, { minGridDistance: 40 });
    xRenderer.labels.template.setAll({ fill: am5.color(0x64748b), fontSize: 10, fontFamily: "monospace" });
    
    let xAxis = chartBar.xAxes.push(am5xy.ValueAxis.new(rootBar, {
      renderer: xRenderer
    }));

    let seriesBar = chartBar.series.push(am5xy.ColumnSeries.new(rootBar, {
      name: "Price", xAxis: xAxis, yAxis: yAxis, valueXField: "price", categoryYField: "name",
      sequencedInterpolation: true,
      tooltip: am5.Tooltip.new(rootBar, { labelText: "[bold]{name}[/]\nPrice: ₹{price}" })
    }));

    seriesBar.columns.template.setAll({
      height: am5.percent(70), cornerRadiusBR: 4, cornerRadiusTR: 4, strokeOpacity: 0
    });

    seriesBar.columns.template.adapters.add("fill", (fill, target) => {
      return chartBar.get("colors").getIndex(seriesBar.columns.indexOf(target));
    });

    yAxis.data.setAll(data.slice(0, 8));
    seriesBar.data.setAll(data.slice(0, 8));
    seriesBar.appear(1000);
    chartBar.appear(1000, 100);


    let rootPie = am5.Root.new("chartPie");
    rootPie.setThemes([am5themes_Animated.new(rootPie)]);

    let chartPie = rootPie.container.children.push(am5percent.PieChart.new(rootPie, {
      layout: rootPie.verticalLayout, 
      radius: am5.percent(80),
      innerRadius: am5.percent(40)
    }));

    let seriesPie = chartPie.series.push(am5percent.PieSeries.new(rootPie, {
      valueField: "stock", 
      categoryField: "name", 
      alignLabels: true 
    }));

    seriesPie.labels.template.setAll({ 
      fill: am5.color(0x94a3b8), 
      fontSize: 10,
      text: "{category}",
      maxWidth: 100,
      oversizedBehavior: "wrap"
    });

    seriesPie.ticks.template.setAll({ 
      stroke: am5.color(0x334155),
      strokeOpacity: 0.5,
      visible: true 
    });

    seriesPie.slices.template.setAll({ 
      stroke: am5.color(0x0f172a), 
      strokeWidth: 2,
      cornerRadius: 4
    });
    
    seriesPie.data.setAll(data.slice(0, 10));
    seriesPie.appear(1000, 100);

    return () => { rootBar.dispose(); rootPie.dispose(); };
  }, [data]);

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
        <h1><Skull color="#ef4444"/> DEAD_STOCK_ANALYSIS</h1>
      </div>

      <div className="grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', marginBottom: 24}}>
        <div className="card" style={{height: 320, display:'flex', flexDirection:'column'}}>
          <h3 style={{fontSize:'0.9rem', color:'#94a3b8', margin:'0 0 10px 0', display:'flex', alignItems:'center', gap:8}}>
            <AlertTriangle size={14}/> UNIT_PRICE_OVERVIEW
          </h3>
          <div id="chartBar" style={{width:'100%', flex:1}}></div>
        </div>
        <div className="card" style={{height: 320, display:'flex', flexDirection:'column'}}>
          <h3 style={{fontSize:'0.9rem', color:'#94a3b8', margin:'0 0 10px 0', display:'flex', alignItems:'center', gap:8}}>
            <PieChart size={14}/> STOCK_QTY_DISTRIBUTION
          </h3>
          <div id="chartPie" style={{width:'100%', flex:1}}></div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <p className="label">TOTAL_FROZEN_CAPITAL</p>
          <h2 className="text-red" style={{fontSize:'2rem', margin:'10px 0'}}>₹{data.reduce((a,b)=>a+b.value, 0).toLocaleString()}</h2>
        </div>
        <div className="card">
          <p className="label">STAGNANT_SKUS</p>
          <h2 style={{fontSize:'2rem', margin:'10px 0'}}>{data.length}</h2>
        </div>
      </div>

      <div className="card" style={{overflowX:'auto'}}>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>ITEM_NAME</th>
              <th>STOCK_QTY</th>
              <th>UNIT_COST</th>
              <th>FROZEN_VAL</th>
              <th>DORMANT_FOR</th>
            </tr>
          </thead>
          <tbody>
            {data.map(i => (
              <tr key={i.id} style={{borderBottom:'1px solid #334155'}}>
                <td style={{fontFamily:'monospace', color:'#3b82f6'}}>{i.sku}</td>
                <td style={{fontWeight:'500'}}>{i.name}</td>
                <td style={{fontWeight:'bold'}}>{i.stock}</td>
                <td style={{fontFamily:'monospace', color:'#64748b'}}>₹{i.price}</td>
                <td style={{color:'#ef4444', fontWeight:'bold', fontFamily:'monospace'}}>₹{i.value.toLocaleString()}</td>
                <td>
                  <span style={{
                    background: i.daysInactive === 999 ? '#334155' : '#ef444420',
                    color: i.daysInactive === 999 ? '#94a3b8' : '#ef4444',
                    padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight:'bold'
                  }}>
                    {i.daysInactive === 999 ? 'NEVER_SOLD' : `${i.daysInactive} DAYS`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <div style={{padding:20, textAlign:'center', color:'#64748b'}}>NO_DEAD_STOCK_DETECTED</div>}
      </div>
    </div>
  );
}