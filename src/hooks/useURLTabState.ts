"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { StockTabId } from "@/constants";

export function useURLTabState(defaultTab: StockTabId = "overview") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<StockTabId>(() => {
    const tabParam = searchParams.get("tab");
    return (tabParam as StockTabId) || defaultTab;
  });

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam as StockTabId);
    }
  }, [searchParams]);

  const changeTab = (newTab: StockTabId) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return { activeTab, changeTab };
}
