import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, DollarSign, Package, Users, Calendar } from 'lucide-react';

export default function OrderAnalytics({ orders }) {
  // Calculate sales trends by date
  const salesByDate = React.useMemo(() => {
    const dateMap = {};
    orders.forEach(order => {
      const date = new Date(order.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dateMap[date]) {
        dateMap[date] = { date, revenue: 0, count: 0 };
      }
      dateMap[date].revenue += order.total_amount || 0;
      dateMap[date].count += 1;
    });
    return Object.values(dateMap).slice(-14); // Last 14 days
  }, [orders]);

  // Popular products/add-ons
  const productStats = React.useMemo(() => {
    const stats = {
      'Premium Magazine': orders.filter(o => !o.is_promo_order).length,
      'Self-Generated': orders.filter(o => o.is_promo_order).length,
      'VIP Song Package': orders.filter(o => o.vip_song_addon).length,
      'Extra Copies': orders.filter(o => o.extra_copy).length,
      'Honor Roll': orders.filter(o => o.honor_roll).length,
      'Principal\'s List': orders.filter(o => o.principals_list).length,
    };
    return Object.entries(stats).map(([name, count]) => ({ name, count })).filter(s => s.count > 0);
  }, [orders]);

  // Payment method breakdown
  const paymentMethods = React.useMemo(() => {
    const methods = {};
    orders.forEach(order => {
      const method = order.payment_method === 'cashapp' ? 'Cash App' : 'Stripe';
      methods[method] = (methods[method] || 0) + 1;
    });
    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Status breakdown
  const statusStats = React.useMemo(() => {
    return [
      { name: 'Approved', value: orders.filter(o => o.approved_for_directory).length, color: '#20D4AB' },
      { name: 'Pending', value: orders.filter(o => !o.approved_for_directory).length, color: '#FFD60A' },
      { name: 'Paid', value: orders.filter(o => o.payment_status === 'paid').length, color: '#6C3BFF' },
    ];
  }, [orders]);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const last7Days = orders.filter(o => {
    const date = new Date(o.created_date);
    const now = new Date();
    return (now - date) / (1000 * 60 * 60 * 24) <= 7;
  });

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Revenue</p>
                <p className="text-white text-2xl font-bold">${totalRevenue.toFixed(0)}</p>
                <p className="text-[#20D4AB] text-xs mt-1">All time</p>
              </div>
              <DollarSign className="w-10 h-10 text-[#FFD60A]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Avg Order Value</p>
                <p className="text-white text-2xl font-bold">${avgOrderValue.toFixed(2)}</p>
                <p className="text-white/60 text-xs mt-1">Per order</p>
              </div>
              <TrendingUp className="w-10 h-10 text-[#20D4AB]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Last 7 Days</p>
                <p className="text-white text-2xl font-bold">{last7Days.length}</p>
                <p className="text-[#6C3BFF] text-xs mt-1">${last7Days.reduce((sum, o) => sum + (o.total_amount || 0), 0).toFixed(0)} revenue</p>
              </div>
              <Calendar className="w-10 h-10 text-[#6C3BFF]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Conversion Rate</p>
                <p className="text-white text-2xl font-bold">
                  {orders.length > 0 ? ((orders.filter(o => o.payment_status === 'paid').length / orders.length) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-white/60 text-xs mt-1">Paid orders</p>
              </div>
              <Users className="w-10 h-10 text-[#FF6B9D]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Sales Trend (Last 14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#fff" style={{ fontSize: '12px' }} />
                <YAxis stroke="#fff" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1535', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#FFD60A" strokeWidth={2} dot={{ fill: '#FFD60A' }} />
                <Line type="monotone" dataKey="count" stroke="#20D4AB" strokeWidth={2} dot={{ fill: '#20D4AB' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1535', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popular Add-Ons */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Popular Products & Add-Ons</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={productStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#fff" style={{ fontSize: '11px' }} angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#fff" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1535', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#6C3BFF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#00D632' : '#6C3BFF'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1535', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}