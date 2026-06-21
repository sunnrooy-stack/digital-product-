export default function SellerOverview() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-emerald-500/20">
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Earnings</p>
          <p className="text-3xl font-extrabold text-emerald-500">$4,250.00</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-sm font-medium text-muted-foreground mb-2">Active Products</p>
          <p className="text-3xl font-extrabold">24</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Sales</p>
          <p className="text-3xl font-extrabold">128</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-sm font-medium text-muted-foreground mb-2">Pending Payout</p>
          <p className="text-3xl font-extrabold">$450.00</p>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-6">Recent Sales</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-sm font-semibold text-muted-foreground">Product</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground">Date</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground">Customer</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">Ultimate SaaS Kit</td>
                  <td className="p-4 text-muted-foreground">Today, 10:{i}4 AM</td>
                  <td className="p-4">user{i}@example.com</td>
                  <td className="p-4 font-bold text-emerald-500">+$89.00</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
