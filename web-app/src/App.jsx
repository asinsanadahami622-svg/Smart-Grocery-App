import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const trendData = [
  { week: 'Wk 1', wasteRate: 40 }, { week: 'Wk 2', wasteRate: 35 },
  { week: 'Wk 3', wasteRate: 30 }, { week: 'Wk 4', wasteRate: 18 },
  { week: 'Wk 5', wasteRate: 22 }, { week: 'Wk 6', wasteRate: 12 },
  { week: 'Wk 7', wasteRate: 5 },
];

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: "Hello! I am your NutriAI Chef. Ask me for recipes based on your pantry!" }
  ]);
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    Papa.parse('/Cleaned_NutriAI_Data.csv', {
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => {
        const formattedData = results.data.map((item, index) => ({
          id: index,
          title: item['Title'] || 'Item',
          category: item['Sub Category'] || 'General',
          expDate: item['Expiration_Date'] || 'N/A'
        }));
        setInventory(formattedData);
      }
    });
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    const userMessage = userInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setUserInput('');

    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMessage, inventory: inventory.map(i => i.title).join(', ') })
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: "Service error: Check your API key in Netlify!" }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#06140f] text-slate-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-emerald-400">NutriAI Pantry Radar</h1>
      
      {/* Chart Section */}
      <div className="h-64 mb-8 bg-[#040f0b] p-4 rounded-xl border border-emerald-950">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#103020" />
            <XAxis dataKey="week" stroke="#555" />
            <YAxis stroke="#555" />
            <Tooltip contentStyle={{ backgroundColor: '#000' }} />
            <Area type="monotone" dataKey="wasteRate" stroke="#00ff87" fill="#00ff87" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Table */}
      <table className="w-full text-left mb-8 border-collapse">
        <thead><tr className="border-b border-emerald-900"><th>Item</th><th>Category</th><th>Expires</th></tr></thead>
        <tbody>
          {inventory.slice(0, 5).map(item => (
            <tr key={item.id} className="border-b border-emerald-950">
              <td className="py-2">{item.title}</td><td>{item.category}</td><td>{item.expDate}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Chat Section */}
      <section className="bg-[#040f0b] p-6 rounded-xl border border-emerald-950">
        <div className="h-40 overflow-y-auto mb-4 space-y-2">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`p-2 rounded ${msg.sender === 'user' ? 'bg-emerald-900 ml-auto' : 'bg-emerald-950'} max-w-sm`}>
              {msg.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input className="flex-1 bg-black p-2 rounded border border-emerald-900" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Ask about ingredients..." />
          <button className="bg-[#00ff87] text-black px-4 py-2 rounded font-bold">Send</button>
        </form>
      </section>
    </div>
  );
}