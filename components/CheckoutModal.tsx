"use client";

import React, { useEffect, useState } from "react";
import { Product } from "./ProductCard";
import { supabase } from "@/lib/supabase";

interface CheckoutModalProps {
  products: Product[];
  isOpen: boolean;
  onSubmitted: () => void;
  onClose: () => void;
}

export default function CheckoutModal({
  products,
  isOpen,
  onSubmitted,
  onClose,
}: CheckoutModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent background scrolling when the modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || products.length === 0) return null;

  const total = products.reduce((sum, item) => sum + item.price, 0);
  const hasPaidItems = products.some((item) => item.price > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside modal content
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-4">
          <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">
            Checkout
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Complete your order</h2>
          <p className="text-lg font-black text-emerald-400 mt-1">
            Total: LKR {total.toLocaleString()}
          </p>
        </div>

        <div className="mb-4 space-y-2 rounded-lg bg-zinc-800/60 p-3">
          {products.map((item) => (
            <div key={item.id} className="flex justify-between gap-4 text-sm">
              <span className="text-zinc-300">{item.title}</span>
              <span className="shrink-0 font-semibold text-zinc-100">
                {item.price === 0 ? "FREE" : `LKR ${item.price.toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>

        {hasPaidItems && (
          <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-950/40 p-4 text-sm text-blue-100">
            <p className="mb-2 font-bold text-blue-300">Pay by bank transfer</p>
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <span className="text-blue-300">Bank</span><span>Amana Bank</span>
              <span className="text-blue-300">Account</span><span>0100549075001</span>
              <span className="text-blue-300">Branch</span><span>Dehiwala</span>
            </div>
            <p className="mt-2 text-xs text-blue-200/70">Transfer LKR {total.toLocaleString()}, choose your slip below, then send it in WhatsApp.</p>
          </div>
        )}

        {/* Product Details & Form */}
        <div className="space-y-4">
          <div className="border-t border-zinc-800 pt-4">
            <p className="text-xs font-medium text-zinc-400 mb-2">
              Complete your purchase details below:
            </p>
            
            {/* Simple Form Placeholder */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                try {
                  const form = new FormData(e.currentTarget);
                  const name = String(form.get("name") || "");
                  const email = String(form.get("email") || "");
                  const slip = form.get("slip") as File | null;
                  const itemList = products.map((item) => item.title).join(", ");
                  let slipUrl = "";

                  if (hasPaidItems && slip?.size) {
                    const filePath = `${Date.now()}-${slip.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
                    const { error: uploadError } = await supabase.storage
                      .from("payment-slips")
                      .upload(filePath, slip, { upsert: false });
                    if (uploadError) throw new Error(`Could not upload bank slip: ${uploadError.message}`);
                    slipUrl = supabase.storage.from("payment-slips").getPublicUrl(filePath).data.publicUrl;
                  }

                  const { error: orderError } = await supabase.from("orders").insert({
                    customer_name: name,
                    customer_email: email,
                    amount: total,
                    slip_url: slipUrl,
                    status: "pending",
                    item_name: itemList,
                  });
                  if (orderError) throw new Error(orderError.message);
                  const message = [
                    "New BlueDigital order",
                    `Name: ${name}`,
                    `Email: ${email}`,
                    `Items: ${itemList}`,
                    `Total: LKR ${total.toLocaleString()}`,
                    hasPaidItems ? `Bank slip: ${slipUrl || slip?.name || "No file"}` : "Free download request",
                    "I will attach the bank slip in this WhatsApp chat.",
                  ].join("\n");
                  window.open(`https://wa.me/94757733146?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
                  onSubmitted();
                  onClose();
                } catch (error) {
                  alert(`Could not submit order: ${error instanceof Error ? error.message : "Please try again."}`);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Full Name
                </label>
                  <input
                    name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Email Address
                </label>
                  <input
                    name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {hasPaidItems && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Bank Slip</label>
                  <input
                    name="slip"
                    type="file"
                    accept="image/*,.pdf"
                    required
                    className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-300 file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white"
                  />
                  <p className="mt-1 text-xs text-zinc-500">Submit, then attach this file in the WhatsApp chat so payment can be verified.</p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors"
                >
                  {isSubmitting ? "Submitting..." : "Confirm Purchase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}