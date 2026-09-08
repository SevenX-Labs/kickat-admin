"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { AdminProductItem } from "@/types/admin-product";
import { AdminProductService } from "@/services/adminProductService";
import { ProductForm } from "@/components/products/ProductForm";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<AdminProductItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    AdminProductService.getProductById(productId)
      .then((res) => {
        if (!mounted) return;
        if (res?.success && res?.data) {
          setProduct(res.data);
        } else {
          setError("Product not found");
        }
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        const msg = AdminProductService.extractErrorMessage(
          err,
          "Failed to load product details."
        );
        setError(msg);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [productId]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    AdminProductService.getProductById(productId)
      .then((res) => {
        if (res?.success && res?.data) {
          setProduct(res.data);
        } else {
          setError("Product not found");
        }
      })
      .catch((err: unknown) => {
        const msg = AdminProductService.extractErrorMessage(
          err,
          "Failed to load product details."
        );
        setError(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-24 animate-pulse">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="font-fraunces text-xl font-bold text-slate-900">
          Product Not Found
        </h2>
        <p className="text-xs text-slate-500">
          {error || "Could not retrieve information for this product."}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRetry}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </button>
          <Link
            href="/admin/dashboard/products"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FF7A00] text-white hover:bg-orange-600 transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return <ProductForm mode="edit" key={product.id} initialProduct={product} />;
}
