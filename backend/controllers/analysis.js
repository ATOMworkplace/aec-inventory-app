const db = require('../config/db');

exports.getInsights = async (req, res) => {
    try {
        const [items] = await db.query('SELECT i.id, i.name, i.sku, i.cost, i.price, COALESCE(SUM(s.qty), 0) as stock FROM items i LEFT JOIN stock s ON i.id = s.item_id GROUP BY i.id');
        const [txns] = await db.query("SELECT * FROM txns ORDER BY date ASC");
        const [sites] = await db.query('SELECT * FROM sites');

        const productStats = items.map(item => {
            const history = txns.filter(t => t.item_id === item.id && t.type === 'OUT');
            const totalSold = history.reduce((a, b) => a + b.qty, 0);
            const margin = item.price - item.cost;
            const totalProfit = totalSold * margin;
            
            const firstSale = history.length > 0 ? new Date(history[0].date) : new Date();
            const daysActive = Math.max(1, (new Date() - firstSale) / (1000 * 60 * 60 * 24));
            const dailyVelocity = totalSold / daysActive;

            let classification = 'Standard';
            if (margin > 500 && dailyVelocity > 0.5) classification = 'Star (High Profit/High Vol)';
            else if (margin < 500 && dailyVelocity > 1.0) classification = 'Cash Cow (Vol Volume)';
            else if (margin > 500 && dailyVelocity < 0.1) classification = 'Problem Child (High Margin/Low Vol)';
            else classification = 'Dog (Low Margin/Low Vol)';

            const predictedMonthlySales = dailyVelocity * 30;
            const predictedMonthlyProfit = predictedMonthlySales * margin;

            return {
                ...item,
                totalSold,
                dailyVelocity,
                margin,
                totalProfit,
                classification,
                predictedMonthlySales,
                predictedMonthlyProfit
            };
        });

        const forecast = productStats.sort((a, b) => b.predictedMonthlyProfit - a.predictedMonthlyProfit).slice(0, 5);

        const warehouseStats = sites.filter(s => s.type === 'warehouse').map(site => {
            const siteTxns = txns.filter(t => t.from_site === site.id || t.to_site === site.id);
            const outTxns = siteTxns.filter(t => t.from_site === site.id && t.type === 'OUT');
            const inTxns = siteTxns.filter(t => t.to_site === site.id && t.type === 'IN');
            
            const totalRevenue = outTxns.reduce((sum, t) => {
                const item = items.find(i => i.id === t.item_id);
                return sum + (t.qty * (item ? item.price : 0));
            }, 0);

            const totalTransportCost = (inTxns.length + outTxns.length) * (site.transport_cost || 500);
            const efficiencyScore = totalRevenue - totalTransportCost;

            const currentOccupied = items.reduce((acc, item) => acc, 0); 
            
            const dailyInflow = inTxns.reduce((a,b)=>a+b.qty,0) / Math.max(1, (new Date() - new Date(inTxns[0]?.date || new Date())) / (86400000));
            const dailyOutflow = outTxns.reduce((a,b)=>a+b.qty,0) / Math.max(1, (new Date() - new Date(outTxns[0]?.date || new Date())) / (86400000));
            const netDailyChange = dailyInflow - dailyOutflow;

            let daysToFull = 999;
            if (netDailyChange > 0) {
                const remainingSpace = (site.capacity || 10000) - currentOccupied; // Simplify assumption on backend for occupied
                daysToFull = remainingSpace / netDailyChange;
            }

            return {
                name: site.name,
                efficiencyScore,
                daysToFull: daysToFull > 999 ? 999 : Math.round(daysToFull),
                dailyVolume: dailyInflow + dailyOutflow
            };
        }).sort((a, b) => b.efficiencyScore - a.efficiencyScore);

        const damageStats = sites.map(site => {
            const siteTxns = txns.filter(t => t.from_site === site.id);
            const damageTxns = siteTxns.filter(t => t.type === 'DAMAGE');
            const totalMoved = siteTxns.length;
            
            if (totalMoved === 0) return null;

            const damageCount = damageTxns.length;
            const damageQty = damageTxns.reduce((a,b)=>a+b.qty,0);
            const probability = (damageCount / totalMoved) * 100;
            
            const predictedLossNextMonth = (damageQty / Math.max(1, totalMoved)) * 30; 

            return {
                site: site.name,
                probability,
                damageQty,
                predictedLossNextMonth
            };
        }).filter(s => s && s.damageQty > 0).sort((a, b) => b.probability - a.probability).slice(0, 5);

        const monthlyProfit = {};
        txns.filter(t => t.type === 'OUT').forEach(t => {
            const date = new Date(t.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const item = items.find(i => i.id === t.item_id);
            if (item) {
                const profit = t.qty * (item.price - item.cost);
                monthlyProfit[key] = (monthlyProfit[key] || 0) + profit;
            }
        });
        
        const profitTrend = Object.entries(monthlyProfit)
            .map(([month, profit]) => ({ month, profit }))
            .sort((a, b) => a.month.localeCompare(b.month));

        const riskAnalysis = items.map(i => {
            const velocity = productStats.find(p => p.id === i.id).dailyVelocity;
            const stockoutRisk = (velocity > 0 && i.stock < (velocity * 7)) ? 'High Stockout Risk' : 'Safe';
            const deadStockRisk = (velocity === 0 && i.stock > 0) ? 'Dead Asset' : 'Active';
            
            return {
                name: i.name,
                stock: i.stock,
                velocity: velocity.toFixed(2),
                risk: stockoutRisk === 'Safe' ? deadStockRisk : stockoutRisk
            };
        }).filter(r => r.risk !== 'Active' && r.risk !== 'Safe').slice(0, 5);

        res.json({ forecast, warehouseStats, damageStats, profitTrend, riskAnalysis });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Analysis Failed' });
    }
};