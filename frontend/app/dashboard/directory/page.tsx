"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { directoryApi, Church } from "@/lib/directory-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Phone,
  Globe,
  Mail,
  User,
  Users,
  Church as ChurchIcon,
  Map,
} from "lucide-react";

export default function DirectoryPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [query, setQuery] = useState("");
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await directoryApi.search(q);
      setChurches(res.data);
    } catch {
      setChurches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) search("");
  }, [isAuthenticated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search(query);
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          Church Directory
        </h2>
        <p className="text-muted-foreground">
          Browse and connect with churches
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, city, or state..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {churches.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ChurchIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {query ? "No churches found matching your search." : "No churches in the directory yet."}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {churches.map((church) => (
          <Card
            key={church.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => toggleExpand(church.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  {church.logoUrl ? (
                    <img
                      src={church.logoUrl}
                      alt={church.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <ChurchIcon className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{church.name}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {church.city}, {church.state}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                {church.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{church.address}</span>
                  </div>
                )}
                {church.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{church.phone}</span>
                  </div>
                )}
                {church.website && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    <a
                      href={church.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {church.website}
                    </a>
                  </div>
                )}
              </div>

              {expandedId === church.id && (
                <div className="border-t pt-3 space-y-2 text-sm">
                  {church.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span>{church.email}</span>
                    </div>
                  )}
                  {church.pastorName && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span>Pastor: {church.pastorName}</span>
                    </div>
                  )}
                  {church.memberCount > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>{church.memberCount} members</span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (church.latitude && church.longitude) {
                        window.open(
                          `https://www.google.com/maps?q=${church.latitude},${church.longitude}`,
                          "_blank"
                        );
                      }
                    }}
                  >
                    <Map className="h-4 w-4" />
                    View on Map
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
