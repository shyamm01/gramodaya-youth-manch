"use client";

/**
 * /education — categories and their schemes, served by GET /api/education.
 *
 * Content is database-backed (see src/lib/education), so there is no bundled
 * copy to fall back on: a failed request shows the error and a retry rather
 * than pretending stale content is live.
 */

import React, { useCallback, useEffect, useState } from "react";
import { GraduationCap, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useApp } from "../../context/AppContext";
import { Card, Button } from "../ui";
import { DynamicIcon } from "../common";
import {
  categoryName,
  fetchEducationTree,
  resourceCtaLabel,
  resourceDescription,
  resourceTitle,
} from "@/src/lib/education/client";
import type { EducationCategory } from "@/src/types";

const INITIAL_VISIBLE = 4;

export const EducationSection: React.FC = () => {
  const { t, lang } = useApp();

  const [categories, setCategories] = useState<EducationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isStale?: () => boolean) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEducationTree();
      if (isStale?.()) return;
      setCategories(result);
    } catch (err: any) {
      if (isStale?.()) return;
      setError(err?.message || t("education.loadError"));
    } finally {
      if (!isStale?.()) setLoading(false);
    }
    // t is stable enough for this purpose; re-running on language change would
    // refetch identical rows (the text itself is translated at render time).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The response is ignored rather than aborted on cleanup: aborting made
  // StrictMode's second mount issue a second request, so the network panel
  // showed a cancelled fetch beside the real one.
  useEffect(() => {
    let stale = false;
    load(() => stale);
    return () => {
      stale = true;
    };
  }, [load]);

  return (
    <div className="max-w-7xl mx-auto transition-colors duration-200">
      <div className="relative w-full flex flex-col items-start justify-start mb-6">
        <div className="relative w-full flex items-start justify-start">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 shadow-lg shadow-emerald-500/10 shrink-0">
            <GraduationCap className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="w-full flex flex-col items-start justify-start ml-4">
            <h1 className="text-2xl sm:text-4xl font-black text-[#2C3327] dark:text-white">
              {t("education.title")}
            </h1>
            <p className="text-xs sm:text-sm text-[#8C8675] dark:text-slate-400 leading-relaxed">
              {t("education.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="w-full flex flex-col gap-4">
          {[0, 1, 2].map((row) => (
            <div key={row} className="w-full flex flex-col gap-3">
              <div className="h-4 w-52 rounded-lg bg-[#EFEBE2] dark:bg-slate-800/70 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((cell) => (
                  <div
                    key={cell}
                    className="h-36 rounded-2xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-[#E0DCCF] dark:border-slate-800 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <Card className="p-8 sm:p-10 text-center rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/60 dark:bg-rose-500/5">
          <AlertCircle className="w-10 h-10 text-rose-600 dark:text-rose-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-[#2C3327] dark:text-white mb-1">
            {t("education.loadError")}
          </p>
          <p className="text-xs text-rose-700 dark:text-rose-400 font-mono max-w-xl mx-auto break-words">
            {error}
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => load()}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            {t("education.retry")}
          </Button>
        </Card>
      )}

      {!loading && !error && categories.length === 0 && (
        <Card className="p-10 text-center rounded-2xl border border-dashed border-[#E0DCCF] dark:border-slate-800">
          <p className="text-sm font-bold text-[#2C3327] dark:text-white mb-1">
            {t("education.emptyTitle")}
          </p>
          <p className="text-xs text-[#8C8675] dark:text-slate-400">
            {t("education.emptyBody")}
          </p>
        </Card>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="w-full flex flex-col gap-4 items-start justify-start">
          {categories.map((category) => {
            const visibleItems = (category.resources || []).slice(0, INITIAL_VISIBLE);
            if (visibleItems.length === 0) return null;

            return (
              <section key={category.id} className="w-full flex flex-col gap-3">
                <div className="w-full flex justify-between items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-[#2C3327] dark:text-white flex items-center gap-2 px-1 min-w-0 leading-snug">
                    <DynamicIcon
                      name={category.icon}
                      fallbackIcon="GraduationCap"
                      className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                    />
                    <span>{categoryName(t, lang, category)}</span>
                  </h2>

                  <Link
                    href={`/education/${category.slug}`}
                    className="flex items-center gap-1.5 shrink-0 whitespace-nowrap px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
                  >
                    <span>{t("common.showMore")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {visibleItems.map((item) => (
                    <Card key={item.id} className="p-4 sm:p-5 flex flex-col gap-3 h-full">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
                          <DynamicIcon name={item.icon} className="size-5 text-white" />
                        </div>

                        <Link
                          href={`/education/${category.slug}/${item.slug}`}
                          className="min-w-0 text-xs sm:text-sm font-bold text-[#2C3327] dark:text-white line-clamp-2 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
                        >
                          {resourceTitle(t, lang, item)}
                        </Link>
                      </div>

                      <p className="text-[11px] sm:text-xs text-[#8C8675] dark:text-slate-400 leading-relaxed line-clamp-2">
                        {resourceDescription(t, lang, item)}
                      </p>

                      <Link
                        href={`/education/${category.slug}/${item.slug}`}
                        className="w-full mt-auto"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-xl font-bold text-[11px] cursor-pointer"
                        >
                          <span>{resourceCtaLabel(t, lang, item)}</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
