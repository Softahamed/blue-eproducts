"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ShoppingCart, Check, ShieldCheck, Sparkles } from "lucide-react";
import { Product } from "./ProductCard";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  isInCart: boolean;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  isInCart,
}: ProductDetailModalProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!product) return null;

  const isFree = product.price === 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25 }}
          className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/50 hover:bg-slate-900 text-white backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Product Image Section */}
          <div className="w-full md:w-1/2 relative bg-slate-100 dark:bg-slate-800 flex items-center justify-center min-h-[260px] md:min-h-full">
            {product.image && !imageFailed ? (
              <img
                src={product.image.trim()}
                alt={product.title}
                onError={() => setImageFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="px-6 text-center text-sm font-semibold text-slate-500">Product preview unavailable</div>
            )}
            <span className="absolute top-4 left-4 z-10 px-3 py-1 text-xs font-bold rounded-full bg-blue-600 text-white shadow-md capitalize">
              {product.category}
            </span>
          </div>

          {/* Product Info Section */}
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {isFree ? (
                    <span className="text-emerald-600 dark:text-emerald-400">FREE DOWNLOAD</span>
                  ) : (
                    `LKR ${product.price.toLocaleString()}`
                  )}
                </span>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                  {product.title}
                </h2>
              </div>

              <hr className="border-slate-200 dark:border-slate-800" />

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Product Details
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Trust Badges */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Instant digital delivery after bank slip check</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>High quality print-ready files included</span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-4">
              <button
                onClick={() => {
                  if (isFree && product.file_url) {
                    window.open(product.file_url, "_blank", "noopener,noreferrer");
                    return;
                  }
                  onAddToCart(product);
                }}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isFree
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                    : isInCart
                    ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                }`}
              >
                {isFree ? (
                  <>
                    <Download className="w-4 h-4" /> Free Download Now
                  </>
                ) : isInCart ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Add to Cart (LKR {product.price.toLocaleString()})
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}