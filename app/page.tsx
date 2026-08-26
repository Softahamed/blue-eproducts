"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, X, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductCard, { Product } from "@/components/ProductCard";
import CheckoutModal from "@/components/CheckoutModal";
import ProductDetailModal from "@/components/ProductDetailModal";
import { supabase } from "@/lib/supabase";

// Mock Data
const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Canva Social Media Mastery E-Book",
    category: "ebook",
    price: 1500,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    description: "Complete guide on creating high-converting social media graphic bundles for businesses and creators."
  },
  {
    id: "2",
    title: "Minimalist 2026 Printable Wall Calendar",
    category: "calendar",
    price: 0,
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80",
    description: "High-resolution print-ready A3/A4 wall calendar templates with clean minimal design."
  },
  {
    id: "3",
    title: "Cyberpunk Streetwear T-Shirt Vector Pack",
    category: "tshirt",
    price: 2500,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
    description: "Print-ready PNG & SVG vector graphics designed for local T-shirt print shops."
  },
  {
    id: "4",
    title: "Instagram Carousel Creator Template",
    category: "template",
    price: 1200,
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80",
    description: "Editable Photoshop & Canva templates designed to boost audience engagement."
  }
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [cart, setCart] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (data && data.length > 0) setProducts(data as Product[]);
    };
    loadProducts();
  }, []);

  const toggleAddToCart = (product: Product) => {
    setCart((currentCart) =>
      currentCart.some((item) => item.id === product.id)
        ? currentCart.filter((item) => item.id !== product.id)
        : [...currentCart, product]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== id));
  };

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const cartTotal = cart.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar cartCount={cart.length} onOpenCart={() => setIsCartOpen(true)} />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-semibold">
            <Sparkles className="w-4 h-4" /> Instant Digital Downloads
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Premium E-Products, <br />
            <span className="text-blue-600">Templates & Printables</span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Get high-quality e-books, custom Canva templates, printable planners, and T-shirt designs ready for local print shops.
          </p>
        </motion.div>
      </section>

      {/* Products & Filters Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {["all", "ebook", "template", "tshirt", "calendar"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={toggleAddToCart}
                onSelectProduct={(prod) => setSelectedProduct(prod)}
                isInCart={!!cart.find((i) => i.id === product.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Cart Drawer Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 z-50 shadow-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6 text-blue-600" /> Your Cart
                  </h2>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 space-y-3">
                    <p className="text-lg font-medium">Your cart is empty.</p>
                    <p className="text-sm">Explore our products and add template bundles or printables.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center border-b pb-3 dark:border-slate-800"
                      >
                        <div>
                          <p className="font-semibold text-sm">{item.title}</p>
                          <p className="text-xs text-slate-500 capitalize">{item.category}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm">
                            {item.price === 0 ? "FREE" : `LKR ${item.price}`}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs text-red-500 hover:text-red-600 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t dark:border-slate-800 pt-4 space-y-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">LKR {cartTotal}</span>
                  </div>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/25"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          key={selectedProduct.id}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={toggleAddToCart}
          isInCart={!!cart.find((i) => i.id === selectedProduct.id)}
        />
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          products={cart}
          onSubmitted={() => setCart([])}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Digital Store. All rights reserved.
        </div>
      </footer>
    </div>
  );
}