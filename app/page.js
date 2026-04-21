'use client'
import { useState } from 'react'
import { supabase } from './lib/supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function Home() {
  const [currentBalance, setCurrentBalance] = useState('')
  const [incomeLabel, setIncomeLabel] = useState('')
  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomeDate, setIncomeDate] = useState('')
  const [incomeCertainty, setIncomeCertainty] = useState('guaranteed')
  const [incomeList, setIncomeList] = useState([])
  const [expenseLabel, setExpenseLabel] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState('')
  const [expenseList, setExpenseList] = useState([])
  const [showWorstCase, setShowWorstCase] = useState(false)

  const addIncome = async () => {
    if (!incomeAmount || !incomeDate) return
    const entry = { label: incomeLabel, amount: parseFloat(incomeAmount), date: incomeDate, certainty: incomeCertainty }
    const { error } = await supabase.from('income').insert([entry])
    if (!error) {
      setIncomeList([...incomeList, entry])
      setIncomeLabel(''); setIncomeAmount(''); setIncomeDate(''); setIncomeCertainty('guaranteed')
    }
  }

  const addExpense = async () => {
    if (!expenseAmount || !expenseDate) return
    const entry = { label: expenseLabel, amount: parseFloat(expenseAmount), date: expenseDate, recurring: false }
    const { error } = await supabase.from('expenses').insert([entry])
    if (!error) {
      setExpenseList([...expenseList, entry])
      setExpenseLabel(''); setExpenseAmount(''); setExpenseDate('')
    }
  }

  const calculateForecast = (worstCase = false) => {
    if (!currentBalance) return []
    let balance = parseFloat(currentBalance)
    const forecast = []
    for (let i = 0; i < 14; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      const dayIncome = incomeList
        .filter(inc => inc.date === dateStr && (!worstCase || inc.certainty === 'guaranteed'))
        .reduce((sum, inc) => sum + inc.amount, 0)
      const dayExpenses = expenseList
        .filter(exp => exp.date === dateStr)
        .reduce((sum, exp) => sum + exp.amount, 0)
      balance = balance + dayIncome - dayExpenses
      forecast.push({ date: dateStr.slice(5), balance: parseFloat(balance.toFixed(2)) })
    }
    return forecast
  }

  const calculateSafeToSpend = () => {
    if (!currentBalance || incomeList.length === 0) return null
    const today = new Date()
    const nextIncome = incomeList
      .filter(inc => inc.certainty === 'guaranteed' && new Date(inc.date) > today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0]
    if (!nextIncome) return null
    const daysUntilPaid = Math.ceil((new Date(nextIncome.date) - today) / (1000 * 60 * 60 * 24))
    const upcomingExpenses = expenseList
      .filter(exp => new Date(exp.date) <= new Date(nextIncome.date))
      .reduce((sum, exp) => sum + exp.amount, 0)
    const available = parseFloat(currentBalance) - upcomingExpenses
    return (available / daysUntilPaid).toFixed(2)
  }

  const forecast = calculateForecast(showWorstCase)
  const safeToSpend = calculateSafeToSpend()

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-1">FlowFi 💸</h1>
      <p className="text-gray-400 text-sm mb-8">Know exactly how much you can safely spend</p>

      {/* Current Balance */}
      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-1 block">Current balance ($)</label>
        <input type="number" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} placeholder="e.g. 847" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-blue-500" />
      </div>

      {/* Safe to Spend */}
      {safeToSpend && (
        <div className="mb-6 bg-gray-900 rounded-xl p-6 text-center border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Safe to spend per day</p>
          <p className="text-5xl font-bold text-green-400">${safeToSpend}</p>
          <p className="text-gray-500 text-xs mt-2">until your next guaranteed income</p>
        </div>
      )}

      {/* Forecast Graph */}
      {forecast.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">14-day forecast</h2>
            <button onClick={() => setShowWorstCase(!showWorstCase)} className={`text-xs px-3 py-1 rounded-full border ${showWorstCase ? 'border-red-500 text-red-400' : 'border-gray-600 text-gray-400'}`}>
              {showWorstCase ? 'Worst case' : 'Best case'}
            </button>
          </div>
          <div className="bg-gray-900 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={forecast}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }} />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="balance" stroke={showWorstCase ? '#ef4444' : '#34d399'} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Add Income */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Add income</h2>
        <input type="text" value={incomeLabel} onChange={(e) => setIncomeLabel(e.target.value)} placeholder="Label (e.g. TA shift, freelance)" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white mb-2 focus:outline-none focus:border-blue-500" />
        <input type="number" value={incomeAmount} onChange={(e) => setIncomeAmount(e.target.value)} placeholder="Amount ($)" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white mb-2 focus:outline-none focus:border-blue-500" />
        <input type="date" value={incomeDate} onChange={(e) => setIncomeDate(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white mb-2 focus:outline-none focus:border-blue-500" />
        <select value={incomeCertainty} onChange={(e) => setIncomeCertainty(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white mb-3 focus:outline-none focus:border-blue-500">
          <option value="guaranteed">Guaranteed</option>
          <option value="likely">Likely</option>
          <option value="uncertain">Uncertain</option>
        </select>
        <button onClick={addIncome} className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-3 font-semibold">+ Add income</button>
      </div>

      {/* Income list */}
      {incomeList.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm text-gray-400 mb-2">Upcoming income</h3>
          {incomeList.map((inc, i) => (
            <div key={i} className="flex justify-between items-center bg-gray-900 rounded-lg px-4 py-3 mb-2">
              <div>
                <p className="font-medium">{inc.label || 'Income'}</p>
                <p className="text-sm text-gray-400">{inc.date} · {inc.certainty}</p>
              </div>
              <p className="text-green-400 font-semibold">+${inc.amount}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Expense */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Add expense</h2>
        <input type="text" value={expenseLabel} onChange={(e) => setExpenseLabel(e.target.value)} placeholder="Label (e.g. rent, groceries)" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white mb-2 focus:outline-none focus:border-blue-500" />
        <input type="number" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="Amount ($)" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white mb-2 focus:outline-none focus:border-blue-500" />
        <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white mb-3 focus:outline-none focus:border-blue-500" />
        <button onClick={addExpense} className="w-full bg-red-600 hover:bg-red-700 rounded-lg px-4 py-3 font-semibold">+ Add expense</button>
      </div>

      {/* Expense list */}
      {expenseList.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm text-gray-400 mb-2">Upcoming expenses</h3>
          {expenseList.map((exp, i) => (
            <div key={i} className="flex justify-between items-center bg-gray-900 rounded-lg px-4 py-3 mb-2">
              <div>
                <p className="font-medium">{exp.label || 'Expense'}</p>
                <p className="text-sm text-gray-400">{exp.date}</p>
              </div>
              <p className="text-red-400 font-semibold">-${exp.amount}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}