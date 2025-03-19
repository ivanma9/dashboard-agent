"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { UserPlus, UserMinus, UserCog, CalendarIcon } from "lucide-react";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { PieChartComponent } from "./PieChartComponent";
import { CompareBarComponent } from "./CompareBarComponent";
export default function DashboardComponent() {
  const [analytics, setAnalytics] = useState({ created: 0, deleted: 0, modified: 0 });
  const [todayAnalytics, setTodayAnalytics] = useState({ created: 0, deleted: 0, modified: 0 });
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  useEffect(() => {
    const fetchTodayAnalytics = async () => {
      try {
        const today = {from: new Date(), to: new Date()};
        const response = await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ date: today }),
        });
        const data = await response.json();
        console.log(data);
        setTodayAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchTodayAnalytics();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ date }),
        });
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, [date]);

  return (
    <div className="flex flex-col space-y-6 p-6 max-w-7xl mx-auto">
      <div className="w-full flex flex-row items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
          })}
        </h1>
        <Link href="/admin">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-lg hover:bg-blue-700 transition-colors duration-200">
            Admin User Management
          </button>
        </Link>
      </div>

      <div className="flex space-x-4">
        <Popover>
            <PopoverTrigger asChild>
            <Button
                id="date"
                variant={"outline"}
                className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
                )}
            >
                <CalendarIcon />
                {date?.from ? (
                date.to ? (
                    <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                    </>
                ) : (
                    format(date.from, "LLL dd, y")
                )
                ) : (
                <span>Pick a date</span>
                )}
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // Set time to the start of today
                      return date > today;
                    }}
                />
            </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users Created</CardTitle>
            <UserPlus className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{analytics.created ? analytics.created : 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users Deleted</CardTitle>
            <UserMinus className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{analytics.deleted ? analytics.deleted : 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users Modified</CardTitle>
            <UserCog className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{analytics.modified ? analytics.modified : 0}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2 h-96"> 
        <PieChartComponent chartData={[
            { label: 'Created', value: analytics.created },
            { label: 'Deleted', value: analytics.deleted },
            { label: 'Modified', value: analytics.modified },
        ]} />
        <CompareBarComponent chartData={[
            { day: `${format(date?.from || new Date(), "LLL dd, y")} - ${format(date?.to || new Date(), "LLL dd, y")}`, created: analytics.created, deleted: analytics.deleted, modified: analytics.modified },
            { day: "today", created: todayAnalytics.created, deleted: todayAnalytics.deleted, modified: todayAnalytics.modified },
        ]} selectedDates={`${format(date?.from || new Date(), "LLL dd, y")} - ${format(date?.to || new Date(), "LLL dd, y")}`} />
      </div>
    </div>
  );
}
