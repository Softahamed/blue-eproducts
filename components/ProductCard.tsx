"use client";

import { motion } from "framer-motion";
import { Download, ShoppingCart, Check } from "lucide-react";

export interface Product {
  id: string;
  title: string;
  category: "ebook" | "template" | "tshirt" | "calendar";
  price: number;
  image: string;
  description: string;
  file_url?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  isInCart: boolean;
}

export default function ProductCard({ product, onAddToCart, onSelectProduct, isInCart }: ProductCardProps) {
  const isFree = product.price === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all flex flex-col justify-between"
    >
      {/* Clickable Card Body */}
      <div className="cursor-pointer" onClick={() => onSelectProduct(product)}>
        {/* Category Tag */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-900/80 text-white backdrop-blur-md capitalize">
            {product.category}
          </span>
        </div>

        {/* Thumbnail Image */}
        <div className="relative h-48 w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-950 flex items-center justify-center overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {isFree ? (
                <span className="text-emerald-600 dark:text-emerald-400">FREE</span>
              ) : (
                `LKR ${product.price.toLocaleString()}`
              )}
            </span>
          </div>

          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {product.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
            {product.description}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-5 pt-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isFree && product.file_url) {
              window.open(product.file_url, "_blank", "noopener,noreferrer");
              return;
            }
            onAddToCart(product);
          }}
          className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
            isFree
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
              : isInCart
              ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-500/30"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
          }`}
        >
          {isFree ? (
            <>
              <Download className="w-4 h-4" /> Free Download
            </>
          ) : isInCart ? (
            <>
              <Check className="w-4 h-4" /> Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}