"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, X, Package, DollarSign, Clock, CheckCircle2, Trash2 } from "lucide-react";

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  slip_url: string;
  status: "pending" | "approved" | "rejected";
  item_name: string;
}

interface ProductItem {
  id: string;
  title: string;
  category: "ebook" | "template" | "tshirt" | "calendar";
  price: number;
  image: string;
  description: string;
  file_url?: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs & Modals
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"ebook" | "template" | "tshirt" | "calendar">("ebook");
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newImage, setNewImage] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newFileUrl, setNewFileUrl] = useState("");

  // Analytics
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchOrders(), fetchProducts()]);
    setLoading(false);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) {
      alert(`Could not load orders: ${formatSupabaseError(error.message)}`);
      return;
    }
    if (data) {
      setOrders(data);
      calculateAnalytics(data);
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) {
      alert(`Could not load products: ${formatSupabaseError(error.message)}`);
      return;
    }
    if (data) setProducts(data);
  };

  const formatSupabaseError = (message: string) =>
    message.includes("schema cache") || message.includes("does not exist")
      ? "Your Supabase schema is missing the products table or required columns. Run the repeatable supabase_setup.sql file in Supabase SQL Editor, then reload this page."
      : message;

  const calculateAnalytics = (data: Order[]) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    let total = 0, daily = 0, weekly = 0, monthly = 0, pending = 0;
    const now = new Date();
    const today = now.toDateString();
    const month = now.getMonth();
    const year = now.getFullYear();

    data.forEach((order) => {
      if (order.status === "approved") {
        total += Number(order.amount);
        const createdAt = new Date(order.created_at);
        if (createdAt.toDateString() === today) daily += Number(order.amount);
        if (createdAt.getMonth() === month && createdAt.getFullYear() === year) monthly += Number(order.amount);
        if (createdAt >= sevenDaysAgo) weekly += Number(order.amount);
      } else if (order.status === "pending") {
        pending += 1;
      }
    });

    setTotalEarnings(total);
    setDailyEarnings(daily);
    setWeeklyEarnings(weekly);
    setMonthlyEarnings(monthly);
    setPendingCount(pending);
  };

  const updateOrderStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (!error) fetchOrders();
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from("products").insert([
      {
        title: newTitle,
        category: newCategory,
        price: Number(newPrice),
        image: newImage,
        description: newDescription,
        file_url: newFileUrl || null,
      },
    ]);

    setIsSubmitting(false);
    if (!error) {
      setIsAddModalOpen(false);
      setNewTitle("");
      setNewImage("");
      setNewDescription("");
      setNewFileUrl("");
      setNewPrice(0);
      fetchProducts();
    } else {
      alert("Error adding product: " + formatSupabaseError(error.message));
    }
  };

  // Delete Single Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      fetchProducts();
    } else {
      alert("Error deleting product: " + formatSupabaseError(error.message));
    }
  };

  // Delete ALL Products (To clear current uploaded items)
  const handleDeleteAllProducts = async () => {
    if (!confirm("WARNING: Are you sure you want to delete ALL products from your store?")) return;
    const { error } = await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (!error) {
      fetchProducts();
    } else {
      alert("Error deleting products: " + formatSupabaseError(error.message));
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void fetchData();
    });
  }, []);

  if (loading) return <div className="p-10 text-white bg-slate-900 min-h-screen">Loading admin panel...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Admin Management Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Manage store products, bank slip approvals & revenue analytics</p>
        </div>
        <div className="flex items-center gap-3">
          {products.length > 0 && (
            <button
              onClick={handleDeleteAllProducts}
              className="bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all text-sm"
            >
              <Trash2 className="w-4 h-4" /> Clear All Products
            </button>
          )}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-5 h-5" /> Add New Product
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-10">
        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total Lifetime Earnings</p>
            <p className="text-3xl font-black text-emerald-400 mt-2">LKR {totalEarnings.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><DollarSign className="w-8 h-8" /></div>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Today</p>
          <p className="text-2xl font-black text-white mt-2">LKR {dailyEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">This Month</p>
          <p className="text-2xl font-black text-white mt-2">LKR {monthlyEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Last 7 Days Revenue</p>
            <p className="text-3xl font-black text-blue-400 mt-2">LKR {weeklyEarnings.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><Clock className="w-8 h-8" /></div>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Pending Slip Approvals</p>
            <p className="text-3xl font-black text-amber-400 mt-2">{pendingCount}</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400"><CheckCircle2 className="w-8 h-8" /></div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-800 mb-6 gap-6">
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 font-bold text-sm transition-all border-b-2 ${
            activeTab === "orders" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Bank Slip Approvals ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-3 font-bold text-sm transition-all border-b-2 ${
            activeTab === "products" ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Product Catalog ({products.length})
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="bg-slate-800/60 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800 text-slate-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Slip Link</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="font-bold text-white">{order.customer_name}</div>
                      <div className="text-xs text-slate-400">{order.customer_email}</div>
                    </td>
                    <td className="p-4 font-medium">{order.item_name}</td>
                    <td className="p-4 font-black text-slate-200">LKR {order.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <a href={order.slip_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                        View Slip ↗
                      </a>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                        order.status === "approved" ? "bg-emerald-500/10 text-emerald-400" : order.status === "rejected" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 space-x-2">
                      {order.status === "pending" && (
                        <>
                          <button onClick={() => updateOrderStatus(order.id, "approved")} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold">Approve</button>
                          <button onClick={() => updateOrderStatus(order.id, "rejected")} className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold">Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between p-4 relative group">
              <div>
                <img src={product.image} alt={product.title} className="w-full h-40 object-cover rounded-xl mb-3" />
                <span className="text-xs font-bold uppercase text-blue-400">{product.category}</span>
                <h3 className="font-bold text-white text-base mt-1 line-clamp-1">{product.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{product.description}</p>
                {product.file_url && <p className="text-xs text-emerald-400 mt-2">Download file configured</p>}
              </div>
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-700">
                <span className="font-black text-white">{product.price === 0 ? "FREE" : `LKR ${product.price}`}</span>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-3xl p-6 relative">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <Package className="w-5 h-5 text-blue-400" /> Add New Digital Product
            </h2>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400">Product Title</label>
                <input required type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white" placeholder="e.g. Canva Design Kit 2026" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Category</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as ProductItem["category"])} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white">
                    <option value="ebook">E-Book</option>
                    <option value="template">Template</option>
                    <option value="tshirt">T-Shirt Vector</option>
                    <option value="calendar">Calendar</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Price (LKR - 0 for Free)</label>
                  <input required type="number" min="0" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Image URL</label>
                <input required type="url" value={newImage} onChange={(e) => setNewImage(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white" placeholder="https://images.unsplash.com/..." />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Description</label>
                <textarea required rows={3} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white" placeholder="Short description..."></textarea>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Download File URL</label>
                <input type="url" value={newFileUrl} onChange={(e) => setNewFileUrl(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white" placeholder="https://... (required for free downloads)" />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold text-white rounded-xl transition-all">
                {isSubmitting ? "Adding Product..." : "Save & Publish Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}