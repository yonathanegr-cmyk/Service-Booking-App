import { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, FileText, DollarSign, PieChart, Camera, AlertCircle, ChevronLeft, X, CheckCircle, Printer, Send, Download, Plus, Trash2, Upload, FileSpreadsheet } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type LineItem = {
  id: string;
  description: string;
  price: number;
};

type ScannedExpense = {
  vendor: string;
  amount: number;
  date: string;
  category: string;
} | null;

export function ProFinance() {
  const [showScanner, setShowScanner] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedExpense, setScannedExpense] = useState<ScannedExpense>(null);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [expenseSaved, setExpenseSaved] = useState(false);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: 'ביקור בית + אבחון תקלה', price: 250 }
  ]);
  const [isSendingQuote, setIsSendingQuote] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);

  const transactions = [
    { id: 1, description: 'הכנסה - דני כהן', amount: 450, type: 'income', date: '30/11/2024', category: 'service' },
    { id: 2, description: 'דלק - פז', amount: -250, type: 'expense', date: '29/11/2024', category: 'fuel' },
    { id: 3, description: 'חלקים - טמבור', amount: -120, type: 'expense', date: '28/11/2024', category: 'parts' },
    { id: 4, description: 'הכנסה - רונית שחר', amount: 350, type: 'income', date: '28/11/2024', category: 'service' },
    { id: 5, description: 'ציוד עבודה - הום סנטר', amount: -450, type: 'expense', date: '27/11/2024', category: 'equipment' },
  ];

  const chartData = [
    { name: '1/11', income: 400, expense: 240 },
    { name: '5/11', income: 300, expense: 139 },
    { name: '10/11', income: 900, expense: 980 },
    { name: '15/11', income: 278, expense: 390 },
    { name: '20/11', income: 1890, expense: 480 },
    { name: '25/11', income: 2390, expense: 380 },
    { name: '30/11', income: 3490, expense: 430 },
  ];

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Date.now().toString(), description: '', price: 0 }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: 'description' | 'price', value: string | number) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const vat = subtotal * 0.17;
  const total = subtotal + vat;

  const handleSendQuote = () => {
    setIsSendingQuote(true);
    setTimeout(() => {
      setIsSendingQuote(false);
      setQuoteSent(true);
      setTimeout(() => {
        setShowQuoteModal(false);
        setQuoteSent(false);
        setClientName('');
        setClientPhone('');
        setLineItems([{ id: '1', description: 'ביקור בית + אבחון תקלה', price: 250 }]);
      }, 1500);
    }, 1500);
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedExpense({
        vendor: 'טמבור - חומרי בניין',
        amount: 187.50,
        date: new Date().toLocaleDateString('he-IL'),
        category: 'parts'
      });
    }, 2000);
  };

  const handleSaveExpense = () => {
    setIsSavingExpense(true);
    setTimeout(() => {
      setIsSavingExpense(false);
      setExpenseSaved(true);
      setTimeout(() => {
        setShowScanner(false);
        setScannedExpense(null);
        setExpenseSaved(false);
      }, 1500);
    }, 1000);
  };

  const handleExportReport = (format: 'pdf' | 'excel') => {
    const reportData = {
      period: 'נובמבר 2024',
      income: 18200,
      expenses: 3450,
      netProfit: 12450,
      transactions: transactions
    };

    if (format === 'excel') {
      const csvContent = `דוח רווח והפסד - ${reportData.period}\n\nסיכום:\nהכנסות ברוטו,₪${reportData.income}\nהוצאות מוכרות,₪${reportData.expenses}\nרווח נקי,₪${reportData.netProfit}\n\nפירוט תנועות:\nתאריך,תיאור,סכום,קטגוריה\n${transactions.map(t => `${t.date},"${t.description}",${t.amount},${t.category}`).join('\n')}`;
      
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `דוח_רווח_והפסד_${reportData.period}.csv`;
      link.click();
    } else {
      const printContent = `
        <html dir="rtl">
        <head>
          <title>דוח רווח והפסד - ${reportData.period}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
            .summary { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .summary-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .income { color: #10b981; }
            .expense { color: #ef4444; }
            .net { font-size: 1.5em; font-weight: bold; color: #1f2937; border-top: 2px solid #ccc; padding-top: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; }
            th { background: #f9fafb; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>דוח רווח והפסד</h1>
          <p>תקופה: ${reportData.period}</p>
          <div class="summary">
            <div class="summary-row"><span>הכנסות ברוטו:</span><span class="income">₪${reportData.income.toLocaleString()}</span></div>
            <div class="summary-row"><span>הוצאות מוכרות:</span><span class="expense">-₪${reportData.expenses.toLocaleString()}</span></div>
            <div class="summary-row net"><span>רווח נקי:</span><span>₪${reportData.netProfit.toLocaleString()}</span></div>
          </div>
          <h2>פירוט תנועות</h2>
          <table>
            <tr><th>תאריך</th><th>תיאור</th><th>סכום</th><th>קטגוריה</th></tr>
            ${transactions.map(t => `<tr><td>${t.date}</td><td>${t.description}</td><td class="${t.type === 'income' ? 'income' : 'expense'}">₪${Math.abs(t.amount)}</td><td>${t.category}</td></tr>`).join('')}
          </table>
        </body>
        </html>
      `;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    }
    setShowReportModal(false);
  };

  return (
    <div className="space-y-6 pb-20" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">ניהול פיננסי</h2>
            <p className="text-gray-500 text-sm">מערכת ניהול ספרים והוצאות</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowQuoteModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
                <DollarSign className="w-4 h-4" />
                צור הצעת מחיר
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">רווח נקי (נטו בכיס)</p>
                        <h3 className="text-4xl font-bold tracking-tight">₪12,450</h3>
                        <div className="flex items-center gap-2 mt-2 text-green-400 text-sm font-medium bg-green-400/10 px-2 py-1 rounded-lg inline-block">
                            <TrendingUp className="w-3 h-3" />
                            <span>+18% מהחודש שעבר</span>
                        </div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl">
                        <Wallet className="w-6 h-6 text-white" />
                    </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-700/50">
                    <div>
                        <p className="text-gray-400 text-xs mb-1">הכנסות (ברוטו)</p>
                        <p className="font-bold text-lg">₪18,200</p>
                    </div>
                    <div className="relative group">
                        <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                            הוצאות מוכרות
                            <AlertCircle className="w-3 h-3 text-gray-500" />
                        </p>
                        <p className="font-bold text-lg text-red-400">-₪3,450</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs mb-1">מע"מ (צפי)</p>
                        <p className="font-bold text-lg text-yellow-400">-₪2,300</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <div 
                onClick={() => setShowScanner(true)}
                className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-all group h-[calc(50%-8px)]"
            >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-center">
                    <h4 className="font-bold text-blue-900 text-sm">סרוק הוצאה</h4>
                    <p className="text-xs text-blue-600/70 mt-1">זיהוי אוטומטי ב-OCR</p>
                </div>
            </div>

            <div 
                onClick={() => setShowReportModal(true)}
                className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-all group h-[calc(50%-8px)] shadow-sm"
            >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-center">
                    <h4 className="font-bold text-gray-900 text-sm">דוח רווח והפסד</h4>
                    <p className="text-xs text-gray-500 mt-1">ייצוא לרואה חשבון</p>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm min-w-0">
        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            תזרים מזומנים חודשי
        </h3>
        <div className="h-64 w-full min-w-0" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                    <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                        labelStyle={{color: '#374151', fontWeight: 'bold', marginBottom: '4px'}}
                    />
                    <Area type="monotone" dataKey="income" name="הכנסות" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" name="הוצאות" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">תנועות אחרונות</h3>
            <button className="text-blue-600 text-sm font-medium hover:underline">לכל התנועות</button>
        </div>
        <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                            tx.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                            {tx.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{tx.description}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{tx.date} • {
                                tx.category === 'service' ? 'שירות' : 
                                tx.category === 'fuel' ? 'דלק' : 
                                tx.category === 'equipment' ? 'ציוד' : 'חלקים'
                            }</p>
                        </div>
                    </div>
                    <div className="text-left">
                        <div className={`font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                            {tx.type === 'income' ? '+' : ''}₪{Math.abs(tx.amount)}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                            {tx.type === 'income' ? 'חשבונית מס קבלה' : 'הוצאה מוכרת'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {showScanner && (
          <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" onClick={() => { setShowScanner(false); setScannedExpense(null); }}>
              <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                  {!scannedExpense ? (
                    <>
                      <div className="relative bg-gray-900 h-80 flex items-center justify-center">
                          {isScanning ? (
                            <div className="text-center">
                              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                              <p className="text-white font-medium">מנתח את החשבונית...</p>
                            </div>
                          ) : (
                            <Camera className="w-16 h-16 text-white/20" />
                          )}
                          <div className="absolute inset-0 border-2 border-blue-500/50 m-8 rounded-xl animate-pulse">
                              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
                          </div>
                          {!isScanning && <p className="absolute bottom-8 text-white font-medium bg-black/50 px-4 py-1 rounded-full text-sm">כוון אל החשבונית</p>}
                          <button 
                            onClick={() => { setShowScanner(false); setScannedExpense(null); }}
                            className="absolute top-4 right-4 text-white p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors"
                          >
                              <X className="w-6 h-6" />
                          </button>
                      </div>
                      <div className="p-6 text-center space-y-4">
                          <div>
                            <h3 className="font-bold text-xl text-gray-900">סורק הוצאות חכם</h3>
                            <p className="text-gray-500 text-sm mt-1">המערכת תזהה אוטומטית את התאריך, הספק והסכום ותשייך לקטגוריה המתאימה.</p>
                          </div>
                          <button 
                            onClick={handleScan}
                            disabled={isScanning}
                            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
                          >
                              {isScanning ? 'סורק...' : 'צלם תמונה'}
                          </button>
                          <button className="text-sm text-gray-500 font-medium hover:text-gray-800 flex items-center gap-2 justify-center w-full">
                              <Upload className="w-4 h-4" />
                              או בחר מתוך הגלריה
                          </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">זוהתה הוצאה!</h3>
                          <p className="text-gray-500 text-sm">בדוק את הפרטים ואשר</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500 text-sm">ספק:</span>
                          <span className="font-bold text-gray-900">{scannedExpense.vendor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 text-sm">סכום:</span>
                          <span className="font-bold text-red-600">₪{scannedExpense.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 text-sm">תאריך:</span>
                          <span className="font-bold text-gray-900">{scannedExpense.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 text-sm">קטגוריה:</span>
                          <select className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-sm font-medium text-gray-900">
                            <option value="parts">חלקים</option>
                            <option value="fuel">דלק</option>
                            <option value="equipment">ציוד</option>
                            <option value="other">אחר</option>
                          </select>
                        </div>
                      </div>

                      {expenseSaved ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <span className="font-bold text-green-800">ההוצאה נשמרה בהצלחה!</span>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button 
                            onClick={() => setScannedExpense(null)}
                            className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                          >
                            סרוק שוב
                          </button>
                          <button 
                            onClick={handleSaveExpense}
                            disabled={isSavingExpense}
                            className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200 disabled:opacity-50"
                          >
                            {isSavingExpense ? 'שומר...' : 'שמור הוצאה'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
              </div>
          </div>
      )}

      {showQuoteModal && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" onClick={() => setShowQuoteModal(false)}>
              <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                      <h3 className="font-bold text-xl text-gray-900">יצירת הצעת מחיר</h3>
                      <button onClick={() => setShowQuoteModal(false)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1.5">שם הלקוח</label>
                              <input 
                                type="text" 
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                placeholder="ישראל ישראלי" 
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1.5">טלפון</label>
                              <input 
                                type="tel" 
                                value={clientPhone}
                                onChange={(e) => setClientPhone(e.target.value)}
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                placeholder="050-0000000" 
                                dir="ltr"
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1.5">פירוט העבודה</label>
                          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                              {lineItems.map((item, index) => (
                                <div key={item.id} className="flex gap-3 items-center">
                                  <input 
                                    type="text" 
                                    value={item.description}
                                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                    className="flex-1 p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                    placeholder="תיאור השירות (לדוגמה: החלפת ברז)" 
                                  />
                                  <div className="relative">
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">₪</span>
                                    <input 
                                      type="number" 
                                      value={item.price || ''}
                                      onChange={(e) => updateLineItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                      className="w-28 p-2.5 pr-8 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                      placeholder="מחיר" 
                                    />
                                  </div>
                                  <button 
                                    onClick={() => removeLineItem(item.id)}
                                    className={`text-red-400 hover:text-red-600 p-1 ${lineItems.length === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    disabled={lineItems.length === 1}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              <button 
                                onClick={addLineItem}
                                className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                              >
                                  <Plus className="w-4 h-4" />
                                  הוסף שורה
                              </button>
                          </div>
                      </div>

                      <div className="flex justify-end border-t border-gray-100 pt-4">
                          <div className="w-56 space-y-2">
                              <div className="flex justify-between text-sm text-gray-600">
                                  <span>סה"כ לפני מע"מ:</span>
                                  <span>₪{subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-600">
                                  <span>מע"מ (17%):</span>
                                  <span>₪{vat.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-200 pt-2">
                                  <span>סה"כ לתשלום:</span>
                                  <span>₪{total.toFixed(2)}</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                      <button className="text-gray-600 font-medium hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                          <Printer className="w-4 h-4" />
                          תצוגה מקדימה
                      </button>
                      {quoteSent ? (
                        <div className="bg-green-100 text-green-800 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          נשלח בהצלחה!
                        </div>
                      ) : (
                        <button 
                          onClick={handleSendQuote}
                          disabled={isSendingQuote || !clientName || !clientPhone || subtotal === 0}
                          className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSendingQuote ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              שולח...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              שלח ללקוח (WhatsApp)
                            </>
                          )}
                        </button>
                      )}
                  </div>
              </div>
          </div>
      )}

      {showReportModal && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" onClick={() => setShowReportModal(false)}>
              <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-xl text-gray-900">ייצוא דוח רווח והפסד</h3>
                      <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-bold text-gray-900 mb-3">תקופת הדוח</h4>
                        <select className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500">
                          <option>נובמבר 2024</option>
                          <option>אוקטובר 2024</option>
                          <option>רבעון 4 - 2024</option>
                          <option>שנת 2024</option>
                        </select>
                      </div>

                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <h4 className="font-bold text-blue-900 mb-2">סיכום התקופה</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">הכנסות ברוטו:</span>
                            <span className="font-bold text-green-600">₪18,200</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">הוצאות מוכרות:</span>
                            <span className="font-bold text-red-600">-₪3,450</span>
                          </div>
                          <div className="flex justify-between border-t border-blue-200 pt-2">
                            <span className="text-blue-900 font-bold">רווח נקי:</span>
                            <span className="font-bold text-blue-900">₪12,450</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => handleExportReport('pdf')}
                          className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all group"
                        >
                          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6 text-red-600" />
                          </div>
                          <span className="font-bold text-gray-900">PDF להדפסה</span>
                          <span className="text-xs text-gray-500">מוכן לרואה חשבון</span>
                        </button>
                        <button 
                          onClick={() => handleExportReport('excel')}
                          className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all group"
                        >
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileSpreadsheet className="w-6 h-6 text-green-600" />
                          </div>
                          <span className="font-bold text-gray-900">Excel/CSV</span>
                          <span className="text-xs text-gray-500">לעיבוד נתונים</span>
                        </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
