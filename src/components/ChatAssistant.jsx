import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader } from 'lucide-react';
import phcData from '../data/phcData';
import { generateMedicineStock, medicineList } from '../data/medicineData';
import { getStaffSummary } from '../data/staffData';
import { generateAlerts } from '../data/alertsData';

// Simple AI response engine using data context
function generateResponse(query) {
  const q = query.toLowerCase();

  // Get data context
  const totalPHCs = phcData.length;
  const criticalPHCs = phcData.filter(p => p.riskLevel === 'critical');
  const warningPHCs = phcData.filter(p => p.riskLevel === 'warning');
  const healthyPHCs = phcData.filter(p => p.riskLevel === 'healthy');
  const alerts = generateAlerts();
  const activeAlerts = alerts.filter(a => !a.isResolved);

  // Critical PHCs query
  if (q.includes('critical') && (q.includes('phc') || q.includes('health') || q.includes('centre') || q.includes('center') || q.includes('how many'))) {
    const names = criticalPHCs.map(p => `• **${p.name}** — ${p.district}, ${p.state}`).join('\n');
    return `🔴 There are **${criticalPHCs.length} Critical PHCs** out of ${totalPHCs} total:\n\n${names}\n\nThese PHCs need immediate attention for medicine restocking and resource allocation. I recommend checking the **Redistribution** page for AI-generated transfer recommendations.`;
  }

  // Medicine stock queries
  if (q.includes('medicine') || q.includes('stock') || q.includes('drug') || q.includes('paracetamol') || q.includes('amoxicillin')) {
    let targetMed = medicineList.find(m => q.includes(m.name.toLowerCase().split(' ')[0].toLowerCase()));

    if (targetMed) {
      let lowCount = 0, critCount = 0;
      phcData.forEach(phc => {
        const stock = generateMedicineStock(phc.id, phc.riskLevel);
        const med = stock.find(s => s.id === targetMed.id);
        if (med && med.status === 'low') lowCount++;
        if (med && med.status === 'critical') critCount++;
      });
      return `💊 **${targetMed.name}** Status Summary:\n\n• Category: ${targetMed.category}\n• Unit: ${targetMed.unit}\n• Reorder Level: ${targetMed.reorderLevel}\n• Critical Level: ${targetMed.criticalLevel}\n• Price/Unit: ₹${targetMed.pricePerUnit}\n\n📊 Across ${totalPHCs} PHCs:\n• **${critCount}** PHCs at Critical stock\n• **${lowCount}** PHCs at Low stock\n• **${totalPHCs - critCount - lowCount}** PHCs at Adequate stock\n\n${critCount > 0 ? '⚠️ Redistribution is recommended for PHCs with critical stock.' : '✅ Stock levels are generally healthy.'}`;
    }

    let totalCritical = 0, totalLow = 0;
    phcData.forEach(phc => {
      const stock = generateMedicineStock(phc.id, phc.riskLevel);
      totalCritical += stock.filter(m => m.status === 'critical').length;
      totalLow += stock.filter(m => m.status === 'low').length;
    });
    return `💊 **Medicine Stock Overview**:\n\n• Total medicines tracked: ${medicineList.length} across ${totalPHCs} PHCs\n• 🔴 **${totalCritical}** critical stock entries across all PHCs\n• 🟡 **${totalLow}** low stock entries\n• Categories: Analgesic, Antibiotic, Antidiabetic, Antihypertensive, and more\n\nYou can ask me about specific medicines like "Tell me about Paracetamol stock" or check the **Medicine Stock** page for detailed inventory.`;
  }

  // Bed availability
  if (q.includes('bed') || q.includes('occupancy') || q.includes('admission')) {
    const highOccupancy = phcData.filter(p => (p.bedsOccupied / p.beds) > 0.8);
    const avgOccupancy = Math.round(phcData.reduce((s, p) => s + (p.bedsOccupied / p.beds) * 100, 0) / totalPHCs);
    const totalBeds = phcData.reduce((s, p) => s + p.beds, 0);
    const occupiedBeds = phcData.reduce((s, p) => s + p.bedsOccupied, 0);

    return `🛏️ **Bed Availability Summary**:\n\n• Total Beds: **${totalBeds}** across ${totalPHCs} PHCs\n• Currently Occupied: **${occupiedBeds}** (${avgOccupancy}% avg occupancy)\n• Available: **${totalBeds - occupiedBeds}** beds\n\n⚠️ **${highOccupancy.length} PHCs** have >80% occupancy:\n${highOccupancy.slice(0, 5).map(p => `• ${p.name}: ${p.bedsOccupied}/${p.beds} beds (${Math.round((p.bedsOccupied/p.beds)*100)}%)`).join('\n')}\n\nConsider patient diversion for PHCs at critical capacity.`;
  }

  // Staff query
  if (q.includes('staff') || q.includes('doctor') || q.includes('nurse') || q.includes('vacancy') || q.includes('personnel')) {
    const staffStats = phcData.map(phc => {
      const summary = getStaffSummary(phc.id, phc.riskLevel);
      return { phc, ...summary };
    });
    const totalSanctioned = staffStats.reduce((s, st) => s + st.totalSanctioned, 0);
    const totalAvailable = staffStats.reduce((s, st) => s + st.totalAvailable, 0);
    const totalVacant = staffStats.reduce((s, st) => s + st.totalVacant, 0);
    const avgFillRate = (staffStats.reduce((s, st) => s + parseFloat(st.fillRate), 0) / totalPHCs).toFixed(1);

    return `👥 **Staff Overview**:\n\n• Total Sanctioned Positions: **${totalSanctioned}**\n• Currently Available: **${totalAvailable}**\n• Total Vacancies: **${totalVacant}**\n• Average Fill Rate: **${avgFillRate}%**\n\nRoles tracked: Medical Officers, Staff Nurses, Pharmacists, Lab Technicians, ANMs, Health Workers, Drivers, and Support Staff.\n\n${totalVacant > 50 ? '⚠️ High vacancy count detected. Staff recruitment should be prioritized for critical PHCs.' : '✅ Overall staffing levels are reasonable.'}`;
  }

  // Alert queries
  if (q.includes('alert') || q.includes('notification') || q.includes('warning')) {
    const critAlerts = activeAlerts.filter(a => a.severity === 'critical').length;
    const warnAlerts = activeAlerts.filter(a => a.severity === 'warning').length;
    const infoAlerts = activeAlerts.filter(a => a.severity === 'info').length;
    return `🔔 **Active Alerts Summary**:\n\n• Total Active: **${activeAlerts.length}**\n• 🔴 Critical: **${critAlerts}**\n• 🟡 Warning: **${warnAlerts}**\n• 🔵 Info: **${infoAlerts}**\n\nMost recent alerts:\n${activeAlerts.slice(0, 3).map(a => `• [${a.severity.toUpperCase()}] ${a.message}`).join('\n')}\n\nVisit the **Alerts** page for full details and to manage notifications.`;
  }

  // State-wise queries
  const states = ['maharashtra', 'karnataka', 'tamil nadu', 'rajasthan', 'uttar pradesh', 'gujarat', 'madhya pradesh', 'kerala', 'west bengal', 'odisha'];
  const matchedState = states.find(s => q.includes(s));
  if (matchedState || q.includes('state')) {
    if (matchedState) {
      const statePHCs = phcData.filter(p => p.state.toLowerCase() === matchedState);
      const stCritical = statePHCs.filter(p => p.riskLevel === 'critical').length;
      const stWarning = statePHCs.filter(p => p.riskLevel === 'warning').length;
      return `📍 **${statePHCs[0]?.state || matchedState}** PHC Summary:\n\n• Total PHCs: **${statePHCs.length}**\n• 🔴 Critical: **${stCritical}**\n• 🟡 Warning: **${stWarning}**\n• 🟢 Healthy: **${statePHCs.length - stCritical - stWarning}**\n\nPHCs:\n${statePHCs.map(p => `• **${p.name}** (${p.district}) — ${p.riskLevel}`).join('\n')}`;
    }
    const stateGroups = {};
    phcData.forEach(p => { if (!stateGroups[p.state]) stateGroups[p.state] = []; stateGroups[p.state].push(p); });
    return `📊 **State-wise PHC Distribution**:\n\n${Object.entries(stateGroups).map(([state, phcs]) =>
      `• **${state}**: ${phcs.length} PHCs (${phcs.filter(p=>p.riskLevel==='critical').length} critical)`
    ).join('\n')}\n\nAsk me about a specific state for detailed information!`;
  }

  // Prediction queries
  if (q.includes('predict') || q.includes('forecast') || q.includes('future') || q.includes('demand')) {
    return `🧠 **AI Prediction Summary**:\n\nOur ML model analyzes historical consumption patterns, seasonal trends, and population data to forecast:\n\n• **Medicine Demand**: 30-day forward projections for each medicine at every PHC\n• **Stock-out Risk**: Identifies medicines likely to run out within 14 days\n• **Patient Footfall**: Predicts patient volume based on seasonal patterns\n• **Model Accuracy**: ~94% based on 90-day validation\n\nVisit the **Predictions & Analytics** page for interactive charts and detailed forecasts.`;
  }

  // Redistribution queries
  if (q.includes('redistrib') || q.includes('transfer') || q.includes('share') || q.includes('surplus')) {
    return `🔄 **AI Redistribution Engine**:\n\nThe system automatically identifies:\n• PHCs with **surplus** medicine stock\n• PHCs with **critical shortages**\n• **Optimal transfer routes** based on distance and urgency\n\nRecommendations include:\n• Source and destination PHCs\n• Transfer quantities\n• Distance & estimated transit time\n• Cost savings\n• AI confidence score\n\nVisit the **Redistribution** page to review and approve pending transfers.`;
  }

  // Help / general
  if (q.includes('help') || q.includes('what can') || q.includes('how to') || q.includes('feature')) {
    return `👋 **Welcome to AarogyaSetu AI Assistant!**\n\nI can help you with:\n\n📊 **Dashboard** — "Show me the overall status"\n💊 **Medicine Stock** — "What's the Paracetamol stock?"\n🛏️ **Bed Availability** — "How many beds are available?"\n👥 **Staff** — "Show staff vacancies"\n🔔 **Alerts** — "Any critical alerts?"\n🧠 **Predictions** — "Predict medicine demand"\n🔄 **Redistribution** — "Suggest medicine transfers"\n📍 **State Info** — "Show Maharashtra PHCs"\n\nJust ask me anything about healthcare resources!`;
  }

  // Default overview
  return `📊 **AarogyaSetu AI — Quick Overview**:\n\n• **${totalPHCs}** PHCs monitored across 10 states\n• 🟢 ${healthyPHCs.length} Healthy | 🟡 ${warningPHCs.length} Warning | 🔴 ${criticalPHCs.length} Critical\n• **${activeAlerts.length}** active alerts requiring attention\n\nI can help you explore PHC data, medicine stocks, staff availability, predictions, and more. Try asking:\n• "Which PHCs are critical?"\n• "Show medicine stock status"\n• "How many beds are available?"\n• "Any alerts for Maharashtra?"`;
}

function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: '🏥 Namaste! I\'m your **AarogyaSetu AI Assistant**. I can help you explore healthcare data, check medicine stocks, view predictions, and answer questions about PHC resources across India.\n\nHow can I help you today?',
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestions = [
    'Show critical PHCs',
    'Medicine stock overview',
    'Bed availability',
    'Staff vacancies',
    'Active alerts',
    'Show predictions',
  ];

  const handleSend = (text = input) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const response = generateResponse(text);
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: response,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Simple markdown-like rendering
  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      let processed = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      return <div key={i} dangerouslySetInnerHTML={{ __html: processed }} style={{ minHeight: line === '' ? 8 : undefined }} />;
    });
  };

  return (
    <>
      {/* Chat Bubble */}
      {!isOpen && (
        <button className="chat-bubble" onClick={() => setIsOpen(true)} title="AarogyaSetu AI Assistant">
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="chat-panel">
          {/* Header */}
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>AarogyaSetu AI</h3>
                <p style={{ margin: 0 }}>Healthcare Intelligence Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
              width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white', transition: 'background 0.2s',
            }}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.type}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  {msg.type === 'bot' ? (
                    <Bot size={14} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
                  ) : (
                    <User size={14} style={{ opacity: 0.8, flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: 10, opacity: 0.6 }}>{msg.time}</span>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                  {renderText(msg.text)}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-message bot" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Analyzing data...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="chat-suggestions">
            {suggestions.map((s, i) => (
              <button key={i} className="suggestion-chip" onClick={() => handleSend(s)}>
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Ask about PHC resources..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isTyping}
            />
            <button className="chat-send-btn" onClick={() => handleSend()} disabled={isTyping || !input.trim()}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatAssistant;
