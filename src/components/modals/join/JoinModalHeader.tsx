"use client";

import React from "react";
import { X } from "lucide-react";
import { GymLogo } from "../../common/GymLogo";
import { useApp } from "../../../context/AppContext";
import { cn } from "@/src/lib/utils";

interface JoinModalHeaderProps {
  currentStep: 1 | 2 | 3;
  onClose: () => void;
}

export const JoinModalHeader: React.FC<JoinModalHeaderProps> = ({
  currentStep,
  onClose,
}) => {
  const { t, lang } = useApp();
  const isEn = lang === "en";

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return isEn
          ? "Step 1: Account Registration & Credentials"
          : "चरण १: खाता पंजीकरण एवं लॉगिन विवरण";
      case 2:
        return isEn
          ? "Step 2: Basic Personal & Village Details"
          : "चरण २: मूल व्यक्तिगत एवं ग्राम विवरण";
      case 3:
        return isEn
          ? "Membership request submitted for verification"
          : "सदस्यता आवेदन सत्यापन हेतु जमा हो चुका है";
    }
  };

  return (
    <>
      {/* Header Container */}
      <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex-shrink-0">
            <GymLogo size={32} variant="icon" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-stone-900 dark:text-white leading-none">
                {isEn ? 'Join Organization' : 'संगठन से जुड़ें'}
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-normal">
              {getStepSubtitle()}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar for Steps 1 & 2 */}
      {currentStep !== 3 && (
        <div className="grid grid-cols-2 gap-1.5 px-6 pt-3">
          <div
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              currentStep >= 1
                ? "bg-amber-600 dark:bg-amber-500"
                : "bg-stone-200 dark:bg-stone-800"
            )}
          />
          <div
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              currentStep >= 2
                ? "bg-amber-600 dark:bg-amber-500"
                : "bg-stone-200 dark:bg-stone-800"
            )}
          />
        </div>
      )}
    </>
  );
};
