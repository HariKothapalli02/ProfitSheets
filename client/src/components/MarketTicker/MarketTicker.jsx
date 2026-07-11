import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MARKET_DATA = [
  { label: 'NIFTY 50', value: 24850.35, change: 0.82 },
  { label: 'SENSEX', value: 81550.20, change: 1.12 },
  { label: 'BANK NIFTY', value: 52340.75, change: -0.34 },
  { label: 'GOLD', value: 74250, change: 0.45, unit: '₹/10g' },
  { label: 'SILVER', value: 92500, change: 1.20, unit: '₹/kg' },
  { label: 'USD/INR', value: 83.42, change: -0.08, unit: '₹' },
  { label: 'BITCOIN', value: 67850, change: 2.34, unit: '$' },
  { label: 'CRUDE OIL', value: 6450, change: -1.05, unit: '₹/bbl' },
];

function TickerItem({ item }) {
  const isUp = item.change >= 0;
  return (
    <div className="ticker-item">
      <span className="ticker-label">{item.label}</span>
      <span className="ticker-value">{item.unit || '₹'}{item.value.toLocaleString('en-IN')}</span>
      <span className={`ticker-change ${isUp ? 'up' : 'down'}`}>
        {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {Math.abs(item.change)}%
      </span>
    </div>
  );
}

export default function MarketTicker() {
  const [data, setData] = useState(MARKET_DATA);
  const tickerRef = useRef(null);

  // Simulate slight price fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(item => {
        const fluctuation = (Math.random() - 0.5) * 0.15;
        const newChange = parseFloat((item.change + fluctuation).toFixed(2));
        return { ...item, change: newChange };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ticker-wrap" role="marquee" aria-label="Live market data">
      <div className="ticker-label-badge"><span className="live-dot">●</span> LIVE MARKETS</div>
      <div className="ticker-scroll">
        <div ref={tickerRef} className="ticker-content">
          {[...data, ...data].map((item, i) => (
            <TickerItem key={i} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
