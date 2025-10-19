"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Breadcrumb from "@/components/layout/Breadcrumb";

interface ExDividendEvent {
  ticker: string;
  companyName: string;
  amount: number;
  exDate: string;
  payDate: string;
  sector: string;
  yield: number;
}

export default function ExDividendCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">(
    "week"
  );

  const mockExDividendEvents: ExDividendEvent[] = [
    {
      ticker: "AAPL",
      companyName: "Apple Inc.",
      amount: 0.24,
      exDate: "2024-11-11",
      payDate: "2024-11-14",
      sector: "Technology",
      yield: 0.52,
    },
    {
      ticker: "MSFT",
      companyName: "Microsoft Corporation",
      amount: 0.75,
      exDate: "2024-11-11",
      payDate: "2024-11-14",
      sector: "Technology",
      yield: 0.8,
    },
    {
      ticker: "JNJ",
      companyName: "Johnson & Johnson",
      amount: 1.13,
      exDate: "2024-11-09",
      payDate: "2024-11-12",
      sector: "Healthcare",
      yield: 2.9,
    },
    {
      ticker: "PG",
      companyName: "Procter & Gamble",
      amount: 0.91,
      exDate: "2024-11-12",
      payDate: "2024-11-15",
      sector: "Consumer Goods",
      yield: 2.4,
    },
    {
      ticker: "KO",
      companyName: "The Coca-Cola Company",
      amount: 0.48,
      exDate: "2024-11-12",
      payDate: "2024-11-15",
      sector: "Consumer Goods",
      yield: 3.1,
    },
    {
      ticker: "JPM",
      companyName: "JPMorgan Chase & Co.",
      amount: 1.15,
      exDate: "2024-11-27",
      payDate: "2024-11-30",
      sector: "Financial Services",
      yield: 2.1,
    },
    {
      ticker: "V",
      companyName: "Visa Inc.",
      amount: 0.52,
      exDate: "2024-11-30",
      payDate: "2024-12-03",
      sector: "Financial Services",
      yield: 0.7,
    },
    {
      ticker: "UNH",
      companyName: "UnitedHealth Group",
      amount: 2.1,
      exDate: "2024-12-14",
      payDate: "2024-12-17",
      sector: "Healthcare",
      yield: 1.2,
    },
    {
      ticker: "HD",
      companyName: "The Home Depot Inc.",
      amount: 2.09,
      exDate: "2024-11-18",
      payDate: "2024-12-12",
      sector: "Retail",
      yield: 2.3,
    },
    {
      ticker: "WMT",
      companyName: "Walmart Inc.",
      amount: 0.57,
      exDate: "2024-11-25",
      payDate: "2025-01-02",
      sector: "Retail",
      yield: 2.9,
    },
  ];

  const getBreadcrumbItems = () => [
    { label: "Tools", href: "/tools" },
    { label: "Ex-Dividend Calendar", active: true },
  ];

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

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

  const getExDividendsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return mockExDividendEvents.filter((event) => event.exDate === dateString);
  };

  const navigatePeriod = (direction: "prev" | "next") => {
    if (selectedPeriod === "week") {
      setCurrentDate(
        new Date(
          currentDate.getTime() +
            (direction === "next" ? 7 : -7) * 24 * 60 * 60 * 1000
        )
      );
    } else {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + (direction === "next" ? 1 : -1),
          1
        )
      );
    }
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    const weekStart = weekDates[0].toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    const weekEnd = weekDates[6].toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => navigatePeriod("prev")}>
            ← Previous Week
          </Button>
          <h2 className="text-xl font-semibold">
            {weekStart} - {weekEnd}
          </h2>
          <Button variant="outline" onClick={() => navigatePeriod("next")}>
            Next Week →
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => {
            const exDividends = getExDividendsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const dayName = date.toLocaleDateString("en-US", {
              weekday: "short",
            });
            const dayNumber = date.getDate();

            return (
              <div
                key={index}
                className={`border border-gray-200 rounded-lg p-3 min-h-32 ${
                  isToday ? "bg-blue-50 border-blue-300" : ""
                }`}
              >
                <div
                  className={`text-center mb-2 ${
                    isToday ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  <div className="font-semibold">{dayName}</div>
                  <div className="text-lg">{dayNumber}</div>
                </div>
                <div className="space-y-1">
                  {exDividends.map((dividend, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
                      title={`${dividend.companyName}: $${dividend.amount} (${dividend.yield}% yield)`}
                    >
                      <div className="font-semibold">{dividend.ticker}</div>
                      <div>${dividend.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const monthName = currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => navigatePeriod("prev")}>
            ← Previous Month
          </Button>
          <h2 className="text-xl font-semibold">{monthName}</h2>
          <Button variant="outline" onClick={() => navigatePeriod("next")}>
            Next Month →
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
            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            );
            const exDividends = getExDividendsForDate(date);
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
                  {exDividends.slice(0, 2).map((dividend, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded truncate"
                      title={`${dividend.companyName}: $${dividend.amount}`}
                    >
                      {dividend.ticker} ${dividend.amount}
                    </div>
                  ))}
                  {exDividends.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{exDividends.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 -mx-4 px-4 py-3 border-b border-gray-200">
        <Breadcrumb customItems={getBreadcrumbItems()} />
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ex-Dividend Calendar</h1>
          <p className="text-gray-600">
            Track ex-dividend dates to plan your investments
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === "week" ? "primary" : "outline"}
            onClick={() => setSelectedPeriod("week")}
          >
            Week View
          </Button>
          <Button
            variant={selectedPeriod === "month" ? "primary" : "outline"}
            onClick={() => setSelectedPeriod("month")}
          >
            Month View
          </Button>
        </div>
      </div>

      <Card>
        {selectedPeriod === "week" ? renderWeekView() : renderMonthView()}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">
            Upcoming Ex-Dividend Dates
          </h3>
          <div className="space-y-3">
            {mockExDividendEvents
              .filter((event) => new Date(event.exDate) >= new Date())
              .sort(
                (a, b) =>
                  new Date(a.exDate).getTime() - new Date(b.exDate).getTime()
              )
              .slice(0, 6)
              .map((dividend, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <div className="font-semibold">
                      {dividend.companyName} ({dividend.ticker})
                    </div>
                    <div className="text-sm text-gray-600">
                      {dividend.sector} • {dividend.yield}% yield
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">
                      ${dividend.amount}
                    </div>
                    <div className="text-sm text-gray-600">
                      Ex: {formatDate(dividend.exDate)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Ex-Dividend Tips</h3>
          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-1">
                What is Ex-Dividend Date?
              </h4>
              <p className="text-sm text-yellow-700">
                The ex-dividend date is when a stock begins trading without the
                dividend. You must own the stock before this date to receive the
                dividend.
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-1">
                Planning Strategy
              </h4>
              <p className="text-sm text-blue-700">
                Buy stocks at least one business day before the ex-dividend date
                to be eligible for the dividend payment.
              </p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-1">
                Price Impact
              </h4>
              <p className="text-sm text-green-700">
                Stock prices typically drop by the dividend amount on the
                ex-dividend date, reflecting the dividend distribution.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Ex-Dividend Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {
                mockExDividendEvents.filter(
                  (e) => new Date(e.exDate) >= new Date()
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Upcoming Ex-Dates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {
                mockExDividendEvents.filter((e) => {
                  const today = new Date();
                  const exDate = new Date(e.exDate);
                  const diffTime = exDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays >= 0 && diffDays <= 7;
                }).length
              }
            </div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {(
                mockExDividendEvents.reduce((sum, e) => sum + e.yield, 0) /
                mockExDividendEvents.length
              ).toFixed(1)}
              %
            </div>
            <div className="text-sm text-gray-600">Average Yield</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              $
              {(
                mockExDividendEvents.reduce((sum, e) => sum + e.amount, 0) /
                mockExDividendEvents.length
              ).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Average Dividend</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
