"use client";

import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  MapPin, 
  CreditCard, 
  User, 
  Phone, 
  Mail, 
  Copy, 
  Check,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useState, use } from "react";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [copiedAwb, setCopiedAwb] = useState(false);
  const [orderStatus, setOrderStatus] = useState<"PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED">("SHIPPED");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyAwb = () => {
    navigator.clipboard?.writeText("BLU-9024881");
    setCopiedAwb(true);
    showToast("AWB tracking code copied to clipboard!");
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0 pb-16">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-[#2A241E] text-white px-5 py-3 text-xs font-semibold shadow-2xl animate-fade-in">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <Link
            href="/admin/dashboard/orders"
            className="clay-button flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 transition shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-fraunces text-xl sm:text-2xl font-bold tracking-tight text-[#2A241E] truncate">
                Order #{resolvedParams.id || "ORD-9842"}
              </h1>
              <span className={`
                px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase shrink-0
                ${orderStatus === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                  orderStatus === "SHIPPED" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                  orderStatus === "PROCESSING" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                  "bg-rose-50 text-rose-700 border border-rose-200"}
              `}>
                {orderStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Placed on Sep 7, 2026 at 10:24 AM via Mobile Web Store
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button 
            onClick={() => window.print()}
            className="clay-button inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Print Slip</span>
          </button>
          <button 
            onClick={() => showToast("Downloading GST Invoice PDF...")}
            className="clay-button inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Invoice PDF</span>
          </button>
        </div>
      </div>

      {/* Fulfillment Status Stepper Tracker */}
      <div className="clay-card p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
            Fulfillment Timeline
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Update Status:</span>
            <select
              value={orderStatus}
              onChange={(e) => {
                const s = e.target.value as any;
                setOrderStatus(s);
                showToast(`Order status updated to ${s}`);
              }}
              className="rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-2.5 py-1 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Responsive Horizontal Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          {[
            { step: "Order Placed", time: "Sep 7, 10:24 AM", done: true, icon: CheckCircle2, color: "text-emerald-500" },
            { step: "Payment Confirmed", time: "Sep 7, 10:25 AM", done: true, icon: CheckCircle2, color: "text-emerald-500" },
            { step: "Dispatched (Shiprocket)", time: "Sep 7, 03:45 PM", done: orderStatus === "SHIPPED" || orderStatus === "DELIVERED", icon: Truck, color: "text-blue-500" },
            { step: "Delivered to Door", time: "Est. Sep 9, 2026", done: orderStatus === "DELIVERED", icon: Package, color: orderStatus === "DELIVERED" ? "text-emerald-500" : "text-slate-300" },
          ].map((st, i) => {
            const Icon = st.icon;
            return (
              <div key={i} className="clay-inset p-3 space-y-1 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 font-mono-eyebrow">STEP 0{i + 1}</span>
                  <Icon className={`h-4 w-4 ${st.done ? st.color : "text-slate-300"}`} />
                </div>
                <p className="text-xs font-bold text-slate-800">{st.step}</p>
                <p className="text-[10.5px] text-slate-500 font-medium">{st.time}</p>
              </div>
            );
          })}
        </div>

        {/* Courier Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Courier Partner:</span>
            <span>Bluedart Express Surface (Air Priority)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">AWB Tracking:</span>
            <span className="font-mono font-bold text-indigo-600">BLU-9024881</span>
            <button 
              onClick={copyAwb} 
              className="clay-button p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              title="Copy AWB"
            >
              {copiedAwb ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left 8 Cols: Line Items & Invoice summary */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          
          {/* Line Items Card */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
                Ordered Pet Items (2)
              </h2>
              <span className="text-xs text-slate-400 font-medium">Shipment 1 of 1</span>
            </div>

            {/* Items List */}
            <div className="divide-y divide-slate-100">
              {[
                {
                  id: "item-1",
                  title: "Royal Canin Maxi Puppy Dry Food",
                  spec: "15 kg • Large Breed Formula",
                  sku: "RC-MAX-PUP-15KG",
                  qty: 1,
                  price: 7999,
                  img: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=120&h=120&fit=crop&q=80"
                },
                {
                  id: "item-2",
                  title: "Bio-Groom Herbal Oatmeal Pet Shampoo",
                  spec: "355 ml • Soothing Relief",
                  sku: "BIO-OAT-355",
                  qty: 2,
                  price: 850,
                  img: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=120&h=120&fit=crop&q=80"
                }
              ].map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={item.img} 
                      alt={item.title} 
                      className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl object-cover border border-slate-200/80 shrink-0 bg-slate-50"
                    />
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium truncate">{item.spec}</p>
                      <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs sm:text-sm font-extrabold text-[#2A241E]">
                      ₹{(item.price * item.qty).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      ₹{item.price.toLocaleString()} × {item.qty}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Invoice Breakdown */}
            <div className="clay-inset p-3.5 sm:p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal (3 items)</span>
                <span className="font-semibold text-slate-800">₹9,699</span>
              </div>
              <div className="flex items-center justify-between text-emerald-600">
                <span>Promo Discount (PUPPYLOVE10)</span>
                <span className="font-bold">-₹970</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Express Courier Shipping</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Integrated GST (18% included)</span>
                <span>₹1,331.50</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm sm:text-base font-black text-[#2A241E]">
                <span>Grand Total Paid</span>
                <span className="text-orange-600 font-fraunces">₹8,729</span>
              </div>
            </div>

            {/* Pet Parent Order Notes */}
            <div className="clay-inset p-3 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-eyebrow">Customer Delivery Instructions</span>
              <p className="text-xs text-slate-600 italic">
                “Please deliver in the morning between 10 AM to 1 PM. If unavailable, please hand over to tower security guard.”
              </p>
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Customer & Address */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          
          {/* Customer Profile Card */}
          <div className="clay-card p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-orange-500" />
                <h3 className="font-fraunces text-xs sm:text-sm font-bold text-[#2A241E]">
                  Pet Parent Details
                </h3>
              </div>
              <Link 
                href="/admin/dashboard/customers/c-101"
                className="text-[11px] font-bold text-indigo-600 hover:underline"
              >
                View Profile
              </Link>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-black text-sm">
                  PS
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800">Priya Sharma</h4>
                  <p className="text-[10.5px] text-slate-500 font-medium">Pet: Bruno (Golden Retriever, 2y)</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">priya.sharma@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>+91 98201 45892</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="clay-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <h3 className="font-fraunces text-xs sm:text-sm font-bold text-[#2A241E]">
                Delivery Address
              </h3>
            </div>

            <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
              <p className="font-bold text-slate-800">Priya Sharma</p>
              <p>Flat 402, Oakwood Heights, Hiranandani Estate</p>
              <p>Ghodbunder Road, Thane West</p>
              <p>Mumbai, Maharashtra - 400607</p>
              <p className="pt-1 text-[11px] font-bold text-slate-400 font-mono">Contact: +91 98201 45892</p>
            </div>
          </div>

          {/* Payment Card */}
          <div className="clay-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-500" />
                <h3 className="font-fraunces text-xs sm:text-sm font-bold text-[#2A241E]">
                  Payment Method
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[9.5px] font-black rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                PAID
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Method:</span>
                <span className="font-bold text-slate-800">UPI (Google Pay / PhonePe)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Gateway:</span>
                <span className="font-medium text-slate-800">Razorpay India</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[10.5px]">
                <span>Transaction ID:</span>
                <span className="text-slate-800 font-bold">pay_OzJ817293kX</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
