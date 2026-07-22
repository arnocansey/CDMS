"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: "SERVICE" | "MEETING" | "SOCIAL" | "SPECIAL";
  description?: string;
  location?: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  view: "month" | "week" | "day";
}

const EVENT_COLORS: Record<string, string> = {
  SERVICE: "bg-blue-500",
  MEETING: "bg-green-500",
  SOCIAL: "bg-yellow-500",
  SPECIAL: "bg-purple-500",
};

const EVENT_DOTS: Record<string, string> = {
  SERVICE: "bg-blue-500",
  MEETING: "bg-green-500",
  SOCIAL: "bg-yellow-500",
  SPECIAL: "bg-purple-500",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function Calendar({ events, onDateClick, onEventClick, view }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((event) => {
      const key = event.date.split("T")[0];
      if (!map[key]) map[key] = [];
      map[key].push(event);
    });
    return map;
  }, [events]);

  const monthLabel = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  if (view === "month") {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const cells: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{monthLabel}</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {DAYS.map((day) => (
            <div
              key={day}
              className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="bg-background p-2 min-h-[80px]" />;
            }
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = isSameDay(new Date(year, month, day), today);

            return (
              <div
                key={i}
                className={cn(
                  "bg-background p-2 min-h-[80px] cursor-pointer hover:bg-muted/50 transition-colors",
                  isToday && "bg-primary/5"
                )}
                onClick={() => onDateClick?.(new Date(year, month, day))}
              >
                <span
                  className={cn(
                    "text-sm font-medium",
                    isToday && "bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center"
                  )}
                >
                  {day}
                </span>
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "text-xs text-white px-1.5 py-0.5 rounded truncate cursor-pointer",
                        EVENT_COLORS[event.type] || "bg-gray-500"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === "week") {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDays.push(d);
    }

    const weekStart = weekDays[0].toLocaleDateString("default", { month: "short", day: "numeric" });
    const weekEnd = weekDays[6].toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" });

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {weekStart} - {weekEnd}
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() - 7);
              setCurrentDate(d);
            }}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() + 7);
              setCurrentDate(d);
            }}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-8 gap-px bg-border rounded-lg overflow-hidden text-xs">
          <div className="bg-muted p-2" />
          {weekDays.map((d, i) => {
            const isToday = isSameDay(d, today);
            return (
              <div
                key={i}
                className={cn(
                  "bg-muted p-2 text-center font-medium",
                  isToday && "bg-primary text-primary-foreground"
                )}
              >
                <div>{DAYS[d.getDay()]}</div>
                <div className="text-lg">{d.getDate()}</div>
              </div>
            );
          })}
          {Array.from({ length: 14 }, (_, i) => i + 7).map((hour) => (
            <>
              <div key={`label-${hour}`} className="bg-background p-2 text-muted-foreground text-right">
                {formatHour(hour)}
              </div>
              {weekDays.map((d, di) => {
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                const dayEvents = (eventsByDate[dateStr] || []).filter((e) => {
                  if (!e.startTime) return hour === 9;
                  const h = parseInt(e.startTime.split(":")[0], 10);
                  return h === hour;
                });
                return (
                  <div
                    key={`${hour}-${di}`}
                    className="bg-background p-1 min-h-[40px] border-t"
                    onClick={() => onDateClick?.(d)}
                  >
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-[10px] text-white px-1 py-0.5 rounded truncate cursor-pointer",
                          EVENT_COLORS[event.type] || "bg-gray-500"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    );
  }

  // Day view
  const dayEvents = eventsByDate[
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`
  ] || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {currentDate.toLocaleDateString("default", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => {
            const d = new Date(currentDate);
            d.setDate(d.getDate() - 1);
            setCurrentDate(d);
          }}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => {
            const d = new Date(currentDate);
            d.setDate(d.getDate() + 1);
            setCurrentDate(d);
          }}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-px bg-border rounded-lg overflow-hidden">
        {Array.from({ length: 14 }, (_, i) => i + 7).map((hour) => {
          const hourEvents = dayEvents.filter((e) => {
            if (!e.startTime) return hour === 9;
            const h = parseInt(e.startTime.split(":")[0], 10);
            return h === hour;
          });
          return (
            <div key={hour} className="flex bg-background">
              <div className="w-20 p-2 text-xs text-muted-foreground text-right border-r">
                {formatHour(hour)}
              </div>
              <div className="flex-1 p-2 min-h-[60px]">
                {hourEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "text-sm text-white px-2 py-1 rounded cursor-pointer mb-1",
                      EVENT_COLORS[event.type] || "bg-gray-500"
                    )}
                    onClick={() => onEventClick?.(event)}
                  >
                    {event.title}
                    {event.startTime && (
                      <span className="ml-2 opacity-75">{event.startTime}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
