"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Breadcrumb from "@/components/layout/Breadcrumb";

interface DividendEvent {
  ticker: string;
  companyName: string;
  amount: number;
  payDate: string;
  sector: string;
}

export default function DividendCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const mockDividendEvents: DividendEvent[] = [
    {
      ticker: "AAPL",
      companyName: "Apple Inc.",
      amount: 0.24,
      payDate: "2024-11-14",
      sector: "Technology",
    },
    {
      ticker: "MSFT",
      companyName: "Microsoft Corporation",
      amount: 0.75,
      payDate: "2024-11-14",
      sector: "Technology",
    },
    {
      ticker: "JNJ",
      companyName: "Johnson & Johnson",
      amount: 1.13,
      payDate: "2024-11-12",
      sector: "Healthcare",
    },
    {
      ticker: "PG",
      companyName: "Procter & Gamble",
      amount: 0.91,
      payDate: "2024-11-15",
      sector: "Consumer Goods",
    },
    {
      ticker: "KO",
      companyName: "The Coca-Cola Company",
      amount: 0.48,
      payDate: "2024-11-15",
      sector: "Consumer Goods",
    },
    {
      ticker: "JPM",
      companyName: "JPMorgan Chase & Co.",
      amount: 1.15,
      payDate: "2024-11-30",
      sector: "Financial Services",
    },
    {
      ticker: "V",
      companyName: "Visa Inc.",
      amount: 0.52,
      payDate: "2024-12-03",
      sector: "Financial Services",
    },
    {
      ticker: "UNH",
      companyName: "UnitedHealth Group",
      amount: 2.1,
      payDate: "2024-12-17",
      sector: "Healthcare",
    },
  ];

  const getBreadcrumbItems = () => [
    { label: "Tools", href: "/tools" },
    { label: "Dividend Calendar", active: true },
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getDividendsForDate = (day: number) => {
    const dateString = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return mockDividendEvents.filter((event) => event.payDate === dateString);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + (direction === "next" ? 1 : -1),
        1
      )
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const totalDividendAmount = mockDividendEvents
    .filter((event) =>
      event.payDate.startsWith(
        `${currentDate.getFullYear()}-${String(
          currentDate.getMonth() + 1
        ).padStart(2, "0")}`
      )
    )
    .reduce((sum, event) => sum + event.amount, 0);

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 -mx-4 px-4 py-3 border-b border-gray-200">
        <Breadcrumb customItems={getBreadcrumbItems()} />
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dividend Payment Calendar</h1>
          <p className="text-gray-600">Track upcoming dividend payments</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            Total Dividends This Month
          </div>
          <div className="text-2xl font-bold text-green-600">
            ${totalDividendAmount.toFixed(2)}
          </div>
        </div>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => navigateMonth("prev")}>
            ← Previous
          </Button>
          <h2 className="text-xl font-semibold">{monthName}</h2>
          <Button variant="outline" onClick={() => navigateMonth("next")}>
            Next →
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-2 text-center font-semibold text-gray-600 text-sm"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} className="h-24"></div>
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dividends = getDividendsForDate(day);
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === currentDate.getMonth() &&
              new Date().getFullYear() === currentDate.getFullYear();

            return (
              <div
                key={day}
                className={`h-24 border border-gray-200 p-1 ${
                  isToday ? "bg-blue-50 border-blue-300" : ""
                }`}
              >
                <div
                  className={`text-sm font-medium ${
                    isToday ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-1 mt-1">
                  {dividends.slice(0, 2).map((dividend, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded truncate"
                      title={`${dividend.companyName}: $${dividend.amount}`}
                    >
                      {dividend.ticker} ${dividend.amount}
                    </div>
                  ))}
                  {dividends.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dividends.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">
          Upcoming Dividend Payments
        </h3>
        <div className="space-y-3">
          {mockDividendEvents
            .filter((event) => new Date(event.payDate) >= new Date())
            .sort(
              (a, b) =>
                new Date(a.payDate).getTime() - new Date(b.payDate).getTime()
            )
            .slice(0, 8)
            .map((dividend, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
              >
                <div>
                  <div className="font-semibold">
                    {dividend.companyName} ({dividend.ticker})
                  </div>
                  <div className="text-sm text-gray-600">{dividend.sector}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    ${dividend.amount}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(dividend.payDate)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Dividend Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {
                mockDividendEvents.filter(
                  (e) => new Date(e.payDate) >= new Date()
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Upcoming Payments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              $
              {mockDividendEvents
                .reduce((sum, e) => sum + e.amount, 0)
                .toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Annual Dividends</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(mockDividendEvents.map((e) => e.sector)).size}
            </div>
            <div className="text-sm text-gray-600">Sectors Represented</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
