"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";

export default function SearchMedicinePage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // debounce: user jo type kare usko 400ms baad search karo
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  // jab debouncedQuery change ho, API se data lao
  useEffect(() => {
    const fetchData = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(
          `/api/pharmacies/search-medicine?q=${encodeURIComponent(
            debouncedQuery
          )}`
        );
        const data = await res.json();
        setResults(data || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedQuery]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5" />
        <h1 className="text-2xl font-bold">Search Medicines near you</h1>
      </div>

      {/* Search box */}
      <div className="relative">
        <Input
          placeholder="Search medicine (e.g. Dolo 650, Paracetamol)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Searching nearby pharmacies...</span>
        </div>
      )}

      {/* No query yet */}
      {!loading && !debouncedQuery && (
        <p className="text-sm text-muted-foreground">
          Type at least 2 characters to search medicines available in nearby
          medical stores.
        </p>
      )}

      {/* No results */}
      {!loading && debouncedQuery && results.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No medicines found for <span className="font-semibold">
            {debouncedQuery}
          </span>
          .
        </p>
      )}

      {/* Results */}
      <div className="space-y-4">
        {results.map((med) => (
          <Card key={med.id} className="border border-border/70">
            <CardHeader>
              <CardTitle className="flex flex-col gap-1">
                <span>{med.name}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {med.salt && <span>Salt: {med.salt} • </span>}
                  {med.company && <span>Brand: {med.company}</span>}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {med.stocks && med.stocks.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Available at:</p>
                  <ul className="space-y-2 text-sm">
                    {med.stocks.slice(0, 4).map((stock) => (
                      <li
                        key={stock.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-md px-3 py-2"
                      >
                        <div>
                          <div className="font-medium">
                            {stock.pharmacy?.name || "Unknown pharmacy"}
                          </div>
                          {stock.pharmacy?.address && (
                            <div className="text-xs text-muted-foreground">
                              {stock.pharmacy.address}
                            </div>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-right mt-1 sm:mt-0">
                          <div>
                            Qty:{" "}
                            <span className="font-semibold">
                              {stock.quantity}
                            </span>
                          </div>
                          {typeof stock.price === "number" && (
                            <div>
                              approx. ₹
                              <span className="font-semibold">
                                {stock.price}
                              </span>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {med.stocks.length > 4 && (
                    <p className="text-xs text-muted-foreground">
                      + {med.stocks.length - 4} more pharmacies...
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Not in stock in your nearby pharmacies.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
