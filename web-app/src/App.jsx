import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Trend mockup data for the pantry health graph
const trendData = [
  { week: 'Wk 1', wasteRate: 40 },
  { week: 'Wk 2', wasteRate: 35 },
  { week: 'Wk 3', wasteRate: 30 },
  { week: 'Wk 4', wasteRate: 18 },
  { week: 'Wk 5', wasteRate: 22 },
  { week: 'Wk 6', wasteRate: 12 },
  { week: 'Wk 7', wasteRate: 5 },
];

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState('All');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: "Hello! I am your NutriAI Zero-Waste Chef. Click the generator button above to parse your expiring ingredients into a recipe, or type any culinary question here!" }
  ]);
  const [userInput, setUserInput] = useState('');

  // 1. Fetch and Parse the Cleaned NutriAI CSV Data on Mount
  useEffect(() => {
    Papa.parse('/Cleaned_NutriAI_Data.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const formattedData = results.data.map((item, index) => {
          // Calculate dynamic statuses based on the current pinned system date (July 8, 2026)
          let derivedStatus = 'Safe';
          if (item.Expiration_Date) {
            const expTime = new Date(item.Expiration_Date).getTime();
            const nowTime = new Date('2026-07-08').getTime();
            const daysDiff = (expTime - nowTime) / (1000 * 60 * 60 * 24);

            if (daysDiff < 0) derivedStatus = 'Expired';
            else if (daysDiff <= 5) derivedStatus = 'Expiring Soon';
          }

          return {
            id: index,
            title: item['Title'] || 'Costco Bulk Wholesale Item',
            category: item['Sub Category'] || 'Bakery & Desserts',
            purchaseDate: item['Purchase_Date'] || 'N/A',
            expDate: item['Expiration_Date'] || 'N/A',
            status: derivedStatus
          };
        });
        setInventory(formattedData);
      },
      error: (err) => {
        console.error("Error reading CSV database file:", err);
      }
    });
  }, []);

  // 2. Computed Metric Indicators
  const totalCount = inventory.length;
  const expiredCount = inventory.filter(i => i.status === 'Expired').length;
  const expiringCount = inventory.filter(i => i.status === 'Expiring Soon').length;
  const safeCount = inventory.filter(i => i.status === 'Safe').length;

  // 3. Filter Table Items via Navigation Tabs
  const displayInventory = inventory.filter(item => {
    if (filteredStatus === 'All') return true;
    return item.status === filteredStatus;
  });

  // Limit viewport items to just the first 10 matching entries for a cleaner UI
  const limitedInventory = displayInventory.slice(0, 10);

  // 4. Feature Action: Generate Zero-Waste Recipe & Smooth Scroll to Chat Window
  const generateRecipe = () => {
    const criticalItems = inventory
      .filter(i => i.status === 'Expiring Soon' || i.status === 'Expired')
      .slice(0, 2)
      .map(i => i.title);

    let recipeText = "";
    if (criticalItems.length > 0) {
      recipeText = `I see you have items like "${criticalItems.join(' and ')}" that need attention. Let's make a Gourmet Sweet Crumble Bowl! Chop your specialty cake items into a skillet base, flash-sear with light butter to caramelize the sugar profiles, and dress with a dollop of yogurt or a dust of cocoa powder. Serves 2, high energy, zero waste!`;
    } else {
      recipeText = "All inventory items are currently stable and safe! Let's make a celebratory French Madeleine Ice Cream Parfait using your imported sponge cakes. Toss crumbs lightly over vanilla bean gelato and serve.";
    }

    setChatMessages(prev => [
      ...prev,
      { sender: 'ai', text: recipeText }
    ]);

    // Focus Viewport Auto-Scroll Fix
    setTimeout(() => {
      document.getElementById('ai-chat-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 5. Feature Action: Chatbot Conversation Timeline Submit
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = userInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setUserInput('');

    // Simulated contextual AI responses 
    setTimeout(() => {
      let aiResponse = "Interesting modification request! I recommend scaling back baking cycles by 3 minutes to avoid over-caramelization of those specific pastry ingredients.";
      if (userMessage.toLowerCase().includes('veg') || userMessage.toLowerCase().includes('vegetarian')) {
        aiResponse = "Got it! To keep this dessert entirely vegetarian, verify that your base cake mixtures or toppings do not contain structural gelatin components. Substitute alternative binding proteins if necessary.";
      } else if (userMessage.toLowerCase().includes('replace') || userMessage.toLowerCase().includes('substitute')) {
        aiResponse = "If you run out of custom toppings, crushed French Madeleine cookies or roasted pecans from your pantry inventory serve as a perfect crunch replacement!";
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#06140f] text-slate-100 flex font-sans antialiased">
      
      {/* SIDEBAR NAVIGATION CANVASES */}
      <aside className="w-64 border-r border-emerald-950/40 bg-[#030b08] p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="h-4 w-4 bg-[#00ff87] rounded-full animate-pulse" />
            <h1 className="text-xl font-bold tracking-tight text-white">NutriAI <span className="text-[#00ff87] text-xs font-mono">BETA</span></h1>
          </div>
          
          <nav className="space-y-1">
            {['All', 'Safe', 'Expiring Soon', 'Expired'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilteredStatus(tab)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  filteredStatus === tab 
                    ? 'bg-emerald-950/60 text-[#00ff87] border-l-2 border-[#00ff87]' 
                    : 'text-slate-400 hover:bg-emerald-950/20 hover:text-slate-200'
                }`}
              >
                {tab} Grid
              </button>
            ))}
          </nav>
        </div>
        
        <div className="text-xs text-slate-500 border-t border-emerald-950/40 pt-4">
          Data Engine v4.1.0<br />
          System Active Status
        </div>
      </aside>

      {/* MAIN APPLICATION CENTRAL WINDOW */}
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-950/20 pb-5">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Pantry Intelligence Radar</h2>
            <p className="text-slate-400 text-sm">Real-time receipt parsing and predictive degradation parameters.</p>
          </div>
          <button 
            onClick={generateRecipe}
            className="bg-[#00ff87] text-black font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/10 hover:bg-[#00e176] transition-all cursor-pointer"
          >
            Generate AI Waste Recipe
          </button>
        </header>

        {/* METRIC BADGES MATRIX */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#040f0b] border border-emerald-950/40 p-4 rounded-xl">
            <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Monitored Items</span>
            <span className="text-3xl font-bold text-white block mt-1">{totalCount}</span>
          </div>
          <div className="bg-[#040f0b] border border-emerald-950/40 p-4 rounded-xl border-l-2 border-emerald-500">
            <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Stable Buffer (Safe)</span>
            <span className="text-3xl font-bold text-emerald-400 block mt-1">{safeCount}</span>
          </div>
          <div className="bg-[#040f0b] border border-emerald-950/40 p-4 rounded-xl border-l-2 border-amber-500">
            <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Critical Flag (Soon)</span>
            <span className="text-3xl font-bold text-amber-400 block mt-1">{expiringCount}</span>
          </div>
          <div className="bg-[#040f0b] border border-emerald-950/40 p-4 rounded-xl border-l-2 border-rose-500">
            <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Degraded (Expired)</span>
            <span className="text-3xl font-bold text-rose-400 block mt-1">{expiredCount}</span>
          </div>
        </section>

        {/* VISUAL TREND CHART */}
        <section className="bg-[#040f0b] border border-emerald-950/40 p-5 rounded-xl">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Financial Food Waste Optimization Path</h3>
            <p className="text-xs text-slate-400">Pantry degradation percentages mapped across previous 7 structural periods.</p>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff87" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00ff87" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#061912" />
                <XAxis dataKey="week" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#030b08', borderColor: '#062d1e', color: '#fff' }} />
                <Area type="monotone" dataKey="wasteRate" stroke="#00ff87" strokeWidth={2} fillOpacity={1} fill="url(#colorWaste)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* CORE GRID ARCHITECTURE TABLE (With Limited Snapshot Selection) */}
        <section className="bg-[#040f0b] border border-emerald-950/40 rounded-xl overflow-hidden">
          <div className="px-5 py-4 bg-[#030b08] border-b border-emerald-950/40 flex justify-between items-center">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Inventory Ledger Stream</h3>
            <span className="text-xs font-mono text-[#00ff87] bg-[#00ff87]/10 px-2 py-0.5 rounded border border-[#00ff87]/20">
              Showing top {limitedInventory.length} of {displayInventory.length} items
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-emerald-950/30 text-slate-400 font-medium bg-[#040f0b]">
                  <th className="p-4 bg-[#040f0b]">Item Title</th>
                  <th className="p-4 bg-[#040f0b]">Sub Category</th>
                  <th className="p-4 bg-[#040f0b]">Purchase Date</th>
                  <th className="p-4 bg-[#040f0b]">Exp. Date</th>
                  <th className="p-4 bg-[#040f0b] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/20">
                {limitedInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-emerald-950/10 transition-colors">
                    <td className="p-4 font-semibold text-white max-w-xs truncate">{item.title}</td>
                    <td className="p-4 text-slate-400 font-medium">{item.category}</td>
                    <td className="p-4 font-mono text-slate-400">{item.purchaseDate}</td>
                    <td className={`p-4 font-mono font-semibold ${
                      item.status === 'Expired' ? 'text-rose-400' : item.status === 'Expiring Soon' ? 'text-amber-400' : 'text-slate-400'
                    }`}>{item.expDate}</td>
                    <td className="p-4 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        item.status === 'Expired' ? 'bg-rose-950/50 text-rose-400 border border-rose-900/40' :
                        item.status === 'Expiring Soon' ? 'bg-amber-950/50 text-amber-400 border border-amber-900/40' :
                        'bg-emerald-950/50 text-emerald-400 border border-emerald-900/40'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* AI CHEF CONVERSATION TIMELINE INTERACTIVE INTERFACE */}
        <section id="ai-chat-section" className="bg-[#040f0b] border border-emerald-950/40 rounded-xl overflow-hidden flex flex-col h-80">
          <div className="p-4 bg-[#030b08] border-b border-emerald-950/40 flex items-center gap-2">
            <div className="h-2 w-2 bg-[#00ff87] rounded-full animate-ping" />
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Live Culinary AI Co-Pilot</h3>
          </div>

          {/* Messages Feed View */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-medium text-sm">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xl p-3 rounded-xl leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-[#062d1e] text-[#00ff87] border border-emerald-800/30' 
                    : 'bg-emerald-950/20 text-slate-300 border border-emerald-950/50'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* User Chat Trigger Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#030b08] border-t border-emerald-950/40 flex gap-2">
            <input 
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask your AI Chef a variation question (e.g., 'Make it vegetarian')..."
              className="flex-1 bg-[#06140f] border border-emerald-950/60 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00ff87] transition-all"
            />
            <button 
              type="submit"
              className="bg-emerald-950 text-[#00ff87] border border-emerald-800/40 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#062d1e] transition-all cursor-pointer"
            >
              Send
            </button>
          </form>
        </section>

      </main>
    </div>
  );
}